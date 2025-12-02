import requests
from commands import defaults_commands


def create(model, chat_id, user_id, token, domain="localhost", port=5000, **kwargs):
    url = f"http://{domain}:{port}/ai-messages/"

    headers = {"Authorization": f"Bearer {token}"}

    payload = {"user_id": user_id, "chat_id": chat_id, "model": model}
    payload.update(kwargs)

    try:
        response = requests.post(url, json=payload, headers=headers)
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


def get(ai_message_id, token, domain="localhost", port=5000, **kwargs):
    url = f"http://{domain}:{port}/ai-messages/{ai_message_id}"

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


def getall(token, port=5000, domain="localhost", **kwargs):
    url = f"http://{domain}:{port}/ai-messages/"

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


def getbychat(chat_id, token, domain="localhost", port=5000, **kwargs):
    url = f"http://{domain}:{port}/ai-messages/chat/{chat_id}"

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


def getbymodel(model_name, token, domain="localhost", port=5000, **kwargs):
    url = f"http://{domain}:{port}/ai-messages/model/{model_name}"

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


def getbychatandmodel(
    chat_id, model_name, token, domain="localhost", port=5000, **kwargs
):
    url = f"http://{domain}:{port}/ai-messages/chat/{chat_id}/model/{model_name}"

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


def update(ai_message_id, token, domain="localhost", port=5000, **kwargs):
    url = f"http://{domain}:{port}/ai-messages/{ai_message_id}"
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


def delete(ai_message_id, token, domain="localhost", port=5000, **kwargs):
    url = f"http://{domain}:{port}/ai-messages/{ai_message_id}"
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.delete(url, headers=headers)
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


def open(ai_message_id, **kwargs):
    return defaults_commands.set_key(key="ai_message_id", value=ai_message_id)


def quit(**kwargs):
    return defaults_commands.unset(key="ai_message_id")
