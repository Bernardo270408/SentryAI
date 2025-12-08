import jwt
from jwt.exceptions import PyJWTError
from datetime import datetime, timedelta
from fastapi import Header, HTTPException, Depends, status
from sqlalchemy.orm import Session

from config import Settings  
from extensions import get_db
from DAO.user_dao import UserDAO


def generate_token(user, expires_in_hours: int = 48):
    expire = datetime.utcnow() + timedelta(hours=expires_in_hours)

    payload = {
        "sub": user.id,
        "is_admin": user.is_admin,
        "exp": expire
    }

    token = jwt.encode(payload, Settings.SECRET_KEY, algorithm="HS256")
    return token


def decode_token(token: str):
    try:
        payload = jwt.decode(token, Settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except PyJWTError:
        return None

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
        payload = jwt.decode(token, Settings.SECRET_KEY, algorithms=["HS256"])
    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    user = UserDAO.get_user_by_id(db, user_id)
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

def admin_required(user = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return user
