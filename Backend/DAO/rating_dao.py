from models.rating import Rating
from extensions import db


class RatingDAO:
    @staticmethod
    def create_rating(user_id, score, feedback=None):
        rating = Rating(user_id=user_id, score=score, feedback=feedback)
        db.session.add(rating)
        db.session.commit()
        return rating

    @staticmethod
    def get_rating_by_id(rating_id):
        return Rating.query.get(rating_id)

    @staticmethod
    def get_ratings_by_user(user_id):
        return Rating.query.filter_by(user_id=user_id).all()

    @staticmethod
    def get_all_ratings():
        return Rating.query.all()

    @staticmethod
    def update_rating(rating_id, data):
        rating = RatingDAO.get_rating_by_id(rating_id)
        if not rating:
            return None
        data.pop("id", None)
        rating.update_from_dict(data)
        return rating

    @staticmethod
    def delete_rating(rating_id):
        rating = RatingDAO.get_rating_by_id(rating_id)
        if not rating:
            return False
        db.session.delete(rating)
        db.session.commit()
        return True

    @staticmethod
    def get_ratings_by_score(score):
        return Rating.query.filter_by(score=score).all()

    @staticmethod
    def get_ratings_with_feedback():
        return Rating.query.filter(Rating.feedback.isnot(None)).all()

    @staticmethod
    def get_chat_by_rating(rating_id):
        rating = RatingDAO.get_rating_by_id(rating_id)
        if rating:
            return rating.chat
        return None

    @staticmethod
    def get_average_score():
        from sqlalchemy import func

        avg_score = db.session.query(func.avg(Rating.score)).scalar()
        return avg_score
