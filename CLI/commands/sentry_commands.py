import requests


def check(domain="localhost", port=5000):
    print("> Starting CLI")
    print("\033[92m>> CLI is working\033[0m")
    print("> Connecting to API, it may take a while")
    try:
        response = requests.get(f"http://{domain}:{port}/")
    except Exception as e:
        e = str(e) + "\n Verify if the API is running on the choosen url."
        print("\033[31m>", f"ERROR: Connection Failed {e}\033[0m")
        print(
            "\033[33m>",
            "WARNING: You can still use the CLI, but requests wont work\033[0m",
        )
        return

    print("\033[92m>", "Connection successful, Welcome to SentryAI CLI\033[0m")


def dashboard(token, domain="localhost", port=5000, **kwargs):
    url = f"http://{domain}:{port}/dashboard/stats"

    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print("\033[31m> ERROR: ", e, "\033[0m")
        print(
            "\033[33m> WARNING:",
            response.json().get("error", "Unknown error"),
            "\033[0m",
        )
        return None


def quit():
    print(">", "Exiting CLI...")
    return
