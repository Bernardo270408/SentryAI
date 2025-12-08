from sqlalchemy.orm import Session
from models.user import User
from models.message_user import UserMessage
from typing import List, Optional
import datetime

class UserDAO:
    @staticmethod
    def create_user(db: Session, user: User) -> User:
        """
        Recebe um objeto User (instanciado), faz persistência e commit.
        """
        if UserDAO.get_user_by_email(db, user.email):
            return None
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).get(user_id)

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
        user = db.query(User).get(user_id)
        return bool(user and user.is_admin)

    @staticmethod
    def update_user(db: Session, user_id: int, data: dict) -> Optional[User]:
        user = UserDAO.get_user_by_id(db, user_id)
        if not user:
            return None
        data.pop("id", None)
        # expected user has an update_from_dict or we set attrs manually
        for k, v in data.items():
            setattr(user, k, v)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        user = UserDAO.get_user_by_id(db, user_id)
        if not user:
            return False
        db.delete(user)
        db.commit()
        return True
