from flask import Blueprint, request, jsonify
from DAO.chat_dao import ChatDAO
from middleware.jwt_util import token_required

chat_bp = Blueprint('chat', __name__, url_prefix='/chats')

@chat_bp.route('/', methods=['POST'])
@token_required
def create_chat():
    data = request.json
    current_user = request.user

    user_id = data.get('user_id')
    name = data.get('name')

    if not user_id or not name:
        return jsonify({'error': 'O ID do usuário e o nome são obrigatórios'}), 400

    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    chat = ChatDAO.create_chat(user_id, name)
    return jsonify(chat.to_dict()), 201

@chat_bp.route('/<int:chat_id>', methods=['GET'])
@token_required
def get_chat(chat_id):
    current_user = request.user
    chat = ChatDAO.get_chat_by_id(chat_id)

    if not chat:
        return jsonify({'error': 'Chat not found'}), 404

    if current_user.id != chat.user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    return jsonify(chat.to_dict())

@chat_bp.route('/user/<int:user_id>', methods=['GET'])
@token_required
def get_chats_by_user(user_id):
    current_user = request.user

    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    chats = ChatDAO.get_chats_by_user(user_id)
    return jsonify([c.to_dict() for c in chats])

@chat_bp.route('/', methods=['GET'])
@token_required
def get_all_chats():
    current_user = request.user
    if not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    chats = ChatDAO.get_all_chats()
    return jsonify([c.to_dict() for c in chats])

@chat_bp.route('/<int:chat_id>', methods=['PUT'])
@token_required
def update_chat(chat_id):
    current_user = request.user
    chat = ChatDAO.get_chat_by_id(chat_id)
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404
    if current_user.id != chat.user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    data = request.json
    updated_chat = ChatDAO.update_chat(chat_id, data)
    if not updated_chat:
        return jsonify({'error': 'Update failed'}), 400
    return jsonify(updated_chat.to_dict())

@chat_bp.route('/<int:chat_id>', methods=['DELETE'])
@token_required
def delete_chat(chat_id):
    current_user = request.user
    chat = ChatDAO.get_chat_by_id(chat_id)
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404
    if current_user.id != chat.user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    success = ChatDAO.delete_chat(chat_id)
    if not success:
        return jsonify({'error': 'Delete failed'}), 400
    return jsonify({'message': 'Chat deleted'})

