from flask import Blueprint, request, jsonify
from DAO.chat_dao import ChatDAO
from middleware.jwt_util import token_required
from services import ai_service
from dotenv import load_dotenv

chat_bp = Blueprint("chat", __name__, url_prefix="/chats")


@chat_bp.route("/", methods=["POST"])
@token_required
def create_chat():
    current_user = request.user
    data = request.json

    name = data.get("name")

    if name and len(name) > 100:
        return jsonify({"error": "O campo 'name' deve ter no máximo 100 caracteres."}), 400

    # Cria o chat vinculando diretamente ao usuário logado
    chat = ChatDAO.create_chat(user_id=current_user.id, name=name)
    return jsonify(chat.to_dict()), 201


@chat_bp.route("/<int:chat_id>", methods=["GET"])
@token_required
def get_chat(chat_id):
    current_user = request.user
    chat = ChatDAO.get_chat_by_id(chat_id)

    if not chat:
        return jsonify({"error": "Chat não encontrado."}), 404

    if chat.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403

    return jsonify(chat.to_dict())


@chat_bp.route("/user/<int:user_id>", methods=["GET"])
@token_required
def get_chats_by_user(user_id):
    current_user = request.user

    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403

    chats = ChatDAO.get_chats_by_user(user_id)
    return jsonify([c.to_dict() for c in chats]), 200


@chat_bp.route("/", methods=["GET"])
@token_required
def get_all_chats():
    current_user = request.user

    # Apenas admins podem ver todos os chats
    if not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403

    chats = ChatDAO.get_all_chats()
    return jsonify([c.to_dict() for c in chats])


@chat_bp.route("/<int:chat_id>", methods=["PUT"])
@token_required
def update_chat(chat_id):
    current_user = request.user
    data = request.json

    chat = ChatDAO.get_chat_by_id(chat_id)
    if not chat:
        return jsonify({"error": "Chat não encontrado."}), 404

    if chat.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403
    
    name = data.get("name")
    if name and len(name) > 100:
        return jsonify({"error": "O campo 'name' deve ter no máximo 100 caracteres."}), 400


    allowed_fields = {"name"}
    data = {k: v for k, v in data.items() if k in allowed_fields}

    updated_chat = ChatDAO.update_chat(chat_id, data)
    return jsonify(updated_chat.to_dict()), 200


@chat_bp.route("/<int:chat_id>", methods=["DELETE"])
@token_required
def delete_chat(chat_id):
    current_user = request.user
    chat = ChatDAO.get_chat_by_id(chat_id)

    if not chat:
        return jsonify({"error": "Chat não encontrado."}), 404

    if chat.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403

    success = ChatDAO.delete_chat(chat_id)
    if not success:
        return jsonify({"error": "Erro ao deletar chat."}), 500

    return jsonify({"message": "Chat deletado com sucesso."})

@chat_bp.route("/<int:chat_id>/rating", methods=["GET"])
@token_required
def get_rating_by_chat(chat_id):
    current_user = request.user
    chat = ChatDAO.get_chat_by_id(chat_id)

    if not chat:
        return jsonify({"error": "Chat não encontrado."}), 404

    if chat.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403

    rating = ChatDAO.get_rating_by_chat(chat_id)
    if not rating:
        return jsonify({"error": "Rating não encontrado para este chat."}), 404

    return jsonify(rating.to_dict()), 200

# gerador de nome de chat usando AI
@chat_bp.route("/<int:chat_id>/generate_name", methods=["POST"])
@token_required
def generate_chat_name(chat_id):
    current_user = request.user
    chat = ChatDAO.get_chat_by_id(chat_id)

    if not chat:
        return jsonify({"error": "Chat não encontrado."}), 404

    if chat.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403

    # Gera um nome usando o serviço de AI
    generated_name = ai_service.generate_chat_name(chat_id)
    if not generated_name:
        return jsonify({"error": "Erro ao gerar nome para o chat."}), 500
    
    # Atualiza o nome do chat
    updated_chat = ChatDAO.update_chat(chat_id, {"name": generated_name})
    return jsonify(updated_chat.to_dict()), 200
