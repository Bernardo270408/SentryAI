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
    
    # --- 1. PREPARAR CATEGORIAS E TOP DOUBTS ---
    sorted_msgs = sorted(messages, key=lambda m: m.created_at, reverse=True)
    
    # Categorias (Top 10)
    cat_counter = Counter()
    for m in messages:
        c_name = chat_map.get(m.chat_id, "Geral")
        cat_counter[c_name] += 1

    # Lista das top categorias (strings) para garantir que o gráfico saiba o que desenhar
    if not messages:
        top_categories_list = []
        categories_data = [{'name': 'Sem dados', 'value': 1}]
    else:
        most_common = cat_counter.most_common(10)
        categories_data = [{"name": k, "value": v} for k, v in most_common]
        top_categories_list = [k for k, v in most_common] # Lista de nomes: ['Direito Civil', 'Trabalhista'...]

    # --- 2. DADOS DO GRÁFICO DE VOLUME (CORRIGIDO) ---
    today = datetime.now().date()
    chart_data = []

    # Cria os últimos 7 dias
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_str = day.strftime("%d/%m")
        
        # Inicializa o objeto do dia com 0 para TODAS as categorias principais
        # Isso corrige o erro das linhas não aparecerem
        day_entry = {"name": day_str}
        for cat_name in top_categories_list:
            day_entry[cat_name] = 0
            
        chart_data.append(day_entry)

    # Preenche com os dados reais
    for msg in messages:
        if msg.created_at:
            msg_date = msg.created_at.date()
            days_diff = (today - msg_date).days
            
            # Se está dentro dos últimos 7 dias (0 a 6)
            if 0 <= days_diff <= 6:
                # O índice no array chart_data é: 6 - days_diff
                # Ex: Hoje (diff 0) é o ultimo item (index 6)
                idx = 6 - days_diff
                
                cat_name = chat_map.get(msg.chat_id, "Geral")
                
                # Só conta se a categoria estiver no top 10 (para bater com as cores)
                if cat_name in top_categories_list:
                    chart_data[idx][cat_name] += 1

    # --- 3. ALERTAS DE RISCO ---
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

    # --- 4. OUTROS ---
    user_msgs_text = [m.content for m in sorted_msgs]
    top_doubts = analyze_user_doubts(user_msgs_text[:15]) if user_msgs_text else ["Nenhuma dúvida registrada."]

    sorted_chats = sorted(chats, key=lambda c: c.created_at, reverse=True)[:10]
    history_data = [{"id": c.id, "action": c.name or "Nova Conversa", "date": c.created_at.strftime("%d/%m %H:%M"), "status": "Ativo"} for c in sorted_chats]

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
        "top_doubts": top_doubts
    })