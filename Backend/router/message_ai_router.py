from flask import Blueprint, request, jsonify, Response
from DAO.message_ai_dao import AIMessageDAO
from DAO.message_user_dao import UserMessageDAO
from DAO.chat_dao import ChatDAO
from datetime import datetime
from middleware.jwt_util import token_required
from services.ai_service import generate_response, generate_response_stream, get_avalilable_models

from dotenv import load_dotenv
import os
import json
import logging

load_dotenv()
openai_token = os.getenv("OPENAI_TOKEN")
logger = logging.getLogger(__name__)

message_ai_bp = Blueprint('ai_message', __name__, url_prefix='/ai-messages')


@message_ai_bp.route("/send", methods=["POST"])
@token_required
def send_message():
    """
    Compatível com frontend sem streaming (retorna JSON com ai_message)
    Mantido para compatibilidade. Se quiser streaming, use /send-stream (abaixo).
    """
    data = request.json or {}
    current_user = request.user

    chat_id = data.get("chat_id")
    content = data.get("content")
    model = data.get("model", "gpt-5.1")

    if not content or not chat_id:
        return jsonify({"error": "content e chat_id são obrigatórios"}), 400

    chat = ChatDAO.get_chat_by_id(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404

    if chat.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403

    # salva mensagem do usuário
    user_msg = UserMessageDAO.create_message(
        user_id=current_user.id,
        chat_id=chat_id,
        content=content,
    )

    # gera resposta (síncrona)
    ai_text = generate_response(
        user_id=current_user.id,
        chat_id=chat_id,
        openai_token=openai_token,
        model=model,
        prompt=content
    )

    if ai_text is None:
        return jsonify({"error": "AI generation failed"}), 500

    ai_msg = AIMessageDAO.create_message(
        chat_id=chat_id,
        content=ai_text,
        created_at=datetime.utcnow(),
        model=model,
    )

    return jsonify({
        "user_message": user_msg.to_dict(),
        "ai_message": ai_msg.to_dict()
    }), 201


@message_ai_bp.route("/send-stream", methods=["POST"])
@token_required
def send_stream():
    """
    Rota SSE que fornece token por token (event: chunk) e, ao final, event: end.
    O frontend deve abrir EventSource e escutar 'chunk' e 'end'.
    Body: { chat_id, content, model? }
    """
    data = request.json or {}
    current_user = request.user

    chat_id = data.get("chat_id")
    content = data.get("content")
    model = data.get("model", "gpt-5.1")

    if not content or not chat_id:
        return jsonify({"error": "content e chat_id são obrigatórios"}), 400

    chat = ChatDAO.get_chat_by_id(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404

    if chat.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403

    # 1) salva a mensagem do usuário
    UserMessageDAO.create_message(
        user_id=current_user.id,
        chat_id=chat_id,
        content=content
    )

    def event_stream():
        full_response = ""
        try:
            for token in generate_response_stream(
                user_id=current_user.id,
                chat_id=chat_id,
                openai_token=openai_token,
                model=model,
                prompt=content
            ):
                if token is None:
                    continue
                # normalize token to string
                chunk = str(token)
                full_response += chunk
                # envia evento 'chunk' com JSON { token: "<texto>" }
                payload = json.dumps({"token": chunk}, ensure_ascii=False)
                yield f"event: chunk\ndata: {payload}\n\n"
        except Exception as e:
            logger.exception("Error while streaming to client")
            err_payload = json.dumps({"error": str(e)})
            yield f"event: chunk\ndata: {err_payload}\n\n"

        # salva resposta completa no DB (se tem algo)
        if full_response.strip():
            AIMessageDAO.create_message(
                chat_id=chat_id,
                content=full_response,
                created_at=datetime.utcnow(),
                model=model
            )

        # sinaliza fim
        yield f"event: end\ndata: [DONE]\n\n"

    return Response(event_stream(), mimetype="text/event-stream")


# --- outras rotas CRUD (mantidas) ---
@message_ai_bp.route('/<int:message_id>', methods=['GET'])
@token_required
def get_ai_message(message_id):
    current_user = request.user
    message = AIMessageDAO.get_message_by_id(message_id)
    if not message:
        return jsonify({'error': 'Message not found'}), 404
    chat = ChatDAO.get_chat_by_id(message.chat_id)
    if current_user.id != chat.user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    return jsonify(message.to_dict())


@message_ai_bp.route('/chat/<int:chat_id>', methods=['GET'])
@token_required
def get_ai_messages_by_chat(chat_id):
    current_user = request.user
    chat = ChatDAO.get_chat_by_id(chat_id)
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404
    if current_user.id != chat.user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    messages = AIMessageDAO.get_messages_by_chat(chat_id)
    return jsonify([m.to_dict() for m in messages])

# Criar mensagem da IA (uso manual/admin)
@message_ai_bp.route('/', methods=['POST'])
@token_required
def create_ai_message():
    """
    Cria manualmente uma mensagem da IA (admin ou usuário dono).
    Body esperado: { user_id, chat_id, model?, prompt }
    """
    data = request.json or {}
    current_user = request.user

    user_id = data.get('user_id')
    chat_id = data.get('chat_id')
    model = data.get('model', 'gpt-5.1')
    prompt = data.get('prompt')

    if not user_id or not chat_id:
        return jsonify({'error': 'user_id e chat_id são obrigatórios'}), 400

    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    chat = ChatDAO.get_chat_by_id(chat_id)
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404

    try:
        ai_text = generate_response(
            user_id=user_id,
            chat_id=chat_id,
            openai_token=openai_token,
            model=model,
            prompt=prompt
        )
    except Exception as e:
        return jsonify({'error': 'AI generation error', 'detail': str(e)}), 500

    if not ai_text:
        return jsonify({'error': 'AI response generation failed'}), 500

    message_ai = AIMessageDAO.create_message(
        chat_id=chat_id,
        content=ai_text,
        created_at=datetime.utcnow(),
        model=model
    )

    return jsonify(message_ai.to_dict()), 201

# Obter por modelo
@message_ai_bp.route('/model/<string:model_name>', methods=['GET'])
@token_required
def get_ai_messages_by_model(model_name):
    current_user = request.user
    if not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    messages = AIMessageDAO.get_messages_by_model(model_name)
    return jsonify([m.to_dict() for m in messages])

# Obter por chat + modelo
@message_ai_bp.route('/chat/<int:chat_id>/model/<string:model_name>', methods=['GET'])
@token_required
def get_ai_messages_by_chat_and_model(chat_id, model_name):
    current_user = request.user
    chat = ChatDAO.get_chat_by_id(chat_id)

    if not chat:
        return jsonify({'error': 'Chat not found'}), 404

    if current_user.id != chat.user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    messages = AIMessageDAO.get_messages_by_chat_and_model(chat_id, model_name)
    return jsonify([m.to_dict() for m in messages])

# Obter todas as mensagens (admin)
@message_ai_bp.route('/', methods=['GET'])
@token_required
def get_all_ai_messages():
    current_user = request.user
    if not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    messages = AIMessageDAO.get_all_messages()
    return jsonify([m.to_dict() for m in messages])

@message_ai_bp.route('/<int:message_id>', methods=['PUT'])
@token_required
def update_ai_message(message_id):
    current_user = request.user
    message = AIMessageDAO.get_message_by_id(message_id)

    if not message:
        return jsonify({'error': 'Message not found'}), 404

    chat = ChatDAO.get_chat_by_id(message.chat_id)
    if current_user.id != chat.user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    data = request.json or {}
    updated_message = AIMessageDAO.update_message(message_id, data)
    if not updated_message:
        return jsonify({'error': 'Update failed'}), 400

    return jsonify(updated_message.to_dict())

@message_ai_bp.route('/<int:message_id>', methods=['DELETE'])
@token_required
def delete_ai_message(message_id):
    current_user = request.user
    message = AIMessageDAO.get_message_by_id(message_id)

    if not message:
        return jsonify({'error': 'Message not found'}), 404

    chat = ChatDAO.get_chat_by_id(message.chat_id)
    if current_user.id != chat.user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    success = AIMessageDAO.delete_message(message_id)
    if not success:
        return jsonify({'error': 'Delete failed'}), 400

    return jsonify({'message': 'AI Message deleted'})