import requests
from commands import user_commands
import defaults


def login(email, password, domain="localhost", port=5000, **kwargs):
    url = f"http://{domain}:{port}/login"
    payload = {"email": email, "password": password}

    payload.update(kwargs)

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()

        token = response.json().get("token")

        if token:
            defaults.defaults["token"] = token
            defaults.save_defaults()

            ask = input(
                "Do you want to use this user as default to the next operations? (y/n): "
            )

            if ask.lower() == "y":
                user_id = response.json().get("user")["id"]
                defaults.defaults["user_id"] = user_id

                print(f"User ID:{user_id} setted as default.")
                defaults.save_defaults()

            return f"Token {token} setted as default"

        else:
            print("Login failed: No token received.")
            return None

    except requests.RequestException as e:
        print("\033[31m> ERROR: ", e, "\033[0m")
        print(
            "\033[33m> WARNING:",
            response.json().get("error", "Unknown error"),
            "\033[0m",
        )
        return None


def googlelogin(credential, domain="localhost", port=5000, **kwargs):
    url = f"http://{domain}:{port}/google-login"

    payload = {"credential": credential}

    payload.update(kwargs)

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()

        token = response.json().get("token")

        if token:
            defaults.defaults["token"] = token
            defaults.save_defaults()

            ask = input(
                "Do you want to use this user as default to the next operations? (y/n): "
            )

            if ask.lower() == "y":
                user_id = response.json().get("user")["id"]
                defaults.defaults["user_id"] = user_id

                print(f"User ID:{user_id} setted as default.")
                defaults.save_defaults()

            return f"Token {token} setted as default"

        else:
            print("Login failed: No token received.")
            return None

    except requests.RequestException as e:
        print("\033[31m> ERROR: ", e, "\033[0m")
        print(
            "\033[33m> WARNING:",
            response.json().get("error", "Unknown error"),
            "\033[0m",
        )
        return None


def verifyemail(email, code, domain="localhost", port=5000, **kwargs):
    url = f"http://{domain}:{port}/verify-email"

    payload = {"email": email, "code": code}

    payload.update(kwargs)

    try:
        response = requests.post(url, json=payload)
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


def gettoken(**kwargs):
    token = defaults.defaults.get("token")
    if token:
        return token
    else:
        print("No token found. Please login first.")
        return None


def logout(**kwargs):
    if "token" in defaults.defaults:
        defaults.defaults.pop("token")

        if "user_id" in defaults.defaults:
            defaults.defaults.pop("user_id")

        defaults.save_defaults()
        print("Logged out successfully.")
    else:
        print("No user is currently logged in.")
