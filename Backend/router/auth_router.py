from flask import Blueprint, request, jsonify
from DAO.user_dao import UserDAO
from models.user import User
from extensions import db
from werkzeug.security import check_password_hash
from middleware.jwt_util import generate_token
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from datetime import datetime
import os

auth_bp = Blueprint("auth_bp", __name__)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    password_input = str(data.get("password", ""))

    if not data or not data.get("email") or not password_input:
        return jsonify({"error": "Email e senha são obrigatórios"}), 400

    user = UserDAO.get_user_by_email(data["email"])

    if user and user.password and check_password_hash(user.password, password_input):
        if not user.is_verified:
            return (
                jsonify(
                    {
                        "error": "E-mail não verificado.",
                        "need_verification": True,
                        "email": user.email,
                    }
                ),
                403,
            )

        token = generate_token(user)
        user_dict = user.to_dict()
        user_dict.pop("password", None)
        return jsonify({"token": token, "user": user_dict}), 200

    return jsonify({"error": "Credenciais inválidas"}), 401


@auth_bp.route("/verify-email", methods=["POST"])
def verify_email():
    data = request.json
    email = data.get("email")
    code = data.get("code")

    if not email or not code:
        return jsonify({"error": "Email e código são obrigatórios"}), 400

    user = UserDAO.get_user_by_email(email)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    if user.is_verified:
        token = generate_token(user)
        return (
            jsonify(
                {
                    "message": "Usuário já verificado",
                    "token": token,
                    "user": user.to_dict(),
                }
            ),
            200,
        )

    if user.verification_code != code:
        return jsonify({"error": "Código incorreto"}), 400

    if (
        user.verification_code_expires_at
        and user.verification_code_expires_at < datetime.utcnow()
    ):
        return jsonify({"error": "Código expirado. Solicite um novo."}), 400

    user.is_verified = True
    user.verification_code = None
    user.verification_code_expires_at = None
    db.session.commit()

    token = generate_token(user)

    return (
        jsonify(
            {
                "message": "Conta verificada com sucesso!",
                "token": token,
                "user": user.to_dict(),
            }
        ),
        200,
    )


@auth_bp.route("/google-login", methods=["POST"])
def google_login():
    data = request.json
    token_google = data.get("credential")

    if not token_google:
        return jsonify({"error": "Token do Google não fornecido"}), 400

    try:
        idinfo = id_token.verify_oauth2_token(
            token_google, google_requests.Request(), GOOGLE_CLIENT_ID
        )

        email = idinfo["email"]
        google_id = idinfo["sub"]
        name = idinfo.get("name", "Google User")

        user = UserDAO.get_user_by_email(email)

        if not user:
            # Usuários do Google são automaticamente verificados
            user = User(
                name=name,
                email=email,
                password=None,
                google_id=google_id,
                is_verified=True,
            )
            db.session.add(user)
            db.session.commit()
        else:
            # Se já existe, vincula o google_id e marca como verificado
            changed = False
            if not user.google_id:
                user.google_id = google_id
                changed = True
            if not user.is_verified:
                user.is_verified = True
                changed = True

            if changed:
                db.session.commit()

        token = generate_token(user)
        return jsonify({"token": token, "user": user.to_dict()}), 200

    except ValueError as e:
        return jsonify({"error": "Token Google inválido", "details": str(e)}), 400
