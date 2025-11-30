from flask import Blueprint, request, jsonify
from middleware.jwt_util import token_required
from services.ai_service import analyze_contract_text, chat_about_contract
from services.file_reader_service import extract_text_from_file
from DAO.contract_dao import ContractDAO
import logging


contract_bp = Blueprint('contract', __name__, url_prefix='/contract')
logger = logging.getLogger(__name__)

# só pra padronizar eu deixei acessível em /, mas a rota antiga funciona normalmente também
@contract_bp.route('/', methods=['POST'])
@contract_bp.route('/analyze', methods=['POST'])
@token_required
def analyze():
    data = request.json or {}
    current_user = request.user

    user_id = data.get('user_id')
    text_content = data.get('text')
    uploaded_file = request.files.get('file')

    content_to_analyze = ""

    if not user_id:
        return jsonify({'error': 'Campo user_id obrigatório'}), 400

    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Acesso negado'}), 403
    
    if uploaded_file:
        try:
            content_to_analyze = extract_text_from_file(uploaded_file.stream, uploaded_file.filename)
        except Exception as e:
            logger.exception("Erro ao extrair texto do arquivo")
            return jsonify({"error": f"Falha ao processar o arquivo: {str(e)}"}), 400
            
    elif text_content:
        content_to_analyze = text_content

    else:
        return jsonify({"error": "Nenhum texto ou arquivo fornecido."}), 400


    try:    
        analysis_json = analyze_contract_text(content_to_analyze)
        contract = ContractDAO.create_contract(user_id, analysis_json)

        return jsonify(contract), 200

    except Exception as e:
        logger.exception("Erro na análise de contrato")
        return jsonify({"error": str(e)}), 500

@contract_bp.route('/', methods=['GET'])
@token_required
def get_contracts():
    current_user = request.user
    data = request.json or {}
    user_id = data.get('user_id')

    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Acesso negado'}), 403
    
    contracts = ContractDAO.get_all_contracts()
    return jsonify([c.to_dict() for c in contracts])
    

@contract_bp.route('/<int:contract_id>', methods=['GET'])
@token_required
def get_contract(contract_id):
    current_user = request.user
    data = request.json or {}
    user_id = data.get('user_id')

    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Acesso negado'}), 403
    
    contract = ContractDAO.get_contract_by_id(contract_id)
    if not contract:
        return jsonify({'error': 'Contrato não encontrado'}), 404
    
    return jsonify(contract.to_dict())

@contract_bp.route('/user/<int:user_id>', methods=['GET'])
@token_required
def get_contracts_by_user(user_id):
    current_user = request.user
    data = request.json or {}
    user_id = data.get('user_id')

    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Acesso negado'}), 403
    
    contracts = ContractDAO.get_contracts_by_user(user_id)
    return jsonify([c.to_dict() for c in contracts])

@contract_bp.route('/<int:contract_id>', methods=['PUT'])
@token_required
def update_contract(contract_id):
    data = request.json or {}
    user_id = data.get('user_id')

    current_user = request.user

    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Acesso negado'}), 403
    
    contract = ContractDAO.update_contract(contract_id, data)
    if not contract:
        return jsonify({'error': 'Contrato não encontrado ou erro ao atualizar'}), 404
    
    return jsonify(contract.to_dict()), 200

@contract_bp.route('/<int:contract_id>', methods=['DELETE'])
@token_required
def delete_contract(contract_id):
    current_user = request.user
    data = request.json or {}
    user_id = data.get('user_id')

    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Acesso negado'}), 403
    
    success = ContractDAO.delete_contract(contract_id)
    if not success:
        return jsonify({'error': 'Contrato não encontrado ou erro ao deletar'}), 404
    
    return jsonify({'message': 'Contrato deletado com sucesso'}), 200

@contract_bp.route('/chat', methods=['POST'])
@token_required
def chat_contract():
    """
    Chat simples sobre o contexto do contrato analisado.
    """
    data = request.json or {}
    user_id = data.get('user_id')
    message = data.get('message')
    context_summary = data.get('context', '')

    current_user = request.user

    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Acesso negado'}), 403

    if not message:
        return jsonify({"error": "Mensagem obrigatória"}), 400

    try:
        reply = chat_about_contract(message, context_summary)
        return jsonify({"reply": reply})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
