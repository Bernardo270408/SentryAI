import requests
from commands import defaults_commands
#Those are the chat-related commands for the CLI tool.

def create(user_id,token,name=None,domain='localhost',port=5000,**kwargs):
    url = f"http://{domain}:{port}/chats/"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    payload = {
        "name": name,
        "user_id":user_id 
    }

    payload.update(kwargs)

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print("\033[31m> ERROR: ",e,"\033[0m")
        print("\033[33m> WARNING:",response.json().get('error', 'Unknown error'),"\033[0m")
        return None
    
def get(chat_id,token, domain='localhost',port=5000,**kwargs):
    url = f"http://{domain}:{port}/chats/{chat_id}"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    try:
        response=requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    
    except requests.RequestException as e:
        print("\033[31m> ERROR: ",e,"\033[0m")
        print("\033[33m> WARNING:",response.json().get('error', 'Unknown error'),"\033[0m")
        return None

def getall(token, domain='localhost',port=5000,**kwargs):
    url = f"http://{domain}:{port}/chats/"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    try:
        response=requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    
    except requests.RequestException as e:
        print("\033[31m> ERROR: ",e,"\033[0m")
        print("\033[33m> WARNING:",response.json().get('error', 'Unknown error'),"\033[0m")
        return None

def getbyuser(user_id,token, domain='localhost',port=5000,**kwargs):
    url = f"http://{domain}:{port}/chats/user/{user_id}"

    headers = {
        "Authorization": f"Bearer {token}"
    }
    print(url)
    try:
        response=requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    
    except requests.RequestException as e:
        print("\033[31m> ERROR: ",e,"\033[0m")
        print("\033[33m> WARNING:",response.json().get('error', 'Unknown error'),"\033[0m")
        return None
    
def update(chat_id, token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/chats/{chat_id}"
    payload = kwargs
    headers = {
        "Authorization": f"Bearer {token}"
    }
    try:
        response = requests.put(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print("\033[31m> ERROR: ",e,"\033[0m")
        print("\033[33m> WARNING:",response.json().get('error', 'Unknown error'),"\033[0m")
        return None

def delete(chat_id, token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/chats/{chat_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    try:
        response = requests.delete(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print("\033[31m> ERROR: ",e,"\033[0m")
        print("\033[33m> WARNING:",response.json().get('error', 'Unknown error'),"\033[0m")
        return None
    
def open(chat_id, **kwargs):
    return defaults_commands.set_key(key="chat_id", value=chat_id)

def quit(**kwargs):
    return defaults_commands.unset(key="chat_id")