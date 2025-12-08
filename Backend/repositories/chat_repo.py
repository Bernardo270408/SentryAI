from sqlalchemy.orm import Session
from models import Chat, UserMessage, AIMessage
from sqlalchemy.orm import Session



class ChatRepo:
    @staticmethod
    def create_chat(db: Session, user_id:int, name:str, rating_id=None, created_at=None) -> Chat:
        chat = Chat(user_id=user_id, name=name, rating_id=rating_id, created_at=created_at)
        db.add(chat)
        db.commit()
        db.refresh(chat)
        return chat

    @staticmethod
    def get_chat_by_id(db: Session, chat_id: int):
        return db.query(Chat).get(chat_id)

    @staticmethod
    def get_chats_by_user(db: Session, user_id: int):
        return db.query(Chat).filter_by(user_id=user_id).all()

    @staticmethod
    def get_all_chats(db: Session):
        return db.query(Chat).all()

    @staticmethod
    def update_chat(db: Session, chat_id, data):
        chat = ChatRepo.get_chat_by_id(chat_id)
        if not chat:
            return None
        
        for k,v in data.items():
                setattr(chat,k,v)

        db.commit()
        db.refresh(chat)
        return chat

    @staticmethod
    def delete_chat(db: Session, chat_id:int):
        chat = ChatRepo.get_chat_by_id(chat_id)
        if not chat:
            return False
        db.delete(chat)
        db.commit()
        return True

    @staticmethod
    def get_messages_formated(db: Session, chat_id, limit=20):
        """
        CORREÇÃO A: Janela Deslizante.
        Recupera apenas as últimas 'limit' mensagens para contexto da IA.
        """
        chat: Chat = ChatRepo.get_chat_by_id(chat_id)
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
    def get_rating_by_chat(db: Session, chat_id):
        chat: Chat = ChatRepo.get_chat_by_id(chat_id)
        return chat.rating