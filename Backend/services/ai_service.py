from openai import OpenAI
from DAO.chat_dao import ChatDAO
from DAO.user_dao import UserDAO
from typing import List, Dict, Any
import json


def generate_response(chat_id: int, openai_token: str, model: str, user_id: str) -> Dict[str, Any]:   
    client = OpenAI(api_key=openai_token)

    try:
        chat = ChatDAO.get_messages_formated(chat_id)

        context = get_context(user_id)
        messages = [{"role": "system", "content": context}] + chat

        completion = client.chat.completions.create(model=model, messages=messages)

        return {
            "status": "success",
            "response": completion.choices[0].message.content
        }

    except Exception as e:
        return {
            "status": "error",
            "response": str(e)
        }
    
def get_avalilable_models(openai_token: str) -> List[Dict[str, Any]]:
    client = OpenAI(api_key=openai_token)
    try:
        models = client.models.list()
        return models.data
    
    except Exception as e:
        return [{"error": str(e)}]
    
def get_context(user_id) -> str:
    with open('Backend/services/data.json', 'r') as f: 
        context_data = json.load(f)
        user = UserDAO.get_user_by_id(user_id)

        if not user:
            raise ValueError("User not found")

        context_data["user_name"] = user.name if user else "User"

        return json.dumps(context_data)
    return "no context avaliable."
