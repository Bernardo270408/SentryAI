from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from DAO.user_dao import UserDAO
from DAO.message_user_dao import UserMessageDAO
from middleware.jwt_util import token_required, admin_required
from services.ai_service import analyze_user_risk_profile
from datetime import datetime, timedelta
from sqlalchemy import or_

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

@admin_bp.route("/users", methods=["GET"])
@token_required
@admin_required
def get_all_users_admin():
    search = request.args.get("search", "").lower()
    filter_risk = request.args.get("risk", "all")
    
    query = User.query

    if search:
        query = query.filter(
            (User.name.ilike(f"%{search}%")) | 
            (User.email.ilike(f"%{search}%"))
        )

    users = query.all()
    results = []

    for u in users:
        current_score = u.risk_profile_score if u.risk_profile_score is not None else 0
        risk_level = "safe"
        if current_score > 75: risk_level = "danger"
        elif current_score > 30: risk_level = "warning"

        if filter_risk != "all" and risk_level != filter_risk:
            continue

        results.append({
            **u.to_dict(),
            "msg_count": len(u.user_messages),
            "status": "Banned" if u.is_banned else "Active"
        })

    return jsonify(results)

@admin_bp.route("/analyze/<int:user_id>", methods=["POST"])
@token_required
@admin_required
def trigger_analysis(user_id):
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
    current_admin = request.user
    data = request.json
    duration_hours = data.get("duration") 
    reason = data.get("reason")

    if not reason or len(reason.strip()) < 5:
        return jsonify({"error": "É obrigatório fornecer um motivo (min. 5 caracteres)."}), 400

    user = UserDAO.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if user.is_admin:
        return jsonify({"error": "Não é possível banir um administrador."}), 400

    user.is_banned = True
    user.ban_reason = reason
    user.banned_by_id = current_admin.id  # Salva quem baniu
    
    if duration_hours:
        user.ban_expires_at = datetime.utcnow() + timedelta(hours=int(duration_hours))
    else:
        user.ban_expires_at = None

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
    user.banned_by_id = None
    user.appeal_data = None # Limpa o recurso se houver
    
    db.session.commit()
    return jsonify({"message": "Banimento removido."})

# --- NOVAS ROTAS DE RECURSO ---

@admin_bp.route("/appeals", methods=["GET"])
@token_required
@admin_required
def get_appeals():
    """
    Retorna lista de usuários que enviaram recurso.
    FILTRO CRÍTICO: Exclui usuários banidos pelo admin atual.
    Inclui usuários onde banned_by_id é NULL (banimentos antigos ou de sistema).
    """
    current_admin_id = request.user.id
    
    # Busca usuários banidos que tenham dados de apelação
    # Lógica: (Quem baniu NÃO é o admin atual) OU (Ninguém assinou o banimento/Legacy)
    users = User.query.filter(
        User.is_banned == True,
        User.appeal_data.isnot(None),
        or_(
            User.banned_by_id != current_admin_id,
            User.banned_by_id.is_(None)
        )
    ).all()
    
    results = []
    for u in users:
        # Filtro adicional em Python para garantir que só pegamos os pendentes
        # (Dependendo do banco, filtrar JSON via SQL pode ser complexo, aqui é seguro)
        if u.appeal_data and u.appeal_data.get("status") == "pending":
            results.append({
                "user_id": u.id,
                "user_name": u.name,
                "user_email": u.email,
                "ban_reason": u.ban_reason,
                "appeal": u.appeal_data 
            })
        
    return jsonify(results)

@admin_bp.route("/appeal/<int:user_id>/resolve", methods=["POST"])
@token_required
@admin_required
def resolve_appeal(user_id):
    """Aceita (desbane) ou Rejeita (mantém ban) o recurso."""
    data = request.json
    action = data.get("action") # 'approve' ou 'reject'
    
    user = UserDAO.get_user_by_id(user_id)
    if not user: return jsonify({"error": "User not found"}), 404
    
    if action == "approve":
        user.is_banned = False
        user.ban_reason = None
        user.ban_expires_at = None
        user.banned_by_id = None
        user.appeal_data = None # Limpa recurso
        msg = "Recurso aceito. Usuário desbanido."
        
    elif action == "reject":
        # Mantém banido, mas limpa o pedido para não aparecer mais na lista pendente
        # Ou atualiza status para 'rejected' para manter histórico
        appeal = dict(user.appeal_data)
        appeal['status'] = 'rejected'
        appeal['admin_note'] = 'Recurso negado após análise.'
        user.appeal_data = appeal # Atualiza JSON
        msg = "Recurso negado. Banimento mantido."
        
    else:
        return jsonify({"error": "Ação inválida."}), 400
        
    db.session.commit()
    return jsonify({"message": msg})