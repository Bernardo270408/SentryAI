from flask import Blueprint, request, jsonify
from DAO.message_ai_dao import AIMessageDAO
from DAO.message_user_dao import UserMessageDAO
from DAO.chat_dao import ChatDAO
from datetime import datetime
from middleware.jwt_util import token_required
from services.ai_service import AIService

ai_message_bp = Blueprint('ai_message', __name__, url_prefix='/ai-messages')

@ai_message_bp.route('/', methods=['POST'])
@token_required
def create_ai_message():
    data = request.json
    current_user = request.user
    
    user_id = data.get('user_id')
    chat_id = data.get('chat_id')
    model = data.get('model')
    
    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    
    chat = ChatDAO.get_chat_by_id(chat_id)
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404
    
    # Getting the prompt
    user_message_id = data.get('user_message.id')
    prompt = UserMessageDAO.get_message_by_id(user_message_id)
    
    if not prompt:
        return jsonify({'error': 'User message not found'}), 404
    
    # Generating AI response
    content = AIService.generate_response(user_id, chat_id, model, prompt)
    created_at = datetime.utcnow()
    
    if not content:
        return jsonify({'error': 'AI response generation failed'}), 500
    
    message_ai = AIMessageDAO.create_message(chat_id=chat_id, content=content, created_at=created_at, model=model)
    message_ai_dict = message_ai.to_dict()
    return jsonify(message_ai_dict), 201 
    
@ai_message_bp.route('/<int:message_id>', methods=['GET'])
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


@ai_message_bp.route('/chat/<int:chat_id>', methods=['GET'])
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


@ai_message_bp.route('/model/<string:model_name>', methods=['GET'])
@token_required
def get_ai_messages_by_model(model_name):
    current_user = request.user
    if not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    messages = AIMessageDAO.get_messages_by_model(model_name)
    return jsonify([m.to_dict() for m in messages])


@ai_message_bp.route('/chat/<int:chat_id>/model/<string:model_name>', methods=['GET'])
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


@ai_message_bp.route('/', methods=['GET'])
@token_required
def get_all_ai_messages():
    current_user = request.user
    if not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    messages = AIMessageDAO.get_all_messages()
    return jsonify([m.to_dict() for m in messages])


@ai_message_bp.route('/<int:message_id>', methods=['PUT'])
@token_required
def update_ai_message(message_id):
    current_user = request.user
    message = AIMessageDAO.get_message_by_id(message_id)

    if not message:
        return jsonify({'error': 'Message not found'}), 404

    chat = ChatDAO.get_chat_by_id(message.chat_id)
    if current_user.id != chat.user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    data = request.json
    updated_message = AIMessageDAO.update_message(message_id, data)
    if not updated_message:
        return jsonify({'error': 'Update failed'}), 400

    return jsonify(updated_message.to_dict())


@ai_message_bp.route('/<int:message_id>', methods=['DELETE'])
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