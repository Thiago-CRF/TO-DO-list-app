# estruturas de dados usando pydantic
# estruturas que vão ser transportadas pela API em JSON

from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class TaskBase(BaseModel):
# modelo base das tarefas
    title: str
    description: Optional[str] = None
    completed: bool = False

class CreateTask(TaskBase):
# modelo que o usuário envia no POST de tarefas
    pass

class Task(TaskBase):
# modelo que a API devolve ao usuário, com todas as informações
    id: int
    owner_id: int
    
    model_config = ConfigDict(from_attributes=True) 
    # config de conexão com o SQLalchemy, pra ler objetos de banco de dados
    # do mesmo jeito que lê dicionários 

class UserBase(BaseModel):
    email: str

class CreateUser(UserBase):
# criar usuário, envia a senha digitada
    password: str

class User(UserBase):
# modelo de resposta, o que a API devolve quando pede os dados de um usuário especifico
    id: int
    tasks: List[Task] = []

    model_config = ConfigDict(from_attributes=True)

    