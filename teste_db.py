from database import engine, Base
import models # importar os modelos pra Base enxergar eles

print("Criando banco de dados")

# pega os models e constrói as tabelas localmente no HD 
Base.metadata.create_all(bind=engine)

print("Tabelas criadas com sucesso")