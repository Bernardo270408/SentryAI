import requests
import defaults

def login(email, password, port=5000,**kwargs):
    url = f"http://localhost:{port}/login"
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

            defaults.defaults["token"] = token
            
            return token
        
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