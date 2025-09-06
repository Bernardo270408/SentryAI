from DAO.user_dao import UserDAO
from DAO.chat_dao import ChatDAO
import ollama

class OllamaAIService:
    def __init__(self):
        with open("data/docs/aboutMe.txt") as me:
            self.about_me = me.read()

    def generate_response(self, user_id, chat_id = None, model = None):

        available_models = [m["model"] for m in ollama.list()["models"]]
        if model not in available_models:
            raise ValueError(f"Model '{model}' not available. Options: {available_models}") 

        about_user = UserDAO.get_user_by_id(user_id).to_dict()
        messages = ChatDAO.get_all_messages_in_chat(chat_id)

        if not about_user:
            raise ValueError(f"User with id '{user_id}' not found.")

        if not messages:
            messages = []

        system_message = {
            "role": "system",
            "content": f"Sobre o usuário: {about_user}\nSobre a AI: {self.about_me}"
        }
        messages.insert(0, system_message)

        response = ollama.chat(model = model, messages = messages).message.content
        return response
