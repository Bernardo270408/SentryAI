from models import Chat, UserMessage, AIMessage
from sqlalchemy.orm import Session
from sqlalchemy import asc


class ChatRepo:
    @staticmethod
    def create_chat(db: Session, user_id: int, name: str, rating_id=None, created_at=None) -> Chat:
        chat = Chat(
            user_id=user_id,
            name=name,
            rating_id=rating_id,
            created_at=created_at
        )
        db.add(chat)
        db.commit()
        db.refresh(chat)
        return chat

    @staticmethod
    def get_chat_by_id(db: Session, chat_id: int):
        return db.get(Chat, chat_id)

    @staticmethod
    def get_chats_by_user(db: Session, user_id: int):
        return db.query(Chat).filter(Chat.user_id == user_id).all()

    @staticmethod
    def get_all_chats(db: Session):
        return db.query(Chat).all()

    @staticmethod
    def update_chat(db: Session, chat_id: int, data: dict):
        chat = ChatRepo.get_chat_by_id(db, chat_id)
        if not chat:
            return None

        for k, v in data.items():
            if hasattr(chat, k):
                setattr(chat, k, v)

        db.commit()
        db.refresh(chat)
        return chat

    @staticmethod
    def delete_chat(db: Session, chat_id: int):
        chat = ChatRepo.get_chat_by_id(db, chat_id)
        if not chat:
            return False

        db.delete(chat)
        db.commit()
        return True

    @staticmethod
    def get_messages_formated(db: Session, chat_id: int, limit=20):
        """
        Retorna as mensagens já formatadas (últimas N mensagens de um chat)
        usando janela deslizante.
        """

        chat = ChatRepo.get_chat_by_id(db, chat_id)
        if not chat:
            return []

        # Carregar mensagens direto do banco em ordem (evita carregar tudo em memória)
        user_msgs = (
            db.query(UserMessage)
            .filter(UserMessage.chat_id == chat_id)
            .order_by(asc(UserMessage.created_at))
            .all()
        )

        ai_msgs = (
            db.query(AIMessage)
            .filter(AIMessage.chat_id == chat_id)
            .order_by(asc(AIMessage.created_at))
            .all()
        )

        # Combina e ordena por data
        all_msgs = user_msgs + ai_msgs
        all_msgs.sort(key=lambda m: m.created_at)

        # Janela deslizante
        recent_msgs = all_msgs[-limit:]

        history = []
        for msg in recent_msgs:
            role = "user" if isinstance(msg, UserMessage) else "assistant"
            history.append({"role": role, "content": msg.content})

        return history

    @staticmethod
    def get_rating_by_chat(db: Session, chat_id: int):
        chat = ChatRepo.get_chat_by_id(db, chat_id)
        return chat.rating if chat else None
