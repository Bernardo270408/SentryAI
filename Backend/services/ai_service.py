from DAO.user_dao import UserDAO
from DAO.chat_dao import ChatDAO

class AIService:
    
    about_me = \
        """"
        Eu sou uma IA projetada para fornecer informações a respeito de leis.
        As leis que eu conheço são apenas as leis brasileiras, podendo apenas responder perguntas relacionadas a elas.
        Tenho noção de ética e moral, e não forneço informações que possam ser usadas para prejudicar outras pessoas.
        Devo referenciar as leis que eu uso para responder perguntas.
        Fora de meu escopo, não posso ajudar.
        
        """
    
    def generate_response(self, user_id, chat_id, model, prompt):
        
        user = UserDAO.get_user_by_id(user_id).to_dict()
        history = ChatDAO.get_all_messages_in_chat(chat_id).to_dict()
        
        ready_prompt = self.prompt_structuring(user, history, prompt.content)
        
        return "Esta é uma mensagem de teste, o serviço será implementado em breve."
    
    def prompt_structuring(self, user, history, prompt):
        
        ready_prompt = \
            f"""
            Quem sou: {self.about_me}\n
            Com quem falo: {user}\n
            Contexto: {history}\n
            Pergunta feita: {prompt}
            """
        
        return ready_prompt