import requests


def check():
    print("> Starting CLI")
    print("> Connecting to API, it may take a while")
    try:
        response = requests.get("http://localhost:5000/")
        print(">", response)
    except Exception as e:
        e = str(e) + '\n Verify if the API is running on the choosen url.'
        print("\033[31m>", f"ERROR: Connection Failed {e}\033[0m")
        print("\033[33m>", "WARNING: You can still use the CLI, but requests wont work\033[0m")
        return
    
    print(">", "Connection successful")
    print(">", "Welcome to SentryAI CLI")

def quit():
    print(">", "Exiting CLI...")
    return

