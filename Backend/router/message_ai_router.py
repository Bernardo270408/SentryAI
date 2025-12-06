from flask import Blueprint, request, jsonify, Response, current_app
from DAO.message_ai_dao import AIMessageDAO
from DAO.message_user_dao import UserMessageDAO
from DAO.chat_dao import ChatDAO
from datetime import datetime
from middleware.jwt_util import token_required
from services.ai_service import (
    generate_response,
    generate_response_stream,
    generate_chat_title,
    get_available_models
)

from dotenv import load_dotenv
import os
import json
import logging

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_TOKEN = os.getenv("OPENAI_TOKEN")

logger = logging.getLogger(__name__)

message_ai_bp = Blueprint("ai_message", __name__, url_prefix="/ai-messages")


def get_api_key_for_model(model_name):
    """Helper para selecionar a chave correta baseada no modelo."""
    if "gemini" in model_name.lower():
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY não configurada no servidor")
        return GEMINI_API_KEY
    return OPENAI_TOKEN


def check_and_update_title(chat_id, user_content, history):
    """
    Se o histórico estiver vazio (primeira mensagem), gera um título
    com IA e atualiza o chat.
    """
    if not history:
        try:
            if user_content and isinstance(user_content, str):
                new_title = generate_chat_title(user_content)
                ChatDAO.update_chat(chat_id, {"name": new_title})
                logger.info(f"Chat {chat_id} renomeado para: {new_title}")
        except Exception as e:
            logger.error(f"Falha ao renomear chat: {e}")


@message_ai_bp.route("/send", methods=["POST"])
@token_required
def send_message():
    data = request.json or {}
    current_user = request.user

    user_id_primitive = current_user.id
    user_name = current_user.name

    chat_id = data.get("chat_id")
    content = data.get("content")

    model = data.get("model", "gemini-2.5-flash-preview-09-2025")

    if not content or not chat_id:
        return jsonify({"error": "content e chat_id são obrigatórios"}), 400

    chat = ChatDAO.get_chat_by_id(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404

    if chat.user_id != user_id_primitive and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403

    try:
        api_key = get_api_key_for_model(model)
    except ValueError as e:
        return jsonify({"error": str(e)}), 500

    history = ChatDAO.get_messages_formated(chat_id, limit=15) or []

    check_and_update_title(chat_id, content, history)

    user_msg = UserMessageDAO.create_message(
        user_id=user_id_primitive,
        chat_id=chat_id,
        content=content,
    )

    try:
        ai_text = generate_response(
            user_name=user_name,
            history=history,
            api_key=api_key,
            model=model,
            prompt=content,
        )
    except Exception as e:
        logger.exception("AI generation failed")
        return jsonify({"error": "AI generation failed", "details": str(e)}), 500

    if not ai_text:
        return jsonify({"error": "Empty response from AI"}), 500

    ai_msg = AIMessageDAO.create_message(
        chat_id=chat_id,
        content=ai_text,
        created_at=datetime.utcnow(),
        model=model,
    )

    return (
        jsonify({"user_message": user_msg.to_dict(), "ai_message": ai_msg.to_dict()}),
        201,
    )


@message_ai_bp.route("/send-stream", methods=["POST"])
@token_required
def send_stream():
    data = request.json or {}
    current_user = request.user

    user_id_primitive = current_user.id
    user_name = current_user.name
    is_admin = current_user.is_admin

    chat_id = data.get("chat_id")
    content = data.get("content")

    model = data.get("model", "gemini-2.5-flash-preview-09-2025")

    if not content or not chat_id:
        return jsonify({"error": "content e chat_id são obrigatórios"}), 400

    chat = ChatDAO.get_chat_by_id(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404

    if chat.user_id != user_id_primitive and not is_admin:
        return jsonify({"error": "Permission denied"}), 403

    try:
        api_key = get_api_key_for_model(model)
    except ValueError as e:
        return jsonify({"error": str(e)}), 500

    history = ChatDAO.get_messages_formated(chat_id) or []

    check_and_update_title(chat_id, content, history)

    UserMessageDAO.create_message(
        user_id=user_id_primitive, chat_id=chat_id, content=content
    )

    app = current_app._get_current_object()

    def event_stream():
        with app.app_context():
            full_response = ""
            try:
                for chunk in generate_response_stream(
                    user_name=user_name,
                    history=history,
                    api_key=api_key,
                    model=model,
                    prompt=content,
                ):
                    if chunk is None:
                        continue
                    chunk_str = str(chunk)
                    full_response += chunk_str

                    payload = json.dumps({"token": chunk_str}, ensure_ascii=False)
                    yield f"event: chunk\ndata: {payload}\n\n"

            except Exception as e:
                logger.exception("Error while streaming to client")
                err_msg = str(e)
                if "429" in err_msg:
                    err_msg = (
                        "Limite de requisições excedido. Tente novamente em instantes."
                    )

                err_payload = json.dumps({"error": err_msg})
                yield f"event: chunk\ndata: {err_payload}\n\n"

            if full_response.strip():
                try:
                    AIMessageDAO.create_message(
                        chat_id=chat_id,
                        content=full_response,
                        created_at=datetime.utcnow(),
                        model=model,
                    )
                except Exception as db_err:
                    logger.error(f"Failed to save AI message: {db_err}")

            yield f"event: end\ndata: [DONE]\n\n"

    return Response(event_stream(), mimetype="text/event-stream")


@message_ai_bp.route("/", methods=["POST"])
@token_required
def create_ai_message():
    data = request.json or {}
    current_user = request.user
    user_id_primitive = current_user.id

    target_user_id = data.get("user_id")
    chat_id = data.get("chat_id")

    model = data.get("model", "gemini-2.5-flash-preview-09-2025")

    prompt = data.get("prompt")

    if not target_user_id or not chat_id:
        return jsonify({"error": "user_id e chat_id são obrigatórios"}), 400

    if user_id_primitive != target_user_id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403

    chat = ChatDAO.get_chat_by_id(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404

    from DAO.user_dao import UserDAO

    target_user = UserDAO.get_user_by_id(target_user_id)
    target_user_name = target_user.name if target_user else "Usuário"

    history = ChatDAO.get_messages_formated(chat_id) or []

    check_and_update_title(chat_id, prompt, history)

    try:
        api_key = get_api_key_for_model(model)
    except ValueError as e:
        return jsonify({"error": str(e)}), 500

    try:
        ai_text = generate_response(
            user_name=target_user_name,
            history=history,
            api_key=api_key,
            model=model,
            prompt=prompt,
        )
    except Exception as e:
        return jsonify({"error": "AI generation error", "detail": str(e)}), 500

    if not ai_text:
        return jsonify({"error": "AI response generation failed"}), 500

    message_ai = AIMessageDAO.create_message(
        chat_id=chat_id, content=ai_text, created_at=datetime.utcnow(), model=model
    )

    return jsonify(message_ai.to_dict()), 201


@message_ai_bp.route("/<int:message_id>", methods=["GET"])
@token_required
def get_ai_message_detail(message_id):
    current_user = request.user
    message = AIMessageDAO.get_message_by_id(message_id)
    if not message:
        return jsonify({"error": "Message not found"}), 404
    chat = ChatDAO.get_chat_by_id(message.chat_id)
    if current_user.id != chat.user_id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403
    return jsonify(message.to_dict())


@message_ai_bp.route("/chat/<int:chat_id>", methods=["GET"])
@token_required
def get_ai_messages_by_chat(chat_id):
    current_user = request.user
    chat = ChatDAO.get_chat_by_id(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404
    if current_user.id != chat.user_id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403
    messages = AIMessageDAO.get_messages_by_chat(chat_id)
    return jsonify([m.to_dict() for m in messages])


@message_ai_bp.route("/model/<string:model_name>", methods=["GET"])
@token_required
def get_ai_messages_by_model(model_name):
    current_user = request.user
    if not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403
    messages = AIMessageDAO.get_messages_by_model(model_name)
    return jsonify([m.to_dict() for m in messages])


@message_ai_bp.route("/chat/<int:chat_id>/model/<string:model_name>", methods=["GET"])
@token_required
def get_ai_messages_by_chat_and_model(chat_id, model_name):
    current_user = request.user
    chat = ChatDAO.get_chat_by_id(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404
    if current_user.id != chat.user_id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403
    messages = AIMessageDAO.get_messages_by_chat_and_model(chat_id, model_name)
    return jsonify([m.to_dict() for m in messages])


@message_ai_bp.route("/", methods=["GET"])
@token_required
def get_all_ai_messages():
    current_user = request.user
    if not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403
    messages = AIMessageDAO.get_all_messages()
    return jsonify([m.to_dict() for m in messages])


@message_ai_bp.route("/<int:message_id>", methods=["PUT"])
@token_required
def update_ai_message(message_id):
    current_user = request.user
    message = AIMessageDAO.get_message_by_id(message_id)
    if not message:
        return jsonify({"error": "Message not found"}), 404
    chat = ChatDAO.get_chat_by_id(message.chat_id)
    if current_user.id != chat.user_id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403
    data = request.json or {}
    updated_message = AIMessageDAO.update_message(message_id, data)
    if not updated_message:
        return jsonify({"error": "Update failed"}), 400
    return jsonify(updated_message.to_dict())


@message_ai_bp.route("/<int:message_id>", methods=["DELETE"])
@token_required
def delete_ai_message(message_id):
    current_user = request.user
    message = AIMessageDAO.get_message_by_id(message_id)
    if not message:
        return jsonify({"error": "Message not found"}), 404
    chat = ChatDAO.get_chat_by_id(message.chat_id)
    if current_user.id != chat.user_id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403
    success = AIMessageDAO.delete_message(message_id)
    if not success:
        return jsonify({"error": "Delete failed"}), 400
    return jsonify({"message": "AI Message deleted"})

@message_ai_bp.route("/available_models", methods=["GET"])
def available_models():
    available_models = get_available_models(api_key=GEMINI_API_KEY, openai_token=OPENAI_TOKEN)
    
    return jsonify({"models":available_models})