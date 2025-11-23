# Backend/services/ai_service.py
from openai import OpenAI
from DAO.chat_dao import ChatDAO
from DAO.user_dao import UserDAO
from typing import List, Dict, Any, Generator
import json
import requests
import logging

logger = logging.getLogger(__name__)


def generate_response(user_id: int, chat_id: int, openai_token: str, model: str, prompt: str) -> str:
    """
    Chamada síncrona: monta contexto + histórico e retorna texto completo.
    Usa o SDK oficial quando possível (fallback para requests).
    """
    try:
        client = OpenAI(api_key=openai_token)
    except Exception:
        client = None

    # montar mensagens (SYSTEM + histórico + user)
    history = ChatDAO.get_messages_formatted(chat_id) or []
    system_context = get_context(user_id) or ""

    messages = [{"role": "system", "content": system_context}]
    for msg in history:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
    messages.append({"role": "user", "content": prompt})

    # 1) tentar SDK (responses.create)
    try:
        if client:
            response = client.responses.create(model=model, input=messages)
            # resposta simplificada: output_text (SDK fornece)
            text = getattr(response, "output_text", None)
            if text:
                return text
            # fallback: tentar extrair de choices/output
            if hasattr(response, "output"):
                # output pode ser uma lista de fragments
                out = response.output
                if isinstance(out, list):
                    parts = []
                    for item in out:
                        if isinstance(item, dict) and "content" in item:
                            # content pode ser str ou list
                            content = item["content"]
                            if isinstance(content, list):
                                for c in content:
                                    if isinstance(c, dict) and "text" in c:
                                        parts.append(c["text"])
                                    elif isinstance(c, str):
                                        parts.append(c)
                            elif isinstance(content, str):
                                parts.append(content)
                    return "".join(parts)
    except Exception as e:
        logger.debug("SDK call failed, falling back to HTTP streaming-free call: %s", e)

    # 2) fallback HTTP non-stream (requests)
    try:
        url = "https://api.openai.com/v1/responses"
        headers = {
            "Authorization": f"Bearer {openai_token}",
            "Content-Type": "application/json"
        }
        payload = {"model": model, "input": messages}
        r = requests.post(url, headers=headers, json=payload, timeout=60)
        r.raise_for_status()
        body = r.json()
        # extrair texto de várias formas possíveis
        text = ""
        # 1) campo output_text
        if "output_text" in body:
            return body["output_text"]
        # 2) choices / output
        if "output" in body:
            out = body["output"]
            if isinstance(out, list):
                for part in out:
                    if isinstance(part, dict):
                        content = part.get("content")
                        if isinstance(content, str):
                            text += content
                        elif isinstance(content, list):
                            for c in content:
                                if isinstance(c, dict) and "text" in c:
                                    text += c["text"]
                                elif isinstance(c, str):
                                    text += c
        # 3) choices[].message.content
        if not text and "choices" in body:
            for ch in body["choices"]:
                msg = ch.get("message") or ch.get("delta") or {}
                if isinstance(msg, dict):
                    content = msg.get("content") or msg.get("text") or ""
                    text += content
        return text or json.dumps(body)
    except Exception as e:
        logger.exception("generate_response fallback failed")
        return f"Erro ao gerar resposta: {str(e)}"


def generate_response_stream(user_id: int, chat_id: int, openai_token: str, model: str, prompt: str) -> Generator[str, None, None]:
    """
    Gerador que faz streaming da OpenAI Responses e yielda fragmentos de texto.
    Yields pedaços de texto (strings), já prontos para concatenar.
    Implementado via requests.stream para compatibilidade SSE do Flask.
    """
    # montar mensagens (SYSTEM + histórico + user)
    history = ChatDAO.get_messages_formatted(chat_id) or []
    system_context = get_context(user_id) or ""

    messages = [{"role": "system", "content": system_context}]
    for msg in history:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
    messages.append({"role": "user", "content": prompt})

    url = "https://api.openai.com/v1/responses"
    headers = {
        "Authorization": f"Bearer {openai_token}",
        "Content-Type": "application/json"
    }
    payload = {"model": model, "input": messages, "stream": True}

    try:
        with requests.post(url, headers=headers, json=payload, stream=True, timeout=360) as r:
            r.raise_for_status()
            # SSE-like lines: podem vir como "data: {...}" ou puro json por linha
            for raw_line in r.iter_lines(decode_unicode=False):
                if raw_line is None:
                    continue
                if not raw_line:
                    continue
                try:
                    line = raw_line.decode("utf-8").strip()
                except Exception:
                    line = raw_line.decode("latin-1").strip()

                # Alguns servidores enviam "data: [DONE]" ou "data: {...}"
                # Tirar prefixo "data: " se necessário
                if line.startswith("data:"):
                    payload_text = line[len("data:"):].strip()
                else:
                    payload_text = line

                if payload_text == "[DONE]":
                    break

                # tentar interpretar JSON
                try:
                    data = json.loads(payload_text)
                except Exception:
                    # se não for JSON, devolve raw
                    yield payload_text
                    continue

                # extração robusta do chunk
                chunk_text = ""

                # caso API retorne output_text direto
                if isinstance(data, dict):
                    if "output_text" in data and data["output_text"]:
                        chunk_text = data["output_text"]
                    # nova forma: 'choices' -> each choice may have 'delta' with 'content'
                    elif "choices" in data:
                        for ch in data["choices"]:
                            # delta.content (streaming chat-like)
                            delta = ch.get("delta") or {}
                            if isinstance(delta, dict):
                                # delta can have 'content' or 'message' structure
                                cont = delta.get("content") or delta.get("content_token") or ""
                                if cont:
                                    chunk_text += cont
                                else:
                                    # maybe message: {content: "..."}
                                    msg = delta.get("message") or {}
                                    if isinstance(msg, dict):
                                        # msg.content could be string or list
                                        cont2 = msg.get("content")
                                        if isinstance(cont2, str):
                                            chunk_text += cont2
                                        elif isinstance(cont2, list):
                                            for itm in cont2:
                                                if isinstance(itm, dict):
                                                    if "text" in itm:
                                                        chunk_text += itm["text"]
                                                    elif "content" in itm and isinstance(itm["content"], str):
                                                        chunk_text += itm["content"]
                    # older/other: 'output' list
                    if not chunk_text and "output" in data:
                        out = data["output"]
                        if isinstance(out, list):
                            for part in out:
                                if isinstance(part, dict):
                                    content = part.get("content")
                                    if isinstance(content, str):
                                        chunk_text += content
                                    elif isinstance(content, list):
                                        for c in content:
                                            if isinstance(c, dict) and "text" in c:
                                                chunk_text += c["text"]
                                            elif isinstance(c, str):
                                                chunk_text += c

                # Se deu vazio, pula
                if not chunk_text:
                    # no JSON but sem campo conhecido — tentar serializar para debug
                    # yield nothing in that case to avoid noise
                    continue

                yield chunk_text

    except requests.HTTPError as he:
        logger.exception("HTTP error during streaming: %s", he)
        yield f"[ERROR] HTTP error: {str(he)}"
    except Exception as e:
        logger.exception("Streaming failed")
        yield f"[ERROR] {str(e)}"


def get_avalilable_models(openai_token: str) -> List[Dict[str, Any]]:
    try:
        client = OpenAI(api_key=openai_token)
        models = client.models.list()
        return models.data
    except Exception as e:
        logger.exception("get_available_models failed")
        return [{"error": str(e)}]


def get_context(user_id: int) -> str:
    """
    Carrega seu arquivo JSON de contexto e insere dados do usuário.
    Retorna o contexto como string.
    """
    try:
        with open('Backend/services/data.json', 'r', encoding='utf-8') as f:
            context_data = json.load(f)
        user = UserDAO.get_user_by_id(user_id)
        if user:
            context_data.setdefault("Dados do Usuário", {})["Nome"] = getattr(user, "name", "Usuário")
        else:
            context_data.setdefault("Dados do Usuário", {})["Nome"] = "Usuário"
        return json.dumps(context_data, ensure_ascii=False)
    except Exception as e:
        logger.exception("get_context failed")
        return f"Contexto não disponível: {str(e)}"