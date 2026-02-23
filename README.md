Uma API de gerenciamento de tarefas (To-Do List) desenvolvida com FastAPI para colocar em prática conceitos de autenticação, segurançae uso de API em Python.

- Funcionalidades principais:

    Cadastro de Usuários: Criação de conta com armazenamento de senhas com hashing

    Autenticação JWT: Sistema de login que gera um token JWT de acesso para sessões seguras.

    CRUD de Tarefas: Criar, ler, editar e excluir tarefas.

    Proteção de Rotas: Apenas usuários autenticados podem interagir com a API.

    Isolamento de Dados: Filtro para que o usuário veja apenas as suas próprias tarefas.

- Bibliotecas utilizadas:

    Python 3.13

    FastAPI (Framework web)

    uvicorn (servidor web ASGI para requisições HTTP)

    Pydantic (Validação de dados)

    passlib[bcrypt] (segurança das senhas por hashing)

    python-jose[cryptography] (Token JWT)

    python-multipart (Permite requisições form-data prao FastAPI)