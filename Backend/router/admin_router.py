from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from DAO.user_dao import UserDAO
from DAO.message_user_dao import UserMessageDAO
from middleware.jwt_util import token_required, admin_required
from services.ai_service import analyze_user_risk_profile
from datetime import datetime, timedelta

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

@admin_bp.route("/users", methods=["GET"])
@token_required
@admin_required
def get_all_users_admin():
    """Lista usuários com paginação e filtros de risco/busca."""
    search = request.args.get("search", "").lower()
    filter_risk = request.args.get("risk", "all") # all, safe, warning, danger
    
    query = User.query

    if search:
        query = query.filter(
            (User.name.ilike(f"%{search}%")) | 
            (User.email.ilike(f"%{search}%"))
        )

    users = query.all()
    results = []

    for u in users:
        # Lógica de filtro local (ou via DB se otimizar query)
        risk_level = "safe"
        # Dentro do loop for u in users:

        # 1. Trata o valor None convertendo para 0
        current_score = u.risk_profile_score if u.risk_profile_score is not None else 0

        risk_level = "safe" # Valor padrão

        # 2. Faz as comparações usando a variável tratada 'current_score'
        if current_score > 75: 
            risk_level = "danger"
        elif current_score > 30: 
            risk_level = "warning"

        # ... resto do código que monta o objeto de resposta ...

        if filter_risk != "all" and risk_level != filter_risk:
            continue

        results.append({
            **u.to_dict(),
            "msg_count": len(u.user_messages), # Contagem rápida
            "status": "Banned" if u.is_banned else "Active"
        })

    return jsonify(results)

@admin_bp.route("/analyze/<int:user_id>", methods=["POST"])
@token_required
@admin_required
def trigger_analysis(user_id):
    """Dispara análise de IA sob demanda para um usuário."""
    user = UserDAO.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    messages = UserMessageDAO.get_messages_by_user(user_id)
    texts = [m.content for m in messages]

    analysis = analyze_user_risk_profile(texts)

    user.risk_profile_score = analysis.get("score", 0)
    user.risk_profile_summary = analysis.get("summary", "N/A")
    user.last_risk_analysis = datetime.utcnow()
    
    db.session.commit()

    return jsonify(analysis)

@admin_bp.route("/ban/<int:user_id>", methods=["POST"])
@token_required
@admin_required
def ban_user(user_id):
    data = request.json
    duration_hours = data.get("duration") 
    reason = data.get("reason")

    if not reason or len(reason.strip()) < 5:
        return jsonify({"error": "É obrigatório fornecer um motivo para o banimento (min. 5 caracteres)."}), 400

    user = UserDAO.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if user.is_admin:
        return jsonify({"error": "Não é possível banir um administrador."}), 400

    user.is_banned = True
    user.ban_reason = reason
    
    if duration_hours:
        user.ban_expires_at = datetime.utcnow() + timedelta(hours=int(duration_hours))
    else:
        user.ban_expires_at = None # Permanente

    db.session.commit()
    return jsonify({
        "message": "Usuário banido.", 
        "reason": reason,
        "expires": user.ban_expires_at
    })

@admin_bp.route("/unban/<int:user_id>", methods=["POST"])
@token_required
@admin_required
def unban_user(user_id):
    user = UserDAO.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.is_banned = False
    user.ban_expires_at = None
    user.ban_reason = None
    
    db.session.commit()
    return jsonify({"message": "Banimento removido."})