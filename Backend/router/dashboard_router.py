from flask import Blueprint, jsonify, request
from DAO.chat_dao import ChatDAO
from DAO.message_user_dao import UserMessageDAO
from services.ai_service import generate_dashboard_insight
from middleware.jwt_util import token_required
from datetime import datetime, timedelta
from collections import defaultdict

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')

@dashboard_bp.route('/stats', methods=['GET'])
@token_required
def get_dashboard_stats():
    user = request.user
    user_id = user.id
    
    # 1. Recuperar dados brutos
    chats = ChatDAO.get_chats_by_user(user_id)
    messages = UserMessageDAO.get_messages_by_user(user_id)
    
    # 2. Calcular KPIs
    total_chats = len(chats)
    total_messages = len(messages)
    
    # Simulação de "Risco Evitado" baseado em palavras-chave nas mensagens (já que não temos tabela de análise ainda)
    risk_keywords = ['multa', 'processo', 'abusiva', 'rescisão', 'danos']
    risks_detected = sum(1 for m in messages if any(k in m.content.lower() for k in risk_keywords))
    
    # 3. Dados do Gráfico de Atividade (Últimos 7 dias)
    activity_map = defaultdict(lambda: {"consultas": 0, "analises": 0})
    today = datetime.now().date()
    
    # Inicializa os últimos 7 dias com 0
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_str = day.strftime("%d/%m") # Ex: 30/11
        # Garante que a chave existe
        _ = activity_map[day_str]

    for msg in messages:
        if msg.created_at:
            msg_date = msg.created_at.date()
            if (today - msg_date).days <= 7:
                key = msg_date.strftime("%d/%m")
                # Assumindo que msg de chat = consulta
                activity_map[key]["consultas"] += 1

    # Converter para lista ordenada para o Recharts
    chart_data = [{"name": k, "consultas": v["consultas"], "analises": v["analises"]} 
                  for k, v in activity_map.items()]
    # Ordenar pela data (se necessário, mas o dict preserves insertion order em Py3.7+)
    
    # 4. Histórico Recente (Últimos 5 chats modificados)
    # Ordenar chats por data de criação (ou update se tivesse) decrescente
    sorted_chats = sorted(chats, key=lambda c: c.created_at, reverse=True)[:4]
    history_data = []
    for c in sorted_chats:
        history_data.append({
            "id": c.id,
            "action": c.name if c.name else "Nova Conversa",
            "date": c.created_at.strftime("%d/%m %H:%M"),
            "status": "Ativo" # Placeholder
        })

    # 5. Insight da IA (Gera uma dica baseada na última interação)
    last_message = messages[-1].content if messages else ""
    ai_insight = {
        "type": "neutral",
        "text": "Comece uma nova análise para receber dicas personalizadas."
    }
    
    if last_message:
        try:
            # Gera insight real se houver mensagens
            insight_text = generate_dashboard_insight(user.name, last_message)
            ai_insight = {
                "type": "success", 
                "text": insight_text
            }
        except Exception as e:
            print(f"Erro ao gerar insight: {e}")

    return jsonify({
        "kpis": {
            "active_cases": total_chats,
            "docs_analyzed": total_messages, # Usando msgs como proxy de volume por enquanto
            "risks_avoided": risks_detected,
            "next_deadline": "N/A" # Precisaria de lógica de extração de datas
        },
        "chart_data": chart_data,
        "history": history_data,
        "insight": ai_insight
    })