from models import AIMessage
from sqlalchemy import asc
from sqlalchemy.orm import Session


class AIMessageRepo:
    @staticmethod
    def create_message(db: Session, chat_id: int, content: str, created_at: str, model: str):
        message = AIMessage(
            chat_id=chat_id,
            content=content,
            model=model,
            created_at=created_at
        )

        db.add(message)
        db.commit()
        db.refresh(message)
        return message

    @staticmethod
    def get_message_by_id(db: Session, message_id: int):
        return db.get(AIMessage, message_id)

    @staticmethod
    def get_messages_by_chat(db: Session, chat_id: int):
        return (
            db.query(AIMessage)
            .filter(AIMessage.chat_id == chat_id)
            .order_by(asc(AIMessage.created_at))
            .all()
        )

    @staticmethod
    def get_messages_by_model(db: Session, model_name: str):
        return (
            db.query(AIMessage)
            .filter(AIMessage.model == model_name)
            .order_by(asc(AIMessage.created_at))
            .all()
        )

    @staticmethod
    def get_messages_by_chat_and_model(db: Session, chat_id: int, model_name: str):
        return (
            db.query(AIMessage)
            .filter(
                AIMessage.chat_id == chat_id,
                AIMessage.model == model_name
            )
            .order_by(asc(AIMessage.created_at))
            .all()
        )

    @staticmethod
    def get_all_messages(db: Session):
        return (
            db.query(AIMessage)
            .order_by(asc(AIMessage.created_at))
            .all()
        )

    @staticmethod
    def update_message(db: Session, message_id: int, data: dict):
        message = AIMessageRepo.get_message_by_id(db, message_id)
        if not message:
            return None

        for k, v in data.items():
            if hasattr(message,k):
                setattr(message, k, v)

        db.commit()
        db.refresh(message)
        return message

    @staticmethod
    def delete_message(db: Session, message_id: int):
        message = AIMessageRepo.get_message_by_id(db, message_id)
        if not message:
            return False

        db.delete(message)
        db.commit()
        return True
