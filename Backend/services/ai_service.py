from DAO.user_dao import UserDAO
from DAO.chat_dao import ChatDAO
import ollama

class OllamaAIService:
    def __init__(self):
        try:
            with open("data/docs/aboutMe.txt") as me:
                self.about_me = me.read()
        except FileNotFoundError:
            raise FileNotFoundError("The file 'data/docs/aboutMe.txt' was not found.")
        except Exception as e:
            raise RuntimeError(f"An error occurred while reading 'aboutMe.txt': {e}")

    def generate_response(self, user_id, chat_id=None, model=None):

        #========== Validations ==========
        print("validating parameters...")
        if not user_id:
            raise ValueError("Parameter 'user_id' is required.")
        if not model:
            raise ValueError("Parameter 'model' is required.")

        try:
            available_models = [m["model"] for m in ollama.list().get("models", [])]
        except Exception as e:
            raise RuntimeError(f"Failed to retrieve available models: {e}")

        if model not in available_models:
            raise ValueError(f"Model '{model}' not available. Options: {available_models}")

        user = UserDAO.get_user_by_id(user_id)
        if not user:
            raise ValueError(f"User with id '{user_id}' not found.")
        

        # ========= Prepare Messages ==========
        about_user = user.to_dict()

        messages = ChatDAO.get_all_messages_in_chat(chat_id) or []

        system_prompt = (
            "You are an AI assistant. "
            "Use the following information to assist the user:\n\n"
            f"About You:\n{self.about_me}\n\n"
            f"About User:\n{about_user}\n\n"
        )
        messages.insert(0, {"role": "system", "content": system_prompt})
        print("prepared messages for AI model.")
        
        # ========= Generate Response ==========
        print(f"generating response using model '{model}'...")
        try:
            response = ollama.chat(model=model, messages=messages).message.content
        except Exception as e:
            raise RuntimeError(f"An error occurred while generating the AI response: {e}")

        return response
