from sqlalchemy.orm import Session
from models.message_user import UserMessage


class UserMessageRepo:
    @staticmethod
    def create_message(db: Session, user_id: int, chat_id: int, content: str):
        message = UserMessage(
            user_id=user_id,
            chat_id=chat_id,
            content=content
        )

        db.add(message)
        db.commit()
        db.refresh(message)
        return message

    @staticmethod
    def get_message_by_id(db: Session, message_id: int):
        return db.get(UserMessage, message_id)

    @staticmethod
    def get_messages_by_user(db: Session, user_id: int):
        return db.query(UserMessage).filter(UserMessage.user_id == user_id).all()

    @staticmethod
    def get_messages_by_chat(db: Session, chat_id: int):
        return db.query(UserMessage).filter(UserMessage.chat_id == chat_id).all()

    @staticmethod
    def get_all_messages(db: Session):
        return db.query(UserMessage).all()

    @staticmethod
    def update_message(db: Session, message_id: int, data: dict):
        message = UserMessageRepo.get_message_by_id(db, message_id)
        if not message:
            return None

        for k, v in data.items():
            if hasattr(message, k):
                setattr(message, k, v)

        db.commit()
        db.refresh(message)
        return message

    @staticmethod
    def delete_message(db: Session, message_id: int):
        message = UserMessageRepo.get_message_by_id(db, message_id)
        if not message:
            return False

        db.delete(message)
        db.commit()
        return True
