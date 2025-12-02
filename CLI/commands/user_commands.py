import requests
from commands import defaults_commands
import defaults
from commands import auth_commands


def create(
    username, email, password, extra_data=None, domain="localhost", port=5000, **kwargs
):
    url = f"http://{domain}:{port}/users/"

    payload = {
        "name": username,
        "email": email,
        "password": password,
        "extra_data": extra_data,
    }
    payload.update(kwargs)

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print("\033[92m>", "> User created sucessfully\033[0m")

        login = input("Do you want to login with this user now? (y/n): ")

        if login.lower() == "y":
            code = input("Please type the verification code we sent to your email: ")
            verification = auth_commands.verifyemail(email=email,code=code)

            print(verification)
            
            return auth_commands.login(email, password, domain, port, **kwargs)

    except requests.RequestException as e:
        print("\033[31m> ERROR: ", e, "\033[0m")
        print(
            "\033[33m> WARNING:",
            response.json().get("error", "Unknown error"),
            "\033[0m",
        )
        return None


def get(user_id, domain="localhost", port=5000, **kwargs):
    url = f"http://{domain}:{port}/users/{user_id}"

    try:
        response = requests.get(url)
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


def getbyemail(email, domain="localhost", port=5000, **kwargs):
    url = f"http://{domain}:{port}/users/email/{email}"

    try:
        response = requests.get(url)
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


def getall(domain="localhost", port=5000, **kwargs):
    url = f"http://{domain}:{port}/users/"

    try:
        response = requests.get(url)
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


def update(user_id, token, domain="localhost", port=5000, **kwargs):
    url = f"http://{domain}:{port}/users/{user_id}"
    payload = kwargs
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.put(url, json=payload, headers=headers)
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


def delete(user_id, token, domain="localhost", port=5000, **kwargs):
    url = f"http://{domain}:{port}/users/{user_id}"
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.delete(url, headers=headers)
        response.raise_for_status()

        defaults.defaults.pop("user_id", None)
        defaults.defaults.pop("token", None)
        defaults.save_defaults()

        return response.json()
    except requests.RequestException as e:
        print("\033[31m> ERROR: ", e, "\033[0m")
        print(
            "\033[33m> WARNING:",
            response.json().get("error", "Unknown error"),
            "\033[0m",
        )
        return None


def open(user_id, **kwargs):
    return defaults_commands.set_key(key="user_id", value=user_id)


def quit(**kwargs):
    return defaults_commands.unset(key="user_id")
