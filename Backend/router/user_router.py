from flask import Blueprint, request, jsonify
from DAO.user_dao import UserDAO
from models.user import User
from extensions import db
from werkzeug.security import generate_password_hash
from email_validator import validate_email, EmailNotValidError
from services.email_service import generate_verification_code, send_verification_email
from datetime import datetime, timedelta

user_bp = Blueprint('user', __name__, url_prefix='/users')

@user_bp.route('/', methods=['POST'])
def create_user():
    data = request.json

    name = data.get('name')
    email = data.get('email')
    password_raw = data.get('password')
    extra_data = data.get('extra_data')
    
    # Validação de Email
    try:
        valid = validate_email(email)
        email = valid.email
    except EmailNotValidError as e:
        return jsonify({'error': str(e)}), 400

    if not name or not email or not password_raw:
        return jsonify({'error': 'Nome, email e senha são obrigatórios.'}), 400
    
    # Verifica se já existe
    if UserDAO.get_user_by_email(email):
        return jsonify({'error': 'Email já está em uso.'}), 400

    # Hash da senha
    password_hash = generate_password_hash(str(password_raw))

    # Geração do OTP
    code = generate_verification_code()
    expiration = datetime.utcnow() + timedelta(minutes=15)

    # Criação do usuário (Não verificado)
    user = User(
        name=name, 
        email=email, 
        password=password_hash, 
        extra_data=extra_data,
        is_verified=False,
        verification_code=code,
        verification_code_expires_at=expiration
    )
    
    db.session.add(user)
    db.session.commit()

    # Envia e-mail
    sent = send_verification_email(email, code)
    msg = 'Usuário criado. Verifique seu e-mail para ativar a conta.'
    if not sent:
        msg += ' (Aviso: Falha ao enviar e-mail. Verifique o log do servidor para o código em modo DEV).'

    return jsonify({
        'message': msg,
        'email': email,
        'need_verification': True
    }), 201

@user_bp.route('/email/<email>', methods=['GET'])
def get_user_by_email(email):
    user = UserDAO.get_user_by_email(email)
    
    if not user:
        return jsonify({'error': 'Usuário não encontrado.'}), 404
    
    return jsonify(user.to_dict())

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
# @token_required removido para exemplo, ideal manter
def update_user(user_id):
    # Nota: Em produção, descomente o @token_required e importe
    # from middleware.jwt_util import token_required
    # current_user = request.user
    
    data = request.json
    
    # Permission Control (Exemplo simplificado)
    # if current_user.id != user_id and not current_user.is_admin:
    #     return jsonify({'error': 'Permission denied'}), 403
    
    allowed_fields = {'name', 'email', 'password', 'extra_data'}
    data = {k: v for k, v in data.items() if k in allowed_fields}

    if 'password' in data:
        data['password'] = generate_password_hash(data['password'])

    user = UserDAO.update_user(user_id, data)
    if not user:
        return jsonify({'error': 'Usuário não encontrado.'}), 404
    
    user_dict = user.to_dict()
    user_dict.pop('password', None)
    return jsonify(user_dict), 201

@user_bp.route('/<int:user_id>', methods=['DELETE'])
# @token_required
def delete_user(user_id):
    # current_user = request.user
    # if current_user.id != user_id and not current_user.is_admin:
    #     return jsonify({'error': 'Permission denied'}), 403

    success = UserDAO.delete_user(user_id)
    if not success:
        return jsonify({'error': 'Usuário não encontrado.'}), 404
    
    return jsonify({'message': 'Usuário deletado com sucesso.'})