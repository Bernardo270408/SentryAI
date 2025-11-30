from openai import OpenAI
import google.generativeai as genai
from typing import List, Dict, Any, Generator
import json
import requests
import logging
import os

logger = logging.getLogger(__name__)

# Configurações de geração do Gemini
GEMINI_CONFIG = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

def _format_history_for_gemini(history: List[Dict]) -> List[Dict]:
    """Converte o histórico formatado para o padrão do Gemini."""
    gemini_history = []
    for msg in history:
        # Mapeia 'assistant' (padrão DB/OpenAI) para 'model' (padrão Gemini)
        role = msg.get("role", "user")
        if role == "assistant":
            role = "model"
            
        content = msg.get("content", "")
        if content:
            gemini_history.append({
                "role": role,
                "parts": [content]
            })
    return gemini_history

def get_context(user_name: str) -> str:
    """Carrega o contexto do arquivo e injeta o nome do usuário."""
    try:
        path = os.path.join(os.path.dirname(__file__), 'data.json')
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        instrucoes = "\n".join([f"- {i}" for i in data.get("Instruções", [])])
        restricoes = "\n".join([f"- {r}" for r in data.get("Restrições", [])])
        
        exemplos = ""
        for ex in data.get("Exemplos", []):
            exemplos += f"\nUsuário: {ex['Pergunta']}\nAssistente: {ex['Resposta']}\n"

        system_prompt = f"""
        # PAPEL
        {data.get('Papel')}
        {data.get('Personalidade')}

        # CONTEXTO DO USUÁRIO
        Nome: {user_name}

        # INSTRUÇÕES OBRIGATÓRIAS
        {instrucoes}

        # RESTRIÇÕES DE SEGURANÇA
        {restricoes}

        # ESCOPO DE LEIS (PRIORITÁRIAS)
        O foco das respostas deve ser nas seguintes leis:
        {", ".join([l['Nome'] for l in data.get('Escopo_Legislativo', [])])}

        # EXEMPLOS DE RESPOSTA (Siga este formato)
        {exemplos}
        """
        return system_prompt

    except Exception as e:
        logger.exception("Falha ao carregar contexto do data.json")
        return "Você é um assistente jurídico útil. Responda com base nas leis brasileiras."

def generate_response(user_name: str, history: List[Dict], api_key: str, model: str, prompt: str) -> str:
    """
    Gera resposta completa. Recebe DADOS, não IDs.
    """
    system_instruction = get_context(user_name)

    # --- LÓGICA GEMINI ---
    if "gemini" in model.lower():
        try:
            genai.configure(api_key=api_key)
            
            generative_model = genai.GenerativeModel(
                model_name=model,
                system_instruction=system_instruction,
                generation_config=GEMINI_CONFIG
            )

            chat_history = _format_history_for_gemini(history)
            chat_session = generative_model.start_chat(history=chat_history)
            
            response = chat_session.send_message(prompt)
            return response.text

        except Exception as e:
            logger.exception(f"Erro na API do Gemini: {e}")
            return f"Erro ao processar com Gemini: {str(e)}"

    # --- LÓGICA OPENAI ---
    try:
        client = OpenAI(api_key=api_key)
        
        messages = [{"role": "system", "content": system_instruction}]
        # Adiciona histórico (assume formato {role: 'user'|'assistant', content: '...'})
        for msg in history:
            messages.append({"role": msg.get("role"), "content": msg.get("content")})
        messages.append({"role": "user", "content": prompt})

        response = client.chat.completions.create(model=model, messages=messages)
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"OpenAI call failed: {e}")
        return "Erro na geração (OpenAI)."

def generate_response_stream(user_name: str, history: List[Dict], api_key: str, model: str, prompt: str) -> Generator[str, None, None]:
    """
    Gera resposta via Streaming. Recebe DADOS, não IDs.
    """
    system_instruction = get_context(user_name)

    # --- STREAMING GEMINI ---
    if "gemini" in model.lower():
        try:
            genai.configure(api_key=api_key)
            
            generative_model = genai.GenerativeModel(
                model_name=model,
                system_instruction=system_instruction,
                generation_config=GEMINI_CONFIG
            )

            chat_history = _format_history_for_gemini(history)
            chat_session = generative_model.start_chat(history=chat_history)

            response_stream = chat_session.send_message(prompt, stream=True)
            
            for chunk in response_stream:
                if chunk.text:
                    yield chunk.text

        except Exception as e:
            logger.exception("Erro no streaming do Gemini")
            yield f"[ERROR] {str(e)}"
        return 

    # --- STREAMING OPENAI ---
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    messages = [{"role": "system", "content": system_instruction}]
    for msg in history:
        messages.append({"role": msg.get("role"), "content": msg.get("content")})
    messages.append({"role": "user", "content": prompt})

    payload = {"model": model, "messages": messages, "stream": True}

    try:
        with requests.post(url, headers=headers, json=payload, stream=True, timeout=120) as r:
            r.raise_for_status()
            for raw_line in r.iter_lines(decode_unicode=False):
                if not raw_line: continue
                line = raw_line.decode("utf-8").strip()
                if line.startswith("data:"):
                    line = line[5:].strip()
                if line == "[DONE]": break
                try:
                    data = json.loads(line)
                    delta = data.get("choices", [{}])[0].get("delta", {})
                    content = delta.get("content", "")
                    if content:
                        yield content
                except:
                    continue
    except Exception as e:
        logger.exception("Streaming OpenAI falhou")
        yield f"[ERROR] {str(e)}"