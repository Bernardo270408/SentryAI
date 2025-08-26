from DAO.user_dao import UserDAO
from DAO.chat_dao import ChatDAO

class AIService:
    @staticmethod
    def generate_response(user_id, chat_id, model, prompt):
        
        user = UserDAO.get_user_by_id(user_id).to_dict()
        history = ChatDAO.get_all_messages_in_chat(chat_id).to_dict()
        
        return "Esta é uma mensagem de teste, o serviço será implementado em breve."