from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
# rodar servidor: "fastapi dev main.py" ou "uvicorn main:app --reload"
# O CÓDIGO NO MOMENTO É APENAS UM ESBOÇO MUITO SIMPLES
app = FastAPI()

# Modelo de dados, (pro schemas.py)
# pra o fastAPI saber o que esperar do usuári oe o que devolver
class UserLogin(BaseModel):
    email: str
    password: str

class Task(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    done: bool = False

# banco de dados, (que vai ser substituido pelo SQLAlchemy)
task_bank = []

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