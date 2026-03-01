# rodar servidor: "fastapi dev main.py" ou "uvicorn main:app --reload"

from fastapi import FastAPI, HTTPException, Depends, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

import models, schemas, database
import authentication as auth

# inicia banco de dados(usando os outros arquivos) e api
models.Base.metadata.create_all(bind=database.engine)
app = FastAPI(title="TO-DO list API")

# cria sessão temporaria do banco de dados
def get_db():
    db = database.SessionLocal()
    try:
        #yield cria uma nova sessão sempre que for chamado. return retornaria a mesma sessão
        yield db 
    finally:
        db.close()

# esquema de autenticação que diz ao fastAPI que o token pro login é na rota /login
oauth2_scheme = OAuth2PasswordBearer("login")

# verificação do tokenJWT do usuário
def get_current_user(token: str = Depends(oauth2_scheme), 
                     db: Session = Depends(get_db)):
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Crachá de credenciais inválido ou expirado",
        headers={"WWW-Authenticate": "Bearer"})

    # tenta ler o token com a chave da API, sobe erro se o token estiver errado ou não tiver email no cabeçalho
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, auth.ALGORITHM)
        email: str = payload.get("sub")

        if email == None:
            raise credential_exception
    except JWTError:
        raise credential_exception
    
    # se o token for valido, busca o usuário dono do email
    user = db.query(models.User).filter(models.User.email == email).first()


# rotas da API
@app.get("/")
def home():
    """Rota publica de teste pra API"""
    return {"message": "API de tarefas rodando."}

@app.post("/login")
def login(data: UserLogin):
    """(teste) Recebe email e senha. se for 'admin' e '123' devolve o token fake"""
    if data.email == "admin@email.com" and data.password == '123':
        return {"token": "Exemplo-token-123", "type": "bearer"}
    else:
        raise HTTPException(status_code=401, detail="Wrong email or password")
    
@app.get("/tasks", response_model= List[Task])
def list_tasks(token: str = "Exemplo-token-123"):
    """só mostra as tarefas se tiver o token, tornando a rota protegida
    (por ser só um teste de estrutura, estou pedindo o token como parametro de proteção)"""
    # verificação (no futura vai ser automática com Depends)    
    if token != "Exemplo-token-123":
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    return task_bank

@app.post("/tasks")
def create_task(task: Task, token: str = "Exemplo-token-123"):
    """Rota protegida. Cria uma tarefa na lista"""
    if token != "Exemplo-token-123":
        raise HTTPException(status_code=401, detail="Unauthoraized")
    
    # salva a tarefa (lógica só pra teste)
    new_task = task.model_dump()
    new_task["id"] = len(task_bank) + 1
    task_bank.append(new_task)

    return {"mensagem": "Tarefa criada", "tarefa": new_task}