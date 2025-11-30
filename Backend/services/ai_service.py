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

# Configuração específica para análise (JSON)
GEMINI_JSON_CONFIG = {
    "temperature": 0.4,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
}

def _format_history_for_gemini(history: List[Dict]) -> List[Dict]:
    """Converte o histórico formatado para o padrão do Gemini."""
    gemini_history = []
    for msg in history:
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
    # ... (código mantido igual ao seu) ...
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
        # EXEMPLOS DE RESPOSTA
        {exemplos}
        """
        return system_prompt
    except Exception as e:
        logger.exception("Falha ao carregar contexto do data.json")
        return "Você é um assistente jurídico útil."

def generate_response(user_name: str, history: List[Dict], api_key: str, model: str, prompt: str) -> str:
    """Gera resposta completa."""
    system_instruction = get_context(user_name)
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
    
    # Fallback OpenAI
    try:
        client = OpenAI(api_key=api_key)
        messages = [{"role": "system", "content": system_instruction}]
        for msg in history:
            messages.append({"role": msg.get("role"), "content": msg.get("content")})
        messages.append({"role": "user", "content": prompt})
        response = client.chat.completions.create(model=model, messages=messages)
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"OpenAI call failed: {e}")
        return "Erro na geração (OpenAI)."

def generate_response_stream(user_name: str, history: List[Dict], api_key: str, model: str, prompt: str) -> Generator[str, None, None]:
    """Gera resposta via Streaming."""
    system_instruction = get_context(user_name)
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

    # Streaming OpenAI
    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
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
                if line.startswith("data:"): line = line[5:].strip()
                if line == "[DONE]": break
                try:
                    data = json.loads(line)
                    content = data.get("choices", [{}])[0].get("delta", {}).get("content", "")
                    if content: yield content
                except: continue
    except Exception as e:
        logger.exception("Streaming OpenAI falhou")
        yield f"[ERROR] {str(e)}"

# --- NOVA FUNÇÃO: ANÁLISE DE CONTRATO (RETORNA JSON) ---
def analyze_contract_text(text: str) -> Dict:
    """Analisa contrato e retorna JSON com score de risco."""
    # Pega a chave do ambiente (prioridade Gemini)
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"error": "Chave Gemini não configurada"}

    genai.configure(api_key=api_key)
    
    # Modelo Flash é ideal para isso
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash-preview-09-2025", 
        generation_config=GEMINI_JSON_CONFIG, # Força JSON
        system_instruction="""
        Você é um auditor jurídico sênior.
        Analise o contrato fornecido e retorne um JSON.
        O 'score' deve ser de 0 a 100, onde:
        - 0-30: Baixo Risco (Seguro)
        - 31-60: Risco Médio (Atenção)
        - 61-100: Alto Risco (Perigo)
        
        FORMATO JSON OBRIGATÓRIO:
        {
            "summary": "Resumo de 2 parágrafos.",
            "risk": {
                "score": <inteiro 0-100>,
                "label": "Baixo" | "Médio" | "Alto"
            },
            "highlights": [
                { "tag": "Tipo", "snippet": "Trecho", "lineNumber": 1 }
            ]
        }
        """
    )

    try:
        response = model.generate_content(f"Analise este documento:\n\n{text}")
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Erro na análise: {e}")
        return {"risk": {"score": 0, "label": "Erro"}, "summary": "Falha na análise."}

def chat_about_contract(message: str, context: str) -> str:
    """Chat simples sobre o contrato."""
    api_key = os.getenv("GEMINI_API_KEY")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash-preview-09-2025")
    res = model.generate_content(f"Contexto: {context}\n\nPergunta: {message}")
    return res.text

# ... (código existente)

def generate_dashboard_insight(user_name: str, last_interaction: str) -> str:
    """
    Gera uma frase curta de insight/dica para o dashboard baseada na última msg.
    """
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_TOKEN")
    if not api_key:
        return "Configure sua chave de API para receber insights."

    # Se for Gemini
    if os.getenv("GEMINI_API_KEY"):
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-2.0-flash") # Modelo rápido
            prompt = f"""
            Com base na última pergunta do usuário: "{last_interaction}",
            Gere uma ÚNICA frase curta (máx 15 palavras) de conselho jurídico preventivo ou encorajamento.
            Seja direto. Não use "Olá" ou introduções.
            """
            response = model.generate_content(prompt)
            return response.text.strip()
        except:
            return "Mantenha seus documentos organizados para facilitar consultas futuras."
    
    return "IA de insights indisponível no momento."

def analyze_user_doubts(messages_list: List[str]) -> List[str]:
    """
    Analisa uma lista de mensagens do usuário e retorna as 3 principais áreas de dúvida.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or not messages_list:
        return ["Sem dados suficientes."]

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash-preview-09-2025",
        generation_config={"response_mime_type": "application/json"}
    )

    # Contexto das últimas mensagens
    recent_msgs = "\n".join(messages_list[-20:])

    prompt = f"""
    Analise as perguntas feitas por um usuário:
    ---
    {recent_msgs}
    ---
    Identifique as 3 maiores dúvidas jurídicas ou problemas que ele enfrenta.
    Seja curto (máximo 6 palavras por item).
    Retorne JSON: {{ "doubts": ["Dúvida 1", "Dúvida 2", "Dúvida 3"] }}
    """

    try:
        response = model.generate_content(prompt)
        data = json.loads(response.text)
        return data.get("doubts", ["Análise inconclusiva"])
    except Exception as e:
        logger.error(f"Erro ao analisar dúvidas: {e}")
        return ["Não foi possível analisar as dúvidas."]
    

def generate_chat_name(chat_history: List[Dict], api_key: str, model: str) -> str:
    """
    Gera um nome para o chat baseado no histórico.
    """
    system_instruction = "Você é um assistente que cria nomes curtos e descritivos para conversas jurídicas."
    prompt = "Baseado na conversa abaixo, sugira um nome conciso (máx 5 palavras) para este chat:\n\n"
    for msg in chat_history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        prompt += f"{role.capitalize()}: {content}\n"
    prompt += "\nNome do chat:"

    # Se for Gemini
    if "gemini" in model.lower():
        try:
            genai.configure(api_key=api_key)
            generative_model = genai.GenerativeModel(
                model_name=model,
                system_instruction=system_instruction,
                generation_config=GEMINI_CONFIG
            )
            chat_session = generative_model.start_chat()
            response = chat_session.send_message(prompt)
            return response.text.strip()
        except Exception as e:
            logger.exception(f"Erro na geração de nome com Gemini: {e}")
            return "Erro ao gerar nome (Gemini)."

    # Fallback OpenAI
    try:
        client = OpenAI(api_key=api_key)
        messages = [{"role": "system", "content": system_instruction}, {"role": "user", "content": prompt}]
        response = client.chat.completions.create(model=model, messages=messages)
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Erro na geração de nome com OpenAI: {e}")
        return "Erro ao gerar nome (OpenAI)."