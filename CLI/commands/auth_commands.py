import requests
from commands import user_commands
import defaults

def login(email, password, domain='localhost', port=5000,**kwargs):
    url = f"http://{domain}:{port}/login"
    payload = {
        "email": email,
        "password": password
        }
    
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()


        token = response.json().get("token")


        if token:
            with open("data/default_token.txt", "w") as f:
                f.write(token)
                
            
            print(kwargs)

            defaults.defaults["token"] = token
            ask = input("Do you want to use this user as default to the next operations? (y/n): ")

            if ask.lower() == "y":
                user_id = user_commands.getbyemail(email)["id"]
                defaults.defaults["user_id"] = user_id
                print(f"User ID:{user_id} setted as default.")
                defaults.save_defaults()

            
            return f"Token {token} setted as default"
        
        else:
            print("Login failed: No token received.")
            return None
    except requests.RequestException as e:
        print(f"Error during authentication: {e}")
        return None
    
def gettoken(**kwargs):
    try:
        with open("data/default_token.txt", "r") as f:
            token = f.read().strip()
            if token:
                return token
            else:
                print("No token found. Please log in.")
                return None
    except FileNotFoundError:
        print("No token found. Please log in.")
        return None
    except Exception as e:
        print(f"Error retrieving token: {e}")
        return None

def logout(**kwargs):
    try:
        with open("data/default_token.txt", "w") as f:
            f.write("")
        defaults.defaults["token"] = None
        print("Logged out successfully.")
    except Exception as e:
        print(f"Error during logout: {e}")