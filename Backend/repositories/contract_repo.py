from models.contract import Contract
from extensions import db
from datetime import datetime, timezone


class ContractRepo:
    @staticmethod
    def create_contract(user_id, json_data, text):
        now = datetime.now(timezone.utc)
        contract = Contract(
            user_id=user_id, json=json_data, text=text, created_at=now, updated_at=now
        )
        db.session.add(contract)
        db.session.commit()
        return contract

    @staticmethod
    def get_contract_by_id(contract_id):
        return Contract.query.get(contract_id)

    @staticmethod
    def get_contracts_by_user(user_id):
        return Contract.query.filter_by(user_id=user_id).all()

    @staticmethod
    def get_all_contracts():
        return Contract.query.all()

    @staticmethod
    def update_contract(contract_id, data):
        contract = ContractRepo.get_contract_by_id(contract_id)
        if not contract:
            return None
        data.pop("id", None)
        contract.update_from_dict(data)
        contract.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        return contract

    @staticmethod
    def delete_contract(contract_id):
        contract = ContractRepo.get_contract_by_id(contract_id)
        if not contract:
            return False
        db.session.delete(contract)
        db.session.commit()
        return True
