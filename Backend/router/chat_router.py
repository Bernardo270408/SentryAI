from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List

from extensions import get_db
from repositories import ChatRepo
from models import User
from middleware.jwt_util import get_current_user
from datetime import datetime

chat_router = APIRouter(prefix="/chats", tags=["chats"])

@chat_router.post("/", status_code=201)
async def create_chat(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = await request.json()

    if not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="Payload inválido")

    user_id = data.get("user_id", current_user.id)
    
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Permission denied")

    name = data.get("name")
    if not name:
        name = "Nova Conversa"

    creation = datetime.utcnow()

    chat = ChatRepo.create_chat(
        db=db,
        user_id=user_id,
        name=name,
        rating_id=None,
        created_at=creation
    )

    return chat.to_dict()


# GET /chats/{chat_id} - obter chat por id
@chat_router.get("/{chat_id}")
def get_chat(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chat = ChatRepo.get_chat_by_id(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat não encontrado.")
    
    if chat.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Permission denied")
    return chat.to_dict()


# GET /chats/user/{user_id} - obter chats por usuário
@chat_router.get("/user/{user_id}")
def get_chats_by_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Permission denied")
    chats = ChatRepo.get_chats_by_user(db, user_id)
    return [c.to_dict() for c in chats]


# GET /chats/ - obter todos os chats (apenas admins)
@chat_router.get("/")
def get_all_chats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Permission denied")
    chats = ChatRepo.get_all_chats(db)
    return [c.to_dict() for c in chats]


# PUT /chats/{chat_id} - atualizar chat
@chat_router.put("/{chat_id}")
async def update_chat(
    chat_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = await request.json()
    if not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="Payload inválido")

    chat = ChatRepo.get_chat_by_id(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat não encontrado.")

    if chat.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Permission denied")

    name = data.get("name")
    if name and len(name) > 100:
        raise HTTPException(status_code=400, detail="O campo 'name' deve ter no máximo 100 caracteres.")

    allowed_fields = {"name","rating_id"}
    filtered_data = {k: v for k, v in data.items() if k in allowed_fields}
    filtered_data["updated_at"] = datetime.utcnow()

    updated_chat = ChatRepo.update_chat(db, chat_id, filtered_data)
    if not updated_chat:
        raise HTTPException(status_code=404, detail="Chat não encontrado após atualização.")

    return updated_chat.to_dict()


# DELETE /chats/{chat_id} - deletar chat
@chat_router.delete("/{chat_id}")
def delete_chat(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chat = ChatRepo.get_chat_by_id(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat não encontrado.")

    if chat.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Permission denied")

    success = ChatRepo.delete_chat(db, chat_id)
    if not success:
        raise HTTPException(status_code=500, detail="Erro ao deletar chat.")

    return {"message": "Chat deletado com sucesso."}


# GET /chats/{chat_id}/rating - obter rating do chat
@chat_router.get("/{chat_id}/rating")
def get_rating_by_chat(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chat = ChatRepo.get_chat_by_id(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat não encontrado.")

    if chat.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Permission denied")

    rating = ChatRepo.get_rating_by_chat(db, chat_id)
    if not rating:
        raise HTTPException(status_code=404, detail="Rating não encontrado para este chat.")

    return rating.to_dict()
