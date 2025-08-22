from models.message_ai import AIMessage
from extensions import db

class AIMessageDAO:
    @staticmethod
    def create_message(chat_id, content, model=None):
        message = AIMessage(chat_id=chat_id, content=content, model=model)
        db.session.add(message)
        db.session.commit()
        return message

    @staticmethod
    def get_message_by_id(message_id):
        return AIMessage.query.get(message_id)

    @staticmethod
    def get_messages_by_chat(chat_id):
        return AIMessage.query.filter_by(chat_id=chat_id).all()

    @staticmethod
    def get_messages_by_model(model_name):
        return AIMessage.query.filter_by(model=model_name).all()

    @staticmethod
    def get_messages_by_chat_and_model(chat_id, model_name):
        return AIMessage.query.filter_by(chat_id=chat_id, model=model_name).all()

    @staticmethod
    def get_all_messages():
        return AIMessage.query.all()

    @staticmethod
    def update_message(message_id, data):
        message = AIMessageDAO.get_message_by_id(message_id)
        if not message:
            return None
        data.pop("id", None)
        data.pop("chat_id", None)
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
