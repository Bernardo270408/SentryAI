from models.message_user import UserMessage
from extensions import db
from sqlalchemy import asc

class UserMessageDAO:

    @staticmethod
    def create_message(user_id, chat_id, content, created_at=None):
        message = UserMessage(user_id=user_id, chat_id=chat_id, content=content)
        if created_at:
            message.created_at = created_at

        db.session.add(message)
        db.session.commit()
        return message

    @staticmethod
    def get_message_by_id(message_id):
        return UserMessage.query.get(message_id)

    @staticmethod
    def get_messages_by_user(user_id):
        return UserMessage.query.filter_by(user_id=user_id).order_by(asc(UserMessage.created_at)).all()

    @staticmethod
    def get_messages_by_chat(chat_id):
        return UserMessage.query.filter_by(chat_id=chat_id).order_by(asc(UserMessage.created_at)).all()

    @staticmethod
    def get_all_messages():
        return UserMessage.query.order_by(asc(UserMessage.created_at)).all()

    @staticmethod
    def update_message(message_id, data):
        message = UserMessageDAO.get_message_by_id(message_id)
        if not message:
            return None

        # remover campos que não podem ser alterados
        data.pop("id", None)
        data.pop("user_id", None)
        data.pop("chat_id", None)
        data.pop("created_at", None)

        message.update_from_dict(data)
        db.session.commit()

        return message

    @staticmethod
    def delete_message(message_id):
        message = UserMessageDAO.get_message_by_id(message_id)
        if not message:
            return False
        db.session.delete(message)
        db.session.commit()
        return True