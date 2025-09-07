from flask import Blueprint, request, jsonify
from DAO.user_dao import UserDAO
from werkzeug.security import check_password_hash
from middleware.jwt_util import generate_token

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    data["password"] = str(data["password"])
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email e senha são obrigatórios'}), 400

    user = UserDAO.get_user_by_email(data['email'])

    if user and check_password_hash(user.password, data['password']):
        token = generate_token(user)
        user_dict = user.to_dict()
        user_dict.pop('password', None)  # NUNCA enviar senha ao cliente
        return jsonify({'token': token, 'user': user_dict}), 200

    return jsonify({'error': 'Credenciais inválidas'}), 401