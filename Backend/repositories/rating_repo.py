from sqlalchemy.orm import Session
from sqlalchemy import func
from models.rating import Rating


class RatingRepo:
    @staticmethod
    def create_rating(db: Session, user_id: int, score: int, feedback: str = None):
        rating = Rating(
            user_id=user_id,
            score=score,
            feedback=feedback
        )

        db.add(rating)
        db.commit()
        db.refresh(rating)
        return rating

    @staticmethod
    def get_rating_by_id(db: Session, rating_id: int):
        return db.get(Rating, rating_id)

    @staticmethod
    def get_ratings_by_user(db: Session, user_id: int):
        return db.query(Rating).filter(Rating.user_id == user_id).all()

    @staticmethod
    def get_all_ratings(db: Session):
        return db.query(Rating).all()

    @staticmethod
    def update_rating(db: Session, rating_id: int, data: dict):
        rating = RatingRepo.get_rating_by_id(db, rating_id)
        if not rating:
            return None

        for k, v in data.items():
            if hasattr(rating, k):
                setattr(rating, k, v)

        db.commit()
        db.refresh(rating)
        return rating

    @staticmethod
    def delete_rating(db: Session, rating_id: int):
        rating = RatingRepo.get_rating_by_id(db, rating_id)
        if not rating:
            return False

        db.delete(rating)
        db.commit()
        return True

    @staticmethod
    def get_ratings_by_score(db: Session, score: int):
        return db.query(Rating).filter(Rating.score == score).all()

    @staticmethod
    def get_ratings_with_feedback(db: Session):
        return db.query(Rating).filter(Rating.feedback.isnot(None)).all()

    @staticmethod
    def get_chat_by_rating(db: Session, rating_id: int):
        rating = RatingRepo.get_rating_by_id(db, rating_id)
        return rating.chat if rating else None

    @staticmethod
    def get_average_score(db: Session):
        avg_score = db.query(func.avg(Rating.score)).scalar()
        return avg_score
