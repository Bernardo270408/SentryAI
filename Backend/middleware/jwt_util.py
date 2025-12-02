import jwt
from functools import wraps
from flask import request, jsonify, current_app
from DAO.user_dao import UserDAO


def generate_token(user):
    """
    Gera um token JWT com payload básico (id, is_admin).
    """
    if not current_app.config.get("SECRET_KEY"):
        raise RuntimeError("SECRET_KEY não configurada")

    payload = {
        "id": user.id,
        "is_admin": user.is_admin,
        # Poderia incluir 'exp' para expiração do token
    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    return token


def decode_token(token):
    """
    Decodifica o token JWT, retornando o payload se válido, ou None se inválido.
    """
    try:
        payload = jwt.decode(
            token, current_app.config["SECRET_KEY"], algorithms=["HS256"]
        )
        return payload
    except jwt.ExpiredSignatureError:
        # Token expirado
        return None
    except jwt.InvalidTokenError:
        # Token inválido
        return None


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == "OPTIONS":
            # Não retorna nada — deixa o flask-cors responder
            return "", 200

        auth_header = request.headers.get("Authorization", None)
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token is missing"}), 401

        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if not payload:
            return jsonify({"error": "Token is invalid or expired"}), 401

        user = UserDAO.get_user_by_id(payload["id"])
        if not user:
            return jsonify({"error": "User not found"}), 401

        request.user = user
        request.user_payload = payload

        return f(*args, **kwargs)

    return decorated
