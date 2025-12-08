from models.chat import Chat
from extensions import db
from models.message_user import UserMessage
from models.message_ai import AIMessage
from sqlalchemy import desc


class ChatRepo:
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
        return Chat.query.filter_by(user_id=user_id).all()

    @staticmethod
    def get_all_chats():
        return Chat.query.all()

    @staticmethod
    def update_chat(chat_id, data):
        chat = ChatRepo.get_chat_by_id(chat_id)

        if not chat:
            return None

        data.pop("id", None)
        data.pop("user_id", None)

        chat.update_from_dict(data)
        return chat

    @staticmethod
    def delete_chat(chat_id):
        chat = ChatRepo.get_chat_by_id(chat_id)
        if not chat:
            return False
        db.session.delete(chat)
        db.session.commit()
        return True

    @staticmethod
    def get_messages_formated(chat_id, limit=20):
        """
        CORREÇÃO A: Janela Deslizante.
        Recupera apenas as últimas 'limit' mensagens para contexto da IA.
        """
        chat = ChatRepo.get_chat_by_id(chat_id)
        if not chat:
            return []

        # Busca otimizada usando UNION no banco seria ideal, 
        # mas vou usar o slicing em Python para manter compatibilidade com o ORM atual
        # buscando apenas os últimos N registros de cada tabela para evitar load total
        
        # Pega as últimas X mensagens de cada tipo (segurança para garantir ordem)
        user_msgs = chat.user_messages[-limit:] 
        ai_msgs = chat.ai_messages[-limit:]
        
        all_msgs = user_msgs + ai_msgs
        # Ordena pela data
        all_msgs.sort(key=lambda m: getattr(m, "created_at", None))
        
        # Pega apenas as últimas 'limit' do total combinado (Janela Deslizante)
        recent_msgs = all_msgs[-limit:]

        history = []
        for message in recent_msgs:
            role = "user" if isinstance(message, UserMessage) else "assistant"
            history.append({"role": role, "content": message.content})

        return history

    @staticmethod
    def get_rating_by_chat(chat_id):
        chat = ChatRepo.get_chat_by_id(chat_id)
        return chat.rating