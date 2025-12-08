from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
from werkzeug.security import check_password_hash
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from datetime import datetime
import os

from extensions import get_db
from repositories import UserRepo
from models.user import User
from middleware.jwt_util import generate_token

auth_router = APIRouter(tags=["auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


@auth_router.post("/login")
async def login(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    email = data.get("email")
    password_input = data.get("password", "")

    if not email or not password_input:
        raise HTTPException(400, "Email e senha são obrigatórios")

    user = UserRepo.get_user_by_email(db, email)

    if not user or not user.password or not check_password_hash(user.password, str(password_input)):
        raise HTTPException(401, "Credenciais inválidas")

    # --- BAN ---
    if user.is_banned:
        return {
            "error": "Conta suspensa.",
            "force_logout": True,
            "ban_details": {
                "reason": user.ban_reason or "Violação dos Termos",
                "expires_at": user.ban_expires_at.isoformat() if user.ban_expires_at else None
            }
        }

    # --- VERIFICAÇÃO ---
    if not user.is_verified:
        return {
            "error": "E-mail não verificado.",
            "need_verification": True,
            "email": user.email
        }

    # --- OK ---
    token = generate_token(user)
    user_dict = user.to_dict()
    user_dict.pop("password", None)

    return {"token": token, "user": user_dict}

@auth_router.post("/verify-email")
async def verify_email(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    email = data.get("email")
    code = data.get("code")

    if not email or not code:
        raise HTTPException(400, "Email e código são obrigatórios")

    user = UserRepo.get_user_by_email(db, email)
    if not user:
        raise HTTPException(404, "Usuário não encontrado")

    if user.is_verified:
        return {
            "message": "Usuário já verificado",
            "token": generate_token(user),
            "user": user.to_dict()
        }

    if str(user.verification_code) != str(code):
        raise HTTPException(400, "Código incorreto")

    if user.verification_code_expires_at and user.verification_code_expires_at < datetime.utcnow():
        raise HTTPException(400, "Código expirado. Solicite um novo.")

    user.is_verified = True
    user.verification_code = None
    user.verification_code_expires_at = None

    db.add(user)
    db.commit()
    db.refresh(user)

    token = generate_token(user)

    return {
        "message": "Conta verificada com sucesso!",
        "token": token,
        "user": user.to_dict()
    }

@auth_router.post("/google-login")
async def google_login(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    token_google = data.get("credential")

    if not token_google:
        raise HTTPException(400, "Token do Google não fornecido")

    try:
        idinfo = id_token.verify_oauth2_token(
            token_google,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

        email = idinfo["email"]
        google_id = idinfo["sub"]
        name = idinfo.get("name", "Google User")

        user = UserRepo.get_user_by_email(db, email)

        if not user:
            # Auto-verificado
            user = User(
                name=name,
                email=email,
                password=None,
                google_id=google_id,
                is_verified=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            if user.is_banned:
                raise HTTPException(403, "Conta suspensa permanentemente.")

            changed = False

            if not user.google_id:
                user.google_id = google_id
                changed = True

            if not user.is_verified:
                user.is_verified = True
                changed = True

            if changed:
                db.add(user)
                db.commit()
                db.refresh(user)

        if user.is_banned:
            raise HTTPException(403, "Conta suspensa.")

        token = generate_token(user)
        return {"token": token, "user": user.to_dict()}

    except ValueError as e:
        raise HTTPException(400, f"Token Google inválido: {e}")
