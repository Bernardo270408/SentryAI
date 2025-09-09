import requests
import defaults_commands
#Those are the chat-related commands for the CLI tool.

def create(name,user_id,token,port=5000,**kwargs):
    url = f"http://localhost:{port}/chats/"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    payload = {
        "name": name,
        "user_id":user_id 
    }

    
    payload.update(kwargs)

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print("\033[31m> ",f"ERROR: {e}\033[0m")
        return None
    

def get(chat_id,token,port=5000,**kwargs):
    url = f"http://localhost:{port}/chats/{chat_id}"

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
    url = f"http://localhost:{port}/chats/"

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
    url = f"http://localhost:{port}/chats/user/{user_id}"

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
    
def update(chat_id, token, port=5000, **kwargs):
    url = f"http://localhost:{port}/chats/{chat_id}"
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
    
def delete(chat_id, token, port=5000,**kwargs):
    url = f"http://localhost:{port}/chats/{chat_id}"
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
    
def open(chat_id):
    defaults_commands.set_key(key="chat_id", value=chat_id)

def quit():
    defaults_commands.unset(key="chat_id")