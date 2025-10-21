from flask import Blueprint, request, jsonify
from DAO.rating_dao import RatingDAO
from DAO.chat_dao import ChatDAO
from middleware.jwt_util import token_required
from extensions import db

rating_bp = Blueprint('rating', __name__, url_prefix='/ratings')

@rating_bp.route('/', methods=['POST'])
@token_required
def create_rating():
    data = request.json
    current_user = request.user

    user_id = data.get('user_id')
    score = data.get('score')
    chat_id = data.get('chat_id')
    feedback = data.get('feedback')

    if not user_id or score is None:
        return jsonify({'error': 'user_id, chat_id e score são obrigatórios.'}), 400
    
    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    
    
    chat = ChatDAO.get_chat_by_id(chat_id)

    if not chat:
        return jsonify({'error': 'Chat not found'}), 404    
    
    rating = RatingDAO.create_rating(user_id, score, feedback)

    ChatDAO.update_chat(chat_id, {'rating_id': rating.id})

    return jsonify(rating.to_dict()), 201
    

@rating_bp.route('/', methods=['GET'])
@token_required
def get_all_ratings():
    current_user = request.user
    print(current_user)

    if not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    
    ratings = RatingDAO.get_all_ratings()
    return jsonify([r.to_dict() for r in ratings])


@rating_bp.route('/<int:rating_id>', methods=['GET'])
@token_required
def get_rating(rating_id):
    rating = RatingDAO.get_rating_by_id(rating_id)
    if not rating:
        return jsonify({'error': 'Rating não encontrado.'}), 404
    current_user = request.user
    if current_user.id != rating.user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    return jsonify(rating.to_dict())


@rating_bp.route('/user/<int:user_id>', methods=['GET'])
@token_required
def get_ratings_by_user(user_id):
    current_user = request.user
    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    ratings = RatingDAO.get_ratings_by_user(user_id)
    return jsonify([r.to_dict() for r in ratings])


@rating_bp.route('/chat/<int:chat_id>', methods=['GET'])
@token_required
def get_rating_by_chat(chat_id):
    current_user = request.user

    if not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    
    ratings = [ChatDAO.get_rating_by_chat(chat_id)]
    
    return jsonify([r.to_dict() for r in ratings])


@rating_bp.route('/<int:rating_id>', methods=['PUT'])
@token_required
def update_rating(rating_id):
    data = request.json or {}
    rating = RatingDAO.get_rating_by_id(rating_id)
    if not rating:
        return jsonify({'error': 'Rating não encontrado.'}), 404
    current_user = request.user
    if current_user.id != rating.user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    allowed = {'score', 'feedback'}
    payload = {k: v for k, v in data.items() if k in allowed}
    updated = RatingDAO.update_rating(rating_id, payload)
    if not updated:
        return jsonify({'error': 'Erro ao atualizar rating.'}), 400
    return jsonify(updated.to_dict())


@rating_bp.route('/<int:rating_id>', methods=['DELETE'])
@token_required
def delete_rating(rating_id):
    rating = RatingDAO.get_rating_by_id(rating_id)
    if not rating:
        return jsonify({'error': 'Rating não encontrado.'}), 404
    current_user = request.user
    if current_user.id != rating.user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    success = RatingDAO.delete_rating(rating_id)
    if not success:
        return jsonify({'error': 'Erro ao deletar rating.'}), 500
    return jsonify({'message': 'Rating deletado com sucesso.'})
    
@rating_bp.route('/score/<int:score>', methods=['GET'])
@token_required
def get_ratings_by_score(score):
    current_user = request.user
    if not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    ratings = RatingDAO.get_ratings_by_score(score)
    return jsonify([r.to_dict() for r in ratings])

@rating_bp.route('/with_feedback', methods=['GET'])
@token_required
def get_ratings_with_feedback():
    current_user = request.user
    if not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    ratings = RatingDAO.get_ratings_with_feedback()
    return jsonify([r.to_dict() for r in ratings])
