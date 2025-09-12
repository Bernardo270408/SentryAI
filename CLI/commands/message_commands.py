import requests
import defaults
from commands import defaults_commands, message_ai_commands
#Those are the chat-related commands for the CLI tool.

def create(chat_id, content,user_id,token,port=5000,**kwargs):
    url = f"http://localhost:{port}/messages/"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    payload = {
        "user_id":user_id,
        "chat_id": chat_id,
        "content":content
    }
    payload.update(kwargs)

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()

        ask = input("Do you want AI to generate a response? (y/n): ")
        
        if defaults.defaults["model"]:
            model = defaults.defaults["model"]
        else:
            model = input("Enter an AI model name : ")

        if ask.lower() == "y":
            message = message_ai_commands.create(
                chat_id=chat_id, 
                user_id=user_id, 
                port=port,
                token=token, 
                model="gpt-3.5-turbo",
                **kwargs)
            return message

        return response.json()
        
    
    except requests.RequestException as e:
        print("\033[31m> ",f"ERROR: {e}\033[0m")
        return None
    
def get(message_id,token,port=5000,**kwargs):
    url = f"http://localhost:{port}/messages/{message_id}"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    try:
        response=requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    
    except requests.RequestException as e:
        print("\033[31m> ",f"ERROR: {e}\033[0m")
        return None
    
def getall(token,port=5000,**kwargs):
    url = f"http://localhost:{port}/messages/"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    try:
        response=requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    
    except requests.RequestException as e:
        print("\033[31m> ",f"ERROR: {e}\033[0m")
        return None
    
def getbyuser(user_id,token,port=5000,**kwargs):
    url = f"http://localhost:{port}/messages/user/{user_id}"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    print("> ", url)

    try:
        response=requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    
    except requests.RequestException as e:
        print("\033[31m> ",f"ERROR: {e}\033[0m")
        return None
    
def getbychat(chat_id,token,port=5000,**kwargs):
    url = f"http://localhost:{port}/messages/chat/{chat_id}"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    try:
        response=requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    
    except requests.RequestException as e:
        print("\033[31m> ",f"ERROR: {e}\033[0m")
        return None

def update(message_id, token, port=5000, **kwargs):
    url = f"http://localhost:{port}/messages/{message_id}"
    payload = kwargs
    headers = {
        "Authorization": f"Bearer {token}"
    }
    try:
        response = requests.put(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error updating user: {e}")
        return None

def delete(message_id, token, port=5000,**kwargs):
    url = f"http://localhost:{port}/messages/{message_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    try:
        response = requests.delete(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error deleting user: {e}")
        return None

def open(message_id):
    return defaults_commands.set_key(key="message_id", value=message_id)

def quit():
    return defaults_commands.unset(key="message_id")