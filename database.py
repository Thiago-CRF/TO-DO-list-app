# Banco de dados simples usando SQLAlchemy (arquibo SQlite)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

#muda dependendo do banco de dados usado
SQLALCHEMY_DB_URL = "sqlite:///./todolist.db"

# engine do banco de dados SQlite
# check_same_thread: False, pra o FastAPI não ficar mais lento por conta do SQlite
engine = create_engine(SQLALCHEMY_DB_URL, connect_args={"check_same_thread": False})

#criador de sessões do bd
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# criação da base para usar em models.py
Base = declarative_base()