import jwt
from jwt.exceptions import PyJWTError, ExpiredSignatureError, InvalidTokenError
from datetime import datetime, timedelta
from fastapi import Header, HTTPException, Depends, status
from sqlalchemy.orm import Session

from config import Settings
from extensions import get_db
from repositories import UserRepo

# Garanta que está usando a instância de configurações
settings = Settings 

def generate_token(user, expires_in_hours: int = 48):
    # Use utcnow() para consistência universal
    expire = datetime.utcnow() + timedelta(hours=expires_in_hours)
    
    payload = {
        "sub": str(user.id),  # <--- CRUCIAL: Converta o ID para string
        "exp": expire,
        "iat": datetime.utcnow() # "Issued At" ajuda na validação
    }
    
    # Gera o token usando a chave das configurações
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token

def decode_token(token: str):
    # Adicione algorithms=["HS256"] explicitamente
    return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])

def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required"
        )
    
    parts = authorization.split()
    
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format"
        )
    
    token = parts[1]
    
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: missing sub"
            )
            
    except ExpiredSignatureError:
        # Erro específico para token expirado
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except PyJWTError as e:
        # Imprima o erro no console para debugar
        print(f"\033[31mJWT Error: {str(e)}\033[0m") 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    # Converter string de volta para int se seu DB usa IDs numéricos
    try:
        user_id_int = int(user_id)
    except ValueError:
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject format"
        )

    user = UserRepo.get_user_by_id(db, user_id_int)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    if user.is_banned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User banned: {user.ban_reason or 'no reason provided'}"
        )

    return user