# TO-DO list API - FastAPI

Uma API de gerenciamento de tarefas (To-Do List) desenvolvida com FastAPI para colocar em prática conceitos de autenticação, segurança uso de API em Python.

## Funcionalidades principais:

- **Cadastro de Usuários:** Criação de conta com armazenamento de senhas com hashing

- **Autenticação JWT:** Sistema de login que gera um token JWT de acesso para sessões seguras.

- **CRUD de Tarefas:** Criar, ler, editar e excluir tarefas.

- **Proteção de Rotas:** Apenas usuários autenticados podem interagir com a API.

- **Isolamento de Dados:** Filtro para que o usuário veja apenas as suas próprias tarefas.

## Bibliotecas utilizadas (Utilizado python 3.13):

- **FastAPI** (Framework web)

- **uvicorn** (servidor web ASGI para requisições HTTP)

- **Pydantic** (Validação de dados para as classes)

- **SQLAlchemy e SQLite** (ORM e Banco de dados simplificado)

- **passlib[bcrypt]** (segurança das senhas por hashing), versão 3.2.2

- **python-jose[cryptography]** (Token JWT)

- **python-multipart** (Permite requisições form-data(da web, pro login) para o FastAPI)

- **python-dotenv** (Para leitura do arquivo .env que tem a chave 32bytes pra autenticação da API)

## Como rodar o projeto localmente

**1. Clone o repositório e entre na pasta:**
```bash
git clone https://github.com/Thiago-CRF/TO-DO-list-app.git
cd TO-DO-list-app
```

**2. Crie e ative um ambiente virtual:**

Rode no terminal:
```bash
python -m venv .venv
```
E depois, no linux ou mac:
```bash
source .venv/bin/activate
```
No Windows:
```bash
.venv\Scripts\activate
```

**3. Instale as dependencias:**
```bash
pip install fastapi uvicorn pydantic sqlalchemy passlib "bcrypt==3.2.2" "python-jose[cryptography]" python-multipart python-dotenv
```

**4. Configure as variáveis de ambiente:**
Crie uma chave rodando no terminal, rodando:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```
Crie um arquivo chamado .env na pasta do projeto e adicione a chave 32 bytes criada dessa forma, sem espaço:
SECRET_KEY="chave_32_bytes_criada"

**5. Inicie o servidor:**
rode no terminal:
```bash
uvicorn main:app --reload
```

E entre na documentação interativa do FastAPI para testar usando o link:
http://127.0.0.1:8000/docs