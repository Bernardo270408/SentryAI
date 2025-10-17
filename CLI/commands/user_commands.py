import requests
from commands import defaults_commands

#Those are the user-related commands for the CLI tool.
def create(username, email, password, extra_data=None, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/users/"

    payload = {
        "name": username,
        "email": email,
        "password": password,
        "extra_data": extra_data
    }
    payload.update(kwargs)
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return "User created sucessfully"
    except requests.RequestException as e:
        print(f"Error creating user: {e}")
        return None

def get(user_id, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/users/{user_id}"

    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching user: {e}")
        return None

def getbyemail(email, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/users/email/{email}"

    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching user: {e}")
        return None

def getall(domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/users/"

    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching users: {e}")
        return None

def update(user_id, token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/users/{user_id}"
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

def delete(user_id, token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/users/{user_id}"
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
    
def open(user_id, **kwargs):
    return defaults_commands.set_key(key="user_id", value=user_id)

def quit(**kwargs):
    return defaults_commands.unset(key="user_id")