import requests


def check():
    print("> Starting CLI")
    print("\033[92m>> CLI is working\033[0m")
    print("> Connecting to API, it may take a while")
    try:
        response = requests.get("http://localhost:5000/")
    except Exception as e:
        e = str(e) + '\n Verify if the API is running on the choosen url.'
        print("\033[31m>", f"ERROR: Connection Failed {e}\033[0m")
        print("\033[33m>", "WARNING: You can still use the CLI, but requests wont work\033[0m")
        return
    
    print("\033[92m>", "Connection successful, Welcome to SentryAI CLI\033[0m")

def quit():
    print(">", "Exiting CLI...")
    return

