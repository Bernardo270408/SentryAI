from flask import request, jsonify, Blueprint

test_bp = Blueprint('test_bp', __name__)


@test_bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "API is running"}), 200