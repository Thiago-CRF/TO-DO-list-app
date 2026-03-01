# rodar servidor: "fastapi dev main.py" ou "uvicorn main:app --reload"

from fastapi import FastAPI, HTTPException, Depends, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
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

# verificação do tokenJWT do usuário, para quando requisitar ou salvar as tarefas na lista
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
    
    # se o token for valido, busca o usuário dono do email e retorna o usuário
    user = db.query(models.User).filter(models.User.email == email).first()

    if user == None:
        raise credential_exception
    return user

# rotas publicas da API

@app.get("/")
def home():
    """Rota publica de teste pra API"""
    return {"message": "API de tarefas rodando."}

# cadastro de usuário
@app.post("/users",response_model=schemas.User)
def create_user(user: schemas.CreateUser, db: Session = Depends(get_db)):
    # cancela a operação e sobe um erro se o email já estiver cadastrado
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(400, "E-mail já cadastrado")
    
    #hash da senha e criação do usuário
    password_hash = auth.get_password_hash(user.password)

    new_user = models.User(email=user.email, hash_password=password_hash)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

#login de usuário
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # busca o usuário com base no email do formulário
    user = db.query(models.User).filter(models.User.email == form_data.username).first()

    # da erro se a senha não bater com o hash ou não achar o usuário
    if not user or not auth.verify_password(form_data.password, user.hash_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            "E-mail ou senha incorretos",
                            {"WWW-Authenticate": "Bearer"})

    acess_token = auth.create_JWT_token(data={"sub": user.email})    
    return {"acess_token": acess_token, "token_type": "bearer"}


# rotas privadas (precisa do tokenJWT)

@app.get("/tasks", response_model=list[schemas.Task])
def list_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # verificação do token JWT feita ao chamar get_current_user, quando define current_user
    # busca todas as tarefas guardadas daquele usuário
    tasks = db.query(models.Task).filter(models.Task.owner_id == current_user.id).all()
    return tasks

@app.post("/tasks")
def create_task(task: schemas.CreateTask, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Rota protegida. Cria uma tarefa na lista, ligada ao ID do usuário logado"""
    # ** antes de task.model_dump() faz com que ele transforme automaticamente 
    # todas as cháves do dicionário em variáveis, quando o model_dump transforma
    # do formato do pydantic em dicionario python padrão
    new_task = models.Task(**task.model_dump(), owner_id=current_user.id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
   
    return new_task