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
            gemini_history.append({"role": role, "parts": [content]})
    return gemini_history


def get_context(user_name: str) -> str:
    try:
        path = os.path.join(os.path.dirname(__file__), "data.json")
        with open(path, "r", encoding="utf-8") as f:
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


def generate_response(
    user_name: str, history: List[Dict], api_key: str, model: str, prompt: str
) -> str:
    """Gera resposta completa."""
    system_instruction = get_context(user_name)
    if "gemini" in model.lower():
        try:
            genai.configure(api_key=api_key)
            generative_model = genai.GenerativeModel(
                model_name=model,
                system_instruction=system_instruction,
                generation_config=GEMINI_CONFIG,
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


def generate_response_stream(
    user_name: str, history: List[Dict], api_key: str, model: str, prompt: str
) -> Generator[str, None, None]:
    """Gera resposta via Streaming."""
    system_instruction = get_context(user_name)
    if "gemini" in model.lower():
        try:
            genai.configure(api_key=api_key)
            generative_model = genai.GenerativeModel(
                model_name=model,
                system_instruction=system_instruction,
                generation_config=GEMINI_CONFIG,
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
        with requests.post(
            url, headers=headers, json=payload, stream=True, timeout=120
        ) as r:
            r.raise_for_status()
            for raw_line in r.iter_lines(decode_unicode=False):
                if not raw_line:
                    continue
                line = raw_line.decode("utf-8").strip()
                if line.startswith("data:"):
                    line = line[5:].strip()
                if line == "[DONE]":
                    break
                try:
                    data = json.loads(line)
                    content = (
                        data.get("choices", [{}])[0].get("delta", {}).get("content", "")
                    )
                    if content:
                        yield content
                except:
                    continue
    except Exception as e:
        logger.exception("Streaming OpenAI falhou")
        yield f"[ERROR] {str(e)}"


# --- ANÁLISE DE CONTRATO (RETORNA JSON) ---
def analyze_contract_text(text: str) -> Dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"error": "Chave Gemini não configurada"}

    genai.configure(api_key=api_key)

    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config=GEMINI_JSON_CONFIG,
        system_instruction="""
        Você é um auditor jurídico sênior.
        Analise o contrato fornecido e retorne um JSON.
        O 'score' deve ser de 0 a 100.
        FORMATO JSON OBRIGATÓRIO:
        {
            "summary": "Resumo de 2 parágrafos.",
            "risk": { "score": 0, "label": "Baixo" },
            "highlights": [ { "tag": "Tipo", "snippet": "Trecho", "lineNumber": 1 } ]
        }
        """,
    )

    try:
        response = model.generate_content(f"Analise este documento:\n\n{text}")
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Erro na análise: {e}")
        return {"risk": {"score": 0, "label": "Erro"}, "summary": "Falha na análise."}


def chat_about_contract(message: str, context: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")
    res = model.generate_content(f"Contexto: {context}\n\nPergunta: {message}")
    return res.text


def generate_dashboard_insight(user_name: str, last_interaction: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_TOKEN")
    if not api_key:
        return "Configure sua chave de API."
    if os.getenv("GEMINI_API_KEY"):
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-2.0-flash")
            prompt = f"Com base na pergunta: '{last_interaction}', gere uma frase curta de conselho jurídico."
            response = model.generate_content(prompt)
            return response.text.strip()
        except:
            return "Mantenha seus documentos organizados."
    return "IA indisponível."


def analyze_user_doubts(messages_list: List[str]) -> List[str]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or not messages_list:
        return ["Sem dados."]
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        "gemini-2.0-flash", generation_config={"response_mime_type": "application/json"}
    )
    recent = "\n".join(messages_list[-20:])
    prompt = f"Analise as perguntas: {recent}. Retorne JSON {{ 'doubts': ['Dúvida 1', 'Dúvida 2'] }}."
    try:
        response = model.generate_content(prompt)
        return json.loads(response.text).get("doubts", [])
    except:
        return ["Erro na análise."]


# --- GERAÇÃO DE TÍTULO AUTOMÁTICO ---
def generate_chat_title(message_content: str) -> str:
    """Gera um título curto (3-6 palavras) para o chat baseado na primeira mensagem."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "Nova Conversa"

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")

    prompt = f"""
    Analise a seguinte mensagem inicial de um usuário em um chat jurídico:
    "{message_content}"
    
    Gere um título extremamente conciso (máximo 5 palavras) que resuma o tópico jurídico.
    Exemplos: "Cálculo de Rescisão", "Dúvida sobre Horas Extras", "Ação de Divórcio".
    Não use pontuação final. Retorne apenas o título.
    """

    try:
        response = model.generate_content(prompt)
        title = response.text.strip().replace('"', "").replace("'", "")
        return title if title else "Nova Conversa"
    except Exception as e:
        logger.error(f"Erro ao gerar título: {e}")
        return "Nova Conversa"
