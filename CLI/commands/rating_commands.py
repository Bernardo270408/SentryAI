import requests
from commands import defaults_commands

#Those are the rating-related commands for the CLI tool.
def create(token,user_id, chat_id, score, feedback=None, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/ratings/"

    payload = {
        "user_id": user_id,
        "chat_id": chat_id,
        "score": score,
        "feedback": feedback
    }

    headers = {
        "Authorization": f"Bearer {token}"
    }

    payload.update(kwargs)
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error creating rating: {e}")
        return None

def get(rating_id, token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/ratings/{rating_id}"

    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url,headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching rating: {e}")
        return None
    
def getbyuser(user_id, token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/ratings/user/{user_id}"
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url,headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching ratings: {e}")
        return None
    
def getbychat(chat_id, token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/ratings/chat/{chat_id}"
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url,headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching ratings: {e}")
        return None
    
def getall(token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/ratings/"

    headers = {
        token: f"Bearer {token}"
    }
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url,headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching ratings: {e}")
        return None
    
def getbyscore(score, token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/ratings/score/{score}"
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url,headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching ratings: {e}")
        return None
    
def getwithfeedback(token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/ratings/feedback/"
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url,headers=headers)
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching ratings: {e}")
        return None

def update(rating_id, token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/ratings/{rating_id}"

    payload = {
        "score": None,
        "feedback": None
    }

    headers = {
        "Authorization": f"Bearer {token}"
    }
    try:
        response = requests.put(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error updating rating: {e}")
        return None
    
def delete(rating_id, token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/ratings/{rating_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }   
    try:
        response = requests.delete(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error deleting rating: {e}")
        return None

def open(rating_id, **kwargs):
    return defaults_commands.set_key(key="rating_id", value=rating_id)

def close(**kwargs):
    return defaults_commands.unset(key="rating_id")

    