
from flask import Blueprint, request, jsonify
from DAO.message_user_dao import UserMessageDAO
from DAO.chat_dao import ChatDAO
from middleware.jwt_util import token_required

message_bp = Blueprint('message', __name__, url_prefix='/messages')

@message_bp.route('/', methods=['POST'])
@token_required
def create_message():
    data = request.json
    current_user = request.user

    user_id = data.get('user_id')
    chat_id = data.get('chat_id')
    content = data.get('content')

    if not user_id or not chat_id or not content:
        return jsonify({'error': 'user_id, chat_id e content são obrigatórios'}), 400

    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    
    chat = ChatDAO.get_chat_by_id(chat_id)
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404

    message = UserMessageDAO.create_message(user_id, chat_id, content)
    return jsonify(message.to_dict()), 201


@message_bp.route('/<int:message_id>', methods=['GET'])
@token_required
def get_message(message_id):
    current_user = request.user
    message = UserMessageDAO.get_message_by_id(message_id)

    if not message:
        return jsonify({'error': 'Message not found'}), 404

    if current_user.id != message.user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    return jsonify(message.to_dict())


@message_bp.route('/user/<int:user_id>', methods=['GET'])
@token_required
def get_messages_by_user(user_id):
    current_user = request.user

    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    messages = UserMessageDAO.get_messages_by_user(user_id)
    return jsonify([m.to_dict() for m in messages])


@message_bp.route('/chat/<int:chat_id>', methods=['GET'])
@token_required
def get_messages_by_chat(chat_id):
    current_user = request.user
    chat = ChatDAO.get_chat_by_id(chat_id)

    if not chat:
        return jsonify({'error': 'Chat not found'}), 404

    if current_user.id != chat.user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    messages = UserMessageDAO.get_messages_by_chat(chat_id)
    return jsonify([m.to_dict() for m in messages])


@message_bp.route('/', methods=['GET'])
@token_required
def get_all_messages():
    current_user = request.user
    if not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    messages = UserMessageDAO.get_all_messages()
    return jsonify([m.to_dict() for m in messages])


@message_bp.route('/<int:message_id>', methods=['PUT'])
@token_required
def update_message(message_id):
    current_user = request.user
    message = UserMessageDAO.get_message_by_id(message_id)

    if not message:
        return jsonify({'error': 'Message not found'}), 404

    if current_user.id != message.user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    data = request.json
    updated_message = UserMessageDAO.update_message(message_id, data)
    if not updated_message:
        return jsonify({'error': 'Update failed'}), 400

    return jsonify(updated_message.to_dict())


@message_bp.route('/<int:message_id>', methods=['DELETE'])
@token_required
def delete_message(message_id):
    current_user = request.user
    message = UserMessageDAO.get_message_by_id(message_id)

    if not message:
        return jsonify({'error': 'Message not found'}), 404

    if current_user.id != message.user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    success = UserMessageDAO.delete_message(message_id)
    if not success:
        return jsonify({'error': 'Delete failed'}), 400

    return jsonify({'message': 'Message deleted'})
