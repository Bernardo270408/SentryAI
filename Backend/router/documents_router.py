from flask import Blueprint, request, jsonify
from services.jusbrasil_service import JusbrasilService
from flask_cors import CORS

documents_bp = Blueprint('documents', __name__)

# --- CORREÇÃO AQUI ---
# Habilita CORS especificamente para este blueprint. 
# Isso cria automaticamente a rota OPTIONS para /documents/search e responde com os headers corretos.
CORS(documents_bp) 
# ---------------------

@documents_bp.route('/search', methods=['GET'])
def search_docs():
    query = request.args.get('q', '')
    try:
        results = JusbrasilService.search_documents(query)
        return jsonify({"success": True, "data": results})
    except Exception as e:
        print(f"Erro na busca: {e}") # Log para debug
        return jsonify({"success": False, "error": str(e)}), 500