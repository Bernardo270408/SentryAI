from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
from email_validator import validate_email, EmailNotValidError

from config import Settings
from extensions import get_db
from repositories import UserRepo
from models import User
from services.email_service import generate_verification_code, send_verification_email
from middleware.jwt_util import get_current_user

user_router = APIRouter(prefix="/users", tags=["users"])

settings = Settings

# --- Endpoints ---

@user_router.post("/", status_code=201)
async def create_user(request: Request, db: Session = Depends(get_db)):
    data = await request.json()

    # Validação de presença
    if "name" not in data or "email" not in data or "password" not in data:
        raise HTTPException(status_code=400, detail="Campos obrigatórios: name, email, password")

    # Validação de formato de email (como na versão Flask)
    try:
        validate_email(data["email"])
    except EmailNotValidError as e:
        raise HTTPException(status_code=400, detail=f"Email inválido: {str(e)}")

    # Verifica se já existe
    if UserRepo.get_user_by_email(db, data["email"]):
        raise HTTPException(status_code=400, detail="Email já está em uso.")

    password_hash = generate_password_hash(data["password"])

    code = generate_verification_code()
    expiration = datetime.utcnow() + timedelta(minutes=15)
    creation = datetime.utcnow()

    user = User(
        name=data["name"],
        email=data["email"],
        password=password_hash,
        extra_data=data.get("extra_data"),
        is_verified=False,
        verification_code=code,
        verification_code_expires_at=expiration,
        created_at=creation
    )

    created = UserRepo.create_user(db, user)

    # envio de email (mantive chamada direta; considere BackgroundTasks se bloquear)
    send_verification_email(created.email, code)

    return {
        "message": "Usuário criado. Verifique seu e-mail.",
        "email": created.email,
        "need_verification": True,
        "user": created.to_dict(),
    }


@user_router.get("/email/{email}")
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    user = UserRepo.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    return user.to_dict()


@user_router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = UserRepo.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    return user.to_dict()


@user_router.get("/")
def get_all_users(db: Session = Depends(get_db)):
    users = UserRepo.get_all_users(db)
    return [u.to_dict() for u in users]


@user_router.put("/{user_id}", status_code=201)
async def update_user(
    user_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Permission denied")

    data = await request.json()
    if not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="Payload inválido")

    allowed_fields = {
        "name",
        "email",
        "password",
        "extra_data",
        "is_admin",
        "google_id",
        "is_verified",
        "is_banned",
        "ban_reason",
        "ban_expires_at",
        "banned_by_id",
        "appeal_data",
        "risk_profile_score",
        "risk_profile_summary",
        "last_risk_analysis",
        "updated_at"
    }


    data = {k: v for k, v in data.items() if k in allowed_fields}

    # se tentar atualizar sem campos válidos
    if not data:
        raise HTTPException(status_code=400, detail="Nenhum campo válido para atualizar")

    # hashing de senha
    if "password" in data:
        data["password"] = generate_password_hash(data["password"])

    data["updated_at"] = datetime.utcnow()

    user = UserRepo.update_user(db, user_id, data)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    user_dict = user.to_dict()
    user_dict.pop("password", None)
    return user_dict


@user_router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),  # <--- certo
    db: Session = Depends(get_db)
):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Permission denied")

    success = UserRepo.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    return {"message": "Usuário deletado com sucesso."}


@user_router.post("/appeal")
async def submit_appeal(request: Request, db: Session = Depends(get_db)):
    """
    Rota pública para usuários banidos enviarem recurso.
    Valida pelo e-mail cadastrado.
    """
    data = await request.json()
    email = data.get("email")
    message = data.get("message")

    if not email or not message:
        raise HTTPException(status_code=400, detail="Email e mensagem são obrigatórios.")

    user = UserRepo.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="E-mail não encontrado.")

    if not user.is_banned:
        raise HTTPException(status_code=400, detail="Esta conta não está banida.")

    # Salva o recurso como JSON no banco (mesma estrutura do Flask)
    appeal_payload = {
        "message": message,
        "date": datetime.utcnow().isoformat(),
        "status": "pending"
    }

    user.appeal_data = appeal_payload
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "Recurso enviado com sucesso. Aguarde análise de um moderador."}
