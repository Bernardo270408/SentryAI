from flask import Blueprint, request, jsonify
from DAO.user_dao import UserDAO
from middleware.jwt_util import token_required
from werkzeug.security import generate_password_hash

user_bp = Blueprint('user', __name__, url_prefix='/users')

@user_bp.route('/', methods=['POST'])
def create_user():
	data = request.json

	name = data.get('name')
	email = data.get('email')
	extra_data = data.get('extra_data')
	
    #Hashing Password
	password = generate_password_hash(data.get('password'))
	
	if not name or not email or not password:
		return jsonify({'error': 'Nome, email e senha são obrigatórios.'}), 400
	
	user = UserDAO.create_user(name, email, password, extra_data)

	if not user:
		return jsonify({'error': 'Email já está em uso.'}), 400

	user_dict = user.to_dict()
	user_dict.pop('password', None)
	return jsonify(user_dict), 201

@user_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
	user = UserDAO.get_user_by_id(user_id)
	
	if not user:
		return jsonify({'error': 'Usuário não encontrado.'}), 404
	
	return jsonify(user.to_dict())

@user_bp.route('/', methods=['GET'])
def get_all_users():
	users = UserDAO.get_all_users() 
	return jsonify([u.to_dict() for u in users])

@user_bp.route('/<int:user_id>', methods=['PUT'])
@token_required
def update_user(user_id):
	current_user = request.user
	data = request.json
	
    #Permission Control
	if current_user.id != user_id and not current_user.is_admin:
		return jsonify({'error': 'Permission denied'}), 403
	
    #Allowed Fields
	allowed_fields = {'name', 'email', 'password', 'extra_data'}
	data = {k: v for k, v in data.items() if k in allowed_fields}

    #Hash Password
	if 'password' in data:
		data['password'] = generate_password_hash(data['password'])

    #Update User
	user = UserDAO.update_user(user_id, data)
	if not user:
		return jsonify({'error': 'Usuário não encontrado.'}), 404
    
	user_dict = user.to_dict()
	user_dict.pop('password', None)
	return jsonify(user_dict), 201

@user_bp.route('/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(user_id):
    current_user = request.user
	
    #Permission Control
    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission denied'}), 403

    #Remove User
    success = UserDAO.delete_user(user_id)
    if not success:
        return jsonify({'error': 'Usuário não encontrado.'}), 404
    
    return jsonify({'message': 'Usuário deletado com sucesso.'})

