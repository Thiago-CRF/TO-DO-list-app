# rodar servidor: "fastapi dev main.py" ou "uvicorn main:app --reload"

from fastapi import FastAPI, HTTPException
from sqlalchemy.orm import Session

import models, schemas, authentication, database

# inicia banco de dados(usando os outros arquivos) e api
models.Base.metadata.create_all(bind=database.engine)
app = FastAPI()

# cria sessão temporaria do banco de dados
def get_db():
    db = database.SessionLocal()
    try:
        #yield cria uma nova sessão sempre que for chamado. return retornaria a mesma sessão
        yield db 
    finally:
        db.close()

# exemplo de dependencias de segurança,
# (que vai virar o decoder do token JWT real)
def loged_user(token: str):
    if token != "Exemplo-token-123":
        raise HTTPException(status_code=400, detail="Invalid token")
    return {"id": 1, "name": "you"}
    
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