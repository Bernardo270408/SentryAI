from models.chat import Chat
from models.message_user import UserMessage
from models.message_ai import AIMessage
from extensions import db
from sqlalchemy import asc


class ChatDAO:

    @staticmethod
    def create_chat(user_id, name, rating_id=None):
        chat = Chat(user_id=user_id, name=name, rating_id=rating_id)
        db.session.add(chat)
        db.session.commit()
        return chat

    @staticmethod
    def get_chat_by_id(chat_id):
        return Chat.query.get(chat_id)

    @staticmethod
    def get_chats_by_user(user_id):
        return Chat.query.filter_by(user_id=user_id).order_by(
            asc(Chat.created_at)
        ).all()

    @staticmethod
    def get_all_chats():
        return Chat.query.order_by(asc(Chat.created_at)).all()

    @staticmethod
    def update_chat(chat_id, data):
        chat = ChatDAO.get_chat_by_id(chat_id)
        if not chat:
            return None

        # campos proibidos
        data.pop("id", None)
        data.pop("user_id", None)
        data.pop("created_at", None)
        data.pop("updated_at", None)

        chat.update_from_dict(data)
        return chat

    @staticmethod
    def delete_chat(chat_id):
        chat = ChatDAO.get_chat_by_id(chat_id)
        if not chat:
            return False

        db.session.delete(chat)
        db.session.commit()
        return True

    @staticmethod
    def get_messages_formatted(chat_id):
        """
        Retorna todo histórico em ordem cronológica:
        [
            { role: "user"|"assistant", content: "...", created_at: datetime },
            ...
        ]
        """
        chat = ChatDAO.get_chat_by_id(chat_id)
        if not chat:
            return []

        user_msgs = UserMessage.query.filter_by(chat_id=chat_id).all()
        ai_msgs = AIMessage.query.filter_by(chat_id=chat_id).all()

        messages = []

        # User messages
        for m in user_msgs:
            messages.append({
                "role": "user",
                "content": m.content,
                "created_at": getattr(m, "created_at", None)
            })

        # AI messages
        for m in ai_msgs:
            messages.append({
                "role": "assistant",
                "content": m.content,
                "created_at": getattr(m, "created_at", None)
            })

        # Ordenar (None fica por último)
        messages.sort(key=lambda x: (x["created_at"] is None, x["created_at"]))

        return messages

    @staticmethod
    def get_rating_by_chat(chat_id):
        chat = ChatDAO.get_chat_by_id(chat_id)
        if not chat:
            return None
        return chat.rating
