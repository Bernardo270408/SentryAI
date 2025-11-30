from flask import Blueprint, jsonify, request
from DAO.chat_dao import ChatDAO
from DAO.message_user_dao import UserMessageDAO
from services.ai_service import generate_dashboard_insight, analyze_user_doubts
from middleware.jwt_util import token_required
from datetime import datetime, timedelta
from collections import defaultdict, Counter

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')

@dashboard_bp.route('/stats', methods=['GET'])
@token_required
def get_dashboard_stats():
    user = request.user
    user_id = user.id
    
    chats = ChatDAO.get_chats_by_user(user_id)
    messages = UserMessageDAO.get_messages_by_user(user_id)
    
    chat_map = {c.id: c.name for c in chats}
    
    total_chats = len(chats)
    total_messages = len(messages)
    
    # --- ALERTAS DE RISCO ---
    risk_keywords = {
        'abusiva': 'Cláusula potencialmente abusiva',
        'multa': 'Risco financeiro / Penalidade',
        'rescisão': 'Término de contrato',
        'urgente': 'Ação imediata requerida',
        'prazo': 'Atenção a datas e vencimentos',
        'danos': 'Possível litígio (Danos)',
        'justa causa': 'Risco trabalhista elevado'
    }
    
    risks_detected = 0
    risk_alerts = []
    sorted_msgs = sorted(messages, key=lambda m: m.created_at, reverse=True)

    for m in sorted_msgs:
        content_lower = m.content.lower()
        for kw, desc in risk_keywords.items():
            if kw in content_lower:
                risks_detected += 1
                if len(risk_alerts) < 5:
                    chat_name = chat_map.get(m.chat_id, "Chat Arquivado")
                    risk_alerts.append({
                        "id": m.id,
                        "date": m.created_at.strftime("%d/%m"),
                        "chat": chat_name,
                        "risk_type": kw.capitalize(),
                        "description": desc,
                        "snippet": (m.content[:60] + '...') if len(m.content) > 60 else m.content
                    })
                break

    # --- ANÁLISE DE DÚVIDAS REAIS (IA) ---
    # Extrai o texto das mensagens para enviar à IA
    user_msgs_text = [m.content for m in sorted_msgs] # Já ordenadas (mais recentes primeiro)
    
    top_doubts = []
    if user_msgs_text:
        # Envia as 15 mais recentes para análise
        top_doubts = analyze_user_doubts(user_msgs_text[:15])
    else:
        top_doubts = ["Nenhuma dúvida registrada."]

    # --- CATEGORIAS ---
    cat_counter = Counter()
    for m in messages:
        c_name = chat_map.get(m.chat_id, "Geral")
        cat_counter[c_name] += 1

    if not messages:
        categories_data = [{'name': 'Sem dados', 'value': 1}]
    else:
        categories_data = [{"name": k, "value": v} for k, v in cat_counter.most_common(5)]

    # --- ATIVIDADE ---
    activity_map = defaultdict(lambda: {"consultas": 0})
    today = datetime.now().date()
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        key = day.strftime("%d/%m")
        _ = activity_map[key]

    for msg in messages:
        if msg.created_at:
            msg_date = msg.created_at.date()
            if (today - msg_date).days <= 7:
                key = msg_date.strftime("%d/%m")
                activity_map[key]["consultas"] += 1

    chart_data = [{"name": k, "consultas": v["consultas"]} for k, v in activity_map.items()]
    
    # --- HISTÓRICO ---
    sorted_chats = sorted(chats, key=lambda c: c.created_at, reverse=True)[:4]
    history_data = []
    for c in sorted_chats:
        history_data.append({
            "id": c.id,
            "action": c.name if c.name else "Nova Conversa",
            "date": c.created_at.strftime("%d/%m %H:%M"),
            "status": "Ativo"
        })

    # --- INSIGHT ---
    last_msg_content = sorted_msgs[0].content if sorted_msgs else ""
    ai_insight = {"type": "neutral", "text": "Inicie uma conversa para receber dicas."}
    if last_msg_content:
        try:
            insight_text = generate_dashboard_insight(user.name, last_msg_content)
            ai_insight = {"type": "success", "text": insight_text}
        except: pass

    return jsonify({
        "kpis": {
            "active_cases": total_chats,
            "docs_analyzed": total_messages,
            "risks_avoided": risks_detected,
            "next_deadline": "Verificar"
        },
        "chart_data": chart_data,
        "categories": categories_data,
        "history": history_data,
        "risk_alerts": risk_alerts,
        "insight": ai_insight,
        "top_doubts": top_doubts  # <--- Enviado para o front
    })