from flask import Blueprint, request, jsonify
from middleware.jwt_util import token_required
from services.ai_service import analyze_contract_text, chat_about_contract
import logging

contract_bp = Blueprint('contract', __name__, url_prefix='/contract')
logger = logging.getLogger(__name__)

@contract_bp.route('/analyze', methods=['POST'])
@token_required
def analyze():
    """
    Recebe um arquivo ou texto e retorna uma análise estruturada (JSON).
    """
    try:
        # 1. Verificar se veio arquivo ou texto
        text_content = request.form.get('text')
        uploaded_file = request.files.get('file')

        content_to_analyze = ""

        if uploaded_file:
            # Tenta ler como texto utf-8 (simples)
            # Para suportar PDF/Imagens nativamente, seria necessário 
            # salvar o arquivo temporariamente e usar genai.upload_file
            try:
                content_to_analyze = uploaded_file.read().decode('utf-8')
            except UnicodeDecodeError:
                return jsonify({"error": "O arquivo deve ser de texto (txt, md, csv). Para PDFs, copie e cole o conteúdo."}), 400
        elif text_content:
            content_to_analyze = text_content
        else:
            return jsonify({"error": "Nenhum texto ou arquivo fornecido."}), 400

        # 2. Chamar serviço de IA (Forçando JSON)
        # Modelo definido no frontend ou padrão do backend
        # Usaremos o gemini-2.5-flash-preview-09-2025 que é excelente para isso
        
        analysis_json = analyze_contract_text(content_to_analyze)
        
        return jsonify(analysis_json), 200

    except Exception as e:
        logger.exception("Erro na análise de contrato")
        return jsonify({"error": str(e)}), 500


@contract_bp.route('/chat', methods=['POST'])
@token_required
def chat_contract():
    """
    Chat simples sobre o contexto do contrato analisado.
    """
    data = request.json or {}
    message = data.get('message')
    context_summary = data.get('context', '')

    if not message:
        return jsonify({"error": "Mensagem obrigatória"}), 400

    try:
        reply = chat_about_contract(message, context_summary)
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500