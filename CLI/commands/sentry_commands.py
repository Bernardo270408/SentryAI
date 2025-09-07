import requests


def check():
    print("> CLI is working!")
    print("> Checking connection to backend...")
    try:
        response = requests.get("http://localhost:5000/")
        print(">", response)
    except Exception as e:
        e = str(e) + '\n Verify if backend is running on the choosen url.'
        print(">", f"Error connecting to backend: {e}")
        return
    
    print(">", "Connection successful!")

def quit():
    print(">", "Exiting CLI...")
    return

