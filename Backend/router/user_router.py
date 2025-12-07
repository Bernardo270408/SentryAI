from flask import Blueprint, request, jsonify
from DAO.user_dao import UserDAO
from models.user import User
from extensions import db
from werkzeug.security import generate_password_hash
from email_validator import validate_email, EmailNotValidError
from services.email_service import generate_verification_code, send_verification_email
from datetime import datetime, timedelta
from middleware.jwt_util import token_required
from schemas import UserCreateSchema
from pydantic import ValidationError

user_bp = Blueprint("user", __name__, url_prefix="/users")

@user_bp.route("/", methods=["POST"])
def create_user():
    # 1. Validação Automática com Pydantic
    try:
        # Valida o JSON de entrada contra o Schema
        payload = UserCreateSchema(**request.json)
    except ValidationError as e:
        # Retorna erro detalhado automaticamente se falhar
        return jsonify({"error": "Dados inválidos", "details": e.errors()}), 400

    # 2. Lógica de Negócio (Agora limpa de verificações básicas)
    if UserDAO.get_user_by_email(payload.email):
        return jsonify({"error": "Email já está em uso."}), 400

    password_hash = generate_password_hash(payload.password)
    code = generate_verification_code()
    expiration = datetime.utcnow() + timedelta(minutes=15)

    user = User(
        name=payload.name,
        email=payload.email,
        password=password_hash,
        extra_data=payload.extra_data,
        is_verified=False,
        verification_code=code,
        verification_code_expires_at=expiration,
    )

    db.session.add(user)
    db.session.commit()

    send_verification_email(payload.email, code)

    return jsonify({
        "message": "Usuário criado. Verifique seu e-mail.",
        "email": payload.email,
        "need_verification": True,
        "user": user.to_dict(),
    }), 201

@user_bp.route("/email/<email>", methods=["GET"])
def get_user_by_email(email):
    user = UserDAO.get_user_by_email(email)

    if not user:
        return jsonify({"error": "Usuário não encontrado."}), 404

    return jsonify(user.to_dict())


@user_bp.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = UserDAO.get_user_by_id(user_id)

    if not user:
        return jsonify({"error": "Usuário não encontrado."}), 404

    return jsonify(user.to_dict())


@user_bp.route("/", methods=["GET"])
def get_all_users():
    users = UserDAO.get_all_users()
    return jsonify([u.to_dict() for u in users])


@user_bp.route("/<int:user_id>", methods=["PUT"])
@token_required
def update_user(user_id):
    data = request.json
    current_user = request.user
    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403

    allowed_fields = {"name", "email", "password", "extra_data"}
    data = {k: v for k, v in data.items() if k in allowed_fields}

    if "password" in data:
        data["password"] = generate_password_hash(data["password"])

    user = UserDAO.update_user(user_id, data)
    if not user:
        return jsonify({"error": "Usuário não encontrado."}), 404

    user_dict = user.to_dict()
    user_dict.pop("password", None)
    return jsonify(user_dict), 201


@user_bp.route("/<int:user_id>", methods=["DELETE"])
@token_required
def delete_user(user_id):
    current_user = request.user
    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({"error": "Permission denied"}), 403

    success = UserDAO.delete_user(user_id)
    if not success:
        return jsonify({"error": "Usuário não encontrado."}), 404

    return jsonify({"message": "Usuário deletado com sucesso."})

@user_bp.route("/appeal", methods=["POST"])
def submit_appeal():
    """
    Rota pública para usuários banidos enviarem recurso.
    Valida pelo e-mail cadastrado.
    """
    data = request.json
    email = data.get("email")
    message = data.get("message")
    
    if not email or not message:
        return jsonify({"error": "Email e mensagem são obrigatórios."}), 400
        
    user = UserDAO.get_user_by_email(email)
    
    if not user:
        return jsonify({"error": "E-mail não encontrado."}), 404
        
    if not user.is_banned:
        return jsonify({"error": "Esta conta não está banida."}), 400
        
    # Salva o recurso como JSON no banco
    appeal_payload = {
        "message": message,
        "date": datetime.utcnow().isoformat(),
        "status": "pending"
    }
    
    user.appeal_data = appeal_payload
    db.session.commit()
    
    return jsonify({"message": "Recurso enviado com sucesso. Aguarde análise de um moderador."})