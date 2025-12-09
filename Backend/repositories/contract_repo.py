from sqlalchemy.orm import Session
from models import Contract

class ContractRepo:
    @staticmethod
    def create_contract(db: Session, user_id:int, json_data: str, text: str, created_at: str):
        contract = Contract(
            user_id=user_id, 
            json=json_data, 
            text=text, 
            created_at=created_at, 
            updated_at=created_at
        )
        db.add(contract)
        db.commit()
        db.refresh(contract)
        return contract

    @staticmethod
    def get_contract_by_id(db: Session, contract_id: int):
        return db.query(Contract).get(contract_id)

    @staticmethod
    def get_contracts_by_user(db: Session, user_id: int):
        return db.query(Contract).filter_by(user_id=user_id).all()

    @staticmethod
    def get_all_contracts(db: Session):
        return db.query(Contract).all()

    @staticmethod
    def update_contract(db: Session, contract_id: int, data: dict):
        contract = ContractRepo.get_contract_by_id(contract_id)
        if not contract:
            return None
        
        
        for k,v in data.items():
            setattr(contract,k,v)
        
        db.commit()
        db.refresh(contract)
        return contract

    @staticmethod
    def delete_contract(db: Session, contract_id: int):
        contract = ContractRepo.get_contract_by_id(contract_id)
        if not contract:
            return False
        db.delete(contract)
        db.commit()
        return True
