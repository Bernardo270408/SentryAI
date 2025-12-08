from sqlalchemy.orm import Session
from models import User
from typing import List, Optional

class UserRepo:
    @staticmethod
    def create_user(db: Session, user: User) -> Optional[User]:
        if UserRepo.get_user_by_email(db, user.email):
            # Melhor lançar exceção ou retornar uma mensagem, aqui retorno None para manter o padrão
            return None
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.get(User, user_id)

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_all_users(db: Session) -> List[User]:
        return db.query(User).all()

    @staticmethod
    def get_all_admins(db: Session) -> List[User]:
        return db.query(User).filter(User.is_admin == True).all()

    @staticmethod
    def is_user_admin(db: Session, user_id: int) -> bool:
        admin = db.query(User.is_admin).filter(User.id == user_id).scalar()
        return bool(admin)

    @staticmethod
    def update_user(db: Session, user_id: int, data: dict) -> Optional[User]:
        user = UserRepo.get_user_by_id(db, user_id)
        if not user:
            return None

        for k, v in data.items():
            setattr(user, k, v)

        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        user = UserRepo.get_user_by_id(db, user_id)
        if not user:
            return False
        db.delete(user)
        db.commit()
        return True
