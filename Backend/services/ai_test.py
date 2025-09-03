import ollama
model = "deepseek-r1:1.5b"

available_models = [m["model"] for m in ollama.list()["models"]]
if model not in available_models:
    raise ValueError(f"Model '{model}' not available. Options: {available_models}")

response = ollama.chat(model=model, messages=[
    {"role": "user", "content": "Why is the sky blue?"}
])


print(response.message)