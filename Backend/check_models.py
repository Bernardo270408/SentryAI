from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("ERRO: GEMINI_API_KEY não encontrada no .env")
else:
    # O cliente lê automaticamente a variável GEMINI_API_KEY se ela estiver no ambiente
    client = genai.Client(api_key=api_key)
    
    print("--- Modelos Disponíveis ---")
    try:
        for m in client.models.list():
            print(f"- {m.name}")
    except Exception as e:
        print(f"Erro ao listar modelos: {e}")