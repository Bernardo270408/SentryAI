from config import Config
from services.ai_service import get_available_models
from services.llm_provider import default_model, api_key_for_model, _openai_client

if __name__ == "__main__":
    for model in get_available_models():
        print(model)
    model = default_model()
    key = api_key_for_model(model)
    if "gemini" not in model:
        _openai_client(key).models.retrieve(model)
        print("Modelo principal acessível na API (nenhuma geração foi solicitada).")
