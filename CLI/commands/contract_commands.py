import requests
from commands import defaults_commands

def create(contract_text, user_id, token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/contract/analyze"

    headers = {
        "Authorization": f"Bearer {token}"
    }  
    
    payload = {
        "text": contract_text,
        "user_id": user_id
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print("\033[31m> ERROR: ",e,"\033[0m")
        print("\033[33m> WARNING:",response.json().get('error', 'Unknown error'),"\033[0m")
        return None
    
def analyze(**kwargs): #de novo, só pra padronizar a chamada
    return create(**kwargs)

def get(contract_id, token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/contract/{contract_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print("\033[31m> ERROR: ",e,"\033[0m")
        print("\033[33m> WARNING:",response.json().get('error', 'Unknown error'),"\033[0m")
        return None
    
def getbyuser(user_id, token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/contract/user/{user_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print("\033[31m> ERROR: ",e,"\033[0m")
        print("\033[33m> WARNING:",response.json().get('error', 'Unknown error'),"\033[0m")
        return None
        
def getall(token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/contract/"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print("\033[31m> ERROR: ",e,"\033[0m")
        print("\033[33m> WARNING:",response.json().get('error', 'Unknown error'),"\033[0m")
        return None
    
def update(contract_id, contract_text, token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/contract/{contract_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }

    payload = {
        "text": contract_text
    }

    payload.update(kwargs)

    try:
        response = requests.put(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print("\033[31m> ERROR: ",e,"\033[0m")
        print("\033[33m> WARNING:",response.json().get('error', 'Unknown error'),"\033[0m")
        return None
    

def delete(contract_id, token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/contract/{contract_id}"
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
    
def open(contract_id, **kwargs):
    return defaults_commands.set_key("contract_id", contract_id)

def close(**kwargs):
    return defaults_commands.unset("contract_id")