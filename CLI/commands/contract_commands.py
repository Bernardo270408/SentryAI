import requests
from commands import defaults_commands

def analyze(contract_text, user_id, token, domain='localhost', port=5000, **kwargs):
    url = f"http://{domain}:{port}/contract/analyze"

    headers = {
        "Authorization": f"Bearer {token}"
    }  
    
    payload = {
        "text": contract_text,
        