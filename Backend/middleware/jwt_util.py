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
        # Poderia incluir 'exp' para expiração do token se desejar
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
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Permite preflight requests do CORS
        if request.method == "OPTIONS":
            return "", 200

        auth_header = request.headers.get("Authorization", None)
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token is missing"}), 401

        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if not payload:
            return jsonify({"error": "Token is invalid or expired"}), 401

        # Busca o usuário no banco para garantir que ele ainda existe e verificar status
        user = UserDAO.get_user_by_id(payload["id"])
        
        if not user:
            return jsonify({"error": "User not found"}), 401

        # --- BLOQUEIO DE SEGURANÇA IMEDIATO ---
        # Verifica se o usuário foi banido APÓS ter recebido o token
        if user.is_banned:
            return jsonify({
                "error": "Conta suspensa",
                "message": "Sua conta foi banida administrativamente.",
                "force_logout": True # Flag para o frontend identificar
            }), 403
        # --------------------------------------

        request.user = user
        request.user_payload = payload

        return f(*args, **kwargs)

    return decorated

def admin_required(f):
    """
    Decorador para rotas que exigem privilégios de administrador.
    Deve ser colocado APÓS @token_required.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        current_user = request.user
        if not current_user.is_admin:
            return jsonify({"error": "Acesso Negado. Privilégios de administrador requeridos."}), 403
        return f(*args, **kwargs)
    return decorated