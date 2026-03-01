# regras de segurança e funções que gerenciam e verificam
# o login, senhas e tokens JWT. Usar um .env depois

from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt
import os
from dotenv import load_dotenv

# carrega o arquivo .env e pega a chave, chamando um erro se não achar
# chave de 32 bytes no .env
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("A SECRET_KEY não foi encontrado no .env")

ALGORITHM = "HS256"
ACCESS_JWT_EXPIRE_MIN = 45

# usa o algoritimo bcrypt pra criptografar
pwd_context = CryptContext(schemes=["bcrypt"])

# funções da senha, cria hash da senha, e compara a senha com o hash armazenado
def get_password_hash(password: str):
    return pwd_context.hash(password)
# retorna hash da senha

def verify_password(tried_password: str, hashed: str):
    return pwd_context.verify(tried_password, hashed)
# retorna true ou false, se a senha é a mesma do hash

# criação do token JWT
def create_JWT_token(data: dict, expire_delta: timedelta=None):
    # recebe os dados do usuário(email) e cri uma copia pra não modificar
    # depois cria o token JWT com base no dado do usuário
    to_encode = data.copy()

    # calculo da hora de vencimento do token
    if expire_delta:
        expire = datetime.now(timezone.utc) + expire_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_JWT_EXPIRE_MIN)

    # armazena a validade do token junto dos dados
    to_encode.update({"exp": expire})

    # cria o token usando os dados, chave e algoritimo 
    encoded_JWT = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_JWT
