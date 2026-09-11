"""One provider path for every generative feature; credentials never reach the browser."""
import logging
import os
from functools import lru_cache
from openai import OpenAI

logger = logging.getLogger(__name__)


def default_model(auxiliary=False):
    if os.getenv("AI_PROVIDER", "openai").lower() == "gemini":
        return os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    return os.getenv("OPENAI_AUX_MODEL" if auxiliary else "OPENAI_MODEL",
                     "gpt-5.6-luna" if auxiliary else "gpt-5.6-terra")


def allowed_models():
    configured = {default_model(), default_model(True)}
    configured.update(m.strip() for m in os.getenv("AI_ALLOWED_MODELS", "").split(",") if m.strip())
    return configured


def api_key_for_model(model):
    if not isinstance(model, str) or model not in allowed_models():
        raise ValueError("Modelo não autorizado. Use um dos modelos configurados no servidor.")
    key = os.getenv("GEMINI_API_KEY") if "gemini" in model.lower() else (
        os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_TOKEN"))
    if not key:
        raise ValueError("Chave de IA não configurada no servidor.")
    return key


@lru_cache(maxsize=4)
def _openai_client(api_key):
    return OpenAI(api_key=api_key, timeout=90.0, max_retries=1)


def _options(system, messages, model, max_tokens, json_mode, auxiliary):
    if sum(len(m.get("content", "")) for m in messages) > 65000:
        raise ValueError("Contexto muito longo. Inicie outra conversa ou divida o documento.")
    options = dict(model=model, instructions=system, input=messages,
                   max_output_tokens=max_tokens, store=False)
    if model.startswith("gpt-5"):
        options["reasoning"] = {"effort": "none" if auxiliary else os.getenv("OPENAI_REASONING_EFFORT", "low")}
    if json_mode:
        options["text"] = {"format": {"type": "json_object"}}
        options["input"] = [{"role": "developer", "content": "Responda em JSON válido, conforme o formato das instruções."}] + messages
    return options


def _log_usage(response, model):
    usage = getattr(response, "usage", None)
    if usage:
        logger.info("AI usage model=%s input_tokens=%s output_tokens=%s", model,
                    usage.input_tokens, usage.output_tokens)


def _gemini(system, messages, model, key, max_tokens, json_mode, stream):
    # Legacy provider stays optional. The default path imports no Google SDK.
    import google.generativeai as genai
    genai.configure(api_key=key)
    config = {"max_output_tokens": max_tokens, "temperature": 0.2}
    if json_mode:
        config["response_mime_type"] = "application/json"
    client = genai.GenerativeModel(model, system_instruction=system, generation_config=config)
    history = [{"role": "model" if m["role"] == "assistant" else "user", "parts": [m["content"]]}
               for m in messages[:-1]]
    return client.start_chat(history=history).send_message(messages[-1]["content"], stream=stream)


def complete(system, messages, *, model=None, api_key=None, max_tokens=2400, json_mode=False, auxiliary=False):
    model = model or default_model(auxiliary)
    key = api_key or api_key_for_model(model)
    if "gemini" in model.lower():
        text = _gemini(system, messages, model, key, max_tokens, json_mode, False).text
    else:
        response = _openai_client(key).responses.create(**_options(system, messages, model, max_tokens, json_mode, auxiliary))
        _log_usage(response, model)
        if response.status != "completed":
            raise RuntimeError("A IA não concluiu a resposta dentro do limite configurado.")
        text = response.output_text
    if not text or not text.strip():
        raise RuntimeError("A IA retornou uma resposta vazia.")
    return text


def stream(system, messages, *, model=None, api_key=None, max_tokens=2400):
    model = model or default_model()
    key = api_key or api_key_for_model(model)
    if "gemini" in model.lower():
        for chunk in _gemini(system, messages, model, key, max_tokens, False, True):
            if chunk.text:
                yield chunk.text
        return
    options = _options(system, messages, model, max_tokens, False, False)
    with _openai_client(key).responses.stream(**options) as response_stream:
        for event in response_stream:
            if event.type == "response.output_text.delta":
                yield event.delta
            elif event.type in {"error", "response.failed", "response.incomplete"}:
                raise RuntimeError("A IA não conseguiu concluir a resposta. Tente novamente.")
        response = response_stream.get_final_response()
        _log_usage(response, model)
        if response.status != "completed" or not response.output_text:
            raise RuntimeError("Resposta da IA incompleta ou vazia.")
