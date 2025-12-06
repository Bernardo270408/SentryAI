from flask import Blueprint, request, jsonify, current_app
from middleware.jwt_util import token_required
from services.ai_service import analyze_contract_text, chat_about_contract
from services.file_reader_service import extract_text_from_file
from DAO.contract_dao import ContractDAO
import logging
import threading
from concurrent.futures import ThreadPoolExecutor

contract_bp = Blueprint("contract", __name__, url_prefix="/contract")
logger = logging.getLogger(__name__)

# Executor para tarefas de fundo (background tasks)
# max_workers=2 impede que o servidor seja sobrecarregado com muitas análises simultâneas
executor = ThreadPoolExecutor(max_workers=2)

def background_analysis(app, contract_id, text_content):
    """
    Função que roda em thread separada para analisar o contrato 
    sem bloquear a resposta da API.
    """
    # É necessário criar um contexto de aplicação para acessar o Banco de Dados dentro da thread
    with app.app_context(): 
        try:
            logger.info(f"Iniciando análise background para contrato ID {contract_id}")
            
            # Chama a IA (processo lento)
            analysis_json = analyze_contract_text(text_content)
            
            # Atualiza o contrato existente com o resultado final
            ContractDAO.update_contract(contract_id, {
                "json": analysis_json
            })
            logger.info(f"Análise concluída com sucesso para contrato ID {contract_id}")
            
        except Exception as e:
            logger.error(f"Falha na análise background do contrato {contract_id}: {e}")
            # Em caso de erro, salva o estado de erro no JSON do contrato
            ContractDAO.update_contract(contract_id, {
                "json": {
                    "summary": "Falha no processamento.", 
                    "risk": {"score": 0, "label": "Erro"},
                    "error": str(e)
                }
            })

@contract_bp.route("/analyze", methods=["POST"])
@token_required
def analyze():
    # Suporta tanto JSON quanto Form Data (para uploads de arquivo)
    data = request.get_json(silent=True) or request.form
    current_user = request.user

    user_id = data.get("user_id")
    text_content = data.get("text")
    uploaded_file = request.files.get("file")

    content_to_analyze = ""

    # Validações Básicas
    if not user_id:
        return jsonify({"error": "Campo user_id obrigatório"}), 400

    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({"error": "user_id inválido"}), 400

    # Verifica permissão (apenas o dono ou admin pode analisar para aquele ID)
    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({"error": "Acesso negado"}), 403

    # Extração de Texto
    if uploaded_file:
        try:
            # Nota: extract_text_from_file já deve ter as validações de segurança (Magic Numbers) aplicadas
            content_to_analyze = extract_text_from_file(
                uploaded_file.stream, uploaded_file.filename
            )
        except Exception as e:
            logger.exception("Erro ao extrair texto do arquivo")
            return jsonify({"error": f"Falha ao processar o arquivo: {str(e)}"}), 400

    elif text_content:
        content_to_analyze = text_content

    else:
        return jsonify({"error": "Nenhum texto ou arquivo fornecido."}), 400

    # JSON Inicial (Placeholder enquanto processa)
    initial_json = {
        "summary": "A IA está analisando seu documento. Isso pode levar alguns segundos...",
        "risk": {"score": 0, "label": "Processando"},
        "highlights": []
    }

    try:
        # 1. Cria o registro no banco IMEDIATAMENTE
        contract = ContractDAO.create_contract(
            user_id, initial_json, content_to_analyze
        )

        # 2. Envia a tarefa pesada para o executor em background
        # current_app._get_current_object() é necessário para passar o contexto real do Flask para a thread
        executor.submit(
            background_analysis, 
            current_app._get_current_object(), 
            contract.id, 
            content_to_analyze
        )

        # 3. Retorna HTTP 202 (Accepted) imediatamente para o frontend não travar
        return jsonify({
            "message": "Análise iniciada.",
            "contract": contract.to_dict(),
            "status": "processing"
        }), 202

    except Exception as e:
        logger.exception("Erro ao iniciar análise")
        return jsonify({"error": str(e)}), 500

@contract_bp.route("/", methods=["GET"])
@token_required
def get_contracts():
    current_user = request.user
    data = request.args
    user_id = data.get("user_id")

    if user_id:
        try:
            user_id = int(user_id)
            if current_user.id != user_id and not current_user.is_admin:
                return jsonify({"error": "Acesso negado"}), 403
        except:
            pass

    if not current_user.is_admin:
        pass

    contracts = ContractDAO.get_all_contracts()
    return jsonify([c.to_dict() for c in contracts])


@contract_bp.route("/<int:contract_id>", methods=["GET"])
@token_required
def get_contract(contract_id):
    current_user = request.user

    contract = ContractDAO.get_contract_by_id(contract_id)
    if not contract:
        return jsonify({"error": "Contrato não encontrado"}), 404

    if current_user.id != contract.user_id and not current_user.is_admin:
        return jsonify({"error": "Acesso negado"}), 403

    return jsonify(contract.to_dict())


@contract_bp.route("/user/<int:user_id>", methods=["GET"])
@token_required
def get_contracts_by_user(user_id):
    current_user = request.user

    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({"error": "Acesso negado"}), 403

    contracts = ContractDAO.get_contracts_by_user(user_id)
    return jsonify([c.to_dict() for c in contracts])


@contract_bp.route("/<int:contract_id>", methods=["PUT"])
@token_required  # e admin only
def update_contract(contract_id):
    data = request.json or {}
    current_user = request.user

    if not current_user.is_admin:
        return jsonify({"error": "Acesso negado"}), 403

    contract = ContractDAO.update_contract(contract_id, data)
    if not contract:
        return jsonify({"error": "Contrato não encontrado ou erro ao atualizar"}), 404

    return jsonify(contract.to_dict()), 200


@contract_bp.route("/<int:contract_id>", methods=["DELETE"])
@token_required
def delete_contract(contract_id):
    current_user = request.user
    contract = ContractDAO.get_contract_by_id(contract_id)

    if not contract:
        return jsonify({"error": "Contrato não encontrado"}), 404

    if current_user.id != contract.user_id and not current_user.is_admin:
        return jsonify({"error": "Acesso negado"}), 403

    success = ContractDAO.delete_contract(contract_id)
    if not success:
        return jsonify({"error": "Erro ao deletar"}), 500

    return jsonify({"message": "Contrato deletado com sucesso"}), 200


@contract_bp.route("/chat", methods=["POST"])
@token_required
def chat_contract():
    """
    Chat simples sobre o contexto do contrato analisado.
    """
    data = request.json or {}
    user_id = data.get("user_id")
    message = data.get("message")
    context_summary = data.get("context", "")

    current_user = request.user

    if user_id and current_user.id != int(user_id) and not current_user.is_admin:
        return jsonify({"error": "Acesso negado"}), 403

    if not message:
        return jsonify({"error": "Mensagem obrigatória"}), 400

    try:
        reply = chat_about_contract(message, context_summary)
        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
