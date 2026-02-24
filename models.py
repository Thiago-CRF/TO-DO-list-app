# modelo das tabelas do banco de dados, com as 
# classes(tabelas) User(*ID, email, hash) 
# e Task(*ID, titulo, concluída ou não, ID do usuário dono)

import sqlalchemy as sqla
from sqlalchemy.orm import relationship
# import da base em database.py
from database import Base

# tabela de dados dos usuários
class User(Base):
    # nome da tabela no banco de dados
    __tablename__ = "users"

    #colunas:
    id = sqla.Column(sqla.Integer, primary_key=True, index=True) #indexa a coluna pra busca rapida
    email = sqla.Column(sqla.String, unique=True, index=True, nullable=False)
    hash_password = sqla.Column(sqla.String, nullable=False)

    # relaçao com a tabela de tarefas
    tasks = relationship("Task", back_populates="owner")

class Task(Base):
    __tablename__ = "tasks"

    id = sqla.Column(sqla.Integer, primary_key=True, index=True)
    title = sqla.Column(sqla.String, index=True, nullable=False)
    description = sqla.Column(sqla.String, nullable=True)
    completed = sqla.Column(sqla.Boolean, default=False)
    # conecta com a chave estrangeira da tabela de usuários para saber o dono da nota
    owner_id = sqla.Column(sqla.Integer, sqla.ForeignKey("users.id"))

    # o outro lado ad conexão da relação entre tasks e owner
    owner = relationship("User", back_populates="tasks")