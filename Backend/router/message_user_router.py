from flask import Blueprint, request, jsonify
from DAO.message_user_dao import UserMessageDAO
from middleware.jwt_util import token_required

message_user_bp = Blueprint("user_message", __name__, url_prefix="/messages")


@message_user_bp.route("/", methods=["POST"])
@token_required
def create_message():
    current_user = request.user
    data = request.json

    chat_id = data.get("chat_id")
    content = data.get("content")

    if not chat_id or not content:
        return jsonify({"error": "chat_id e content são obrigatórios."}), 400

    message = UserMessageDAO.create_message(
        user_id=current_user.id,
        chat_id=chat_id,
        content=content
    )

    return jsonify(message.to_dict()), 201


@message_user_bp.route("/<int:message_id>", methods=["GET"])
@token_required
def get_message(message_id):
    message = UserMessageDAO.get_message_by_id(message_id)
    if not message:
        return jsonify({"error": "Mensagem não encontrada."}), 404

    return jsonify(message.to_dict())


@message_user_bp.route("/user/<int:user_id>", methods=["GET"])
@token_required
def get_messages_by_user(user_id):
    current_user = request.user

    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403

    messages = UserMessageDAO.get_messages_by_user(user_id)
    return jsonify([m.to_dict() for m in messages])


@message_user_bp.route("/chat/<int:chat_id>", methods=["GET"])
@token_required
def get_messages_by_chat(chat_id):
    messages = UserMessageDAO.get_messages_by_chat(chat_id)
    return jsonify([m.to_dict() for m in messages])


@message_user_bp.route("/<int:message_id>", methods=["PUT"])
@token_required
def update_message(message_id):
    current_user = request.user
    data = request.json

    message = UserMessageDAO.get_message_by_id(message_id)
    if not message:
        return jsonify({"error": "Mensagem não encontrada."}), 404

    if current_user.id != message.user_id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403

    allowed_fields = {"content"}
    data = {k: v for k, v in data.items() if k in allowed_fields}

    updated_message = UserMessageDAO.update_message(message_id, data)

    return jsonify(updated_message.to_dict()), 200


@message_user_bp.route("/<int:message_id>", methods=["DELETE"])
@token_required
def delete_message(message_id):
    current_user = request.user
    message = UserMessageDAO.get_message_by_id(message_id)

    if not message:
        return jsonify({"error": "Mensagem não encontrada."}), 404

    # Só o autor da mensagem ou admin pode deletar
    if current_user.id != message.user_id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403

    success = UserMessageDAO.delete_message(message_id)
    if not success:
        return jsonify({"error": "Erro ao deletar mensagem."}), 500

    return jsonify({"message": "Mensagem deletada com sucesso."})
