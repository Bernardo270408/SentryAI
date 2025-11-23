from models.message_ai import AIMessage
from extensions import db
from sqlalchemy import asc


class AIMessageDAO:

    @staticmethod
    def create_message(chat_id, content, created_at=None, model=None):
        message = AIMessage(
            chat_id=chat_id,
            content=content,
            model=model
        )

        # Se o streaming passou um created_at específico
        if created_at:
            message.created_at = created_at

        db.session.add(message)
        db.session.commit()
        return message

    @staticmethod
    def get_message_by_id(message_id):
        return AIMessage.query.get(message_id)

    @staticmethod
    def get_messages_by_chat(chat_id):
        return AIMessage.query.filter_by(chat_id=chat_id).order_by(
            asc(AIMessage.created_at)
        ).all()

    @staticmethod
    def get_messages_by_model(model_name):
        return AIMessage.query.filter_by(model=model_name).order_by(
            asc(AIMessage.created_at)
        ).all()

    @staticmethod
    def get_messages_by_chat_and_model(chat_id, model_name):
        return AIMessage.query.filter_by(
            chat_id=chat_id,
            model=model_name
        ).order_by(
            asc(AIMessage.created_at)
        ).all()

    @staticmethod
    def get_all_messages():
        return AIMessage.query.order_by(asc(AIMessage.created_at)).all()

    @staticmethod
    def update_message(message_id, data):
        message = AIMessageDAO.get_message_by_id(message_id)
        if not message:
            return None

        # Campos proibidos
        data.pop("id", None)
        data.pop("chat_id", None)
        data.pop("created_at", None)
        data.pop("updated_at", None)

        message.update_from_dict(data)
        return message

    @staticmethod
    def delete_message(message_id):
        message = AIMessageDAO.get_message_by_id(message_id)
        if not message:
            return False

        db.session.delete(message)
        db.session.commit()
        return True