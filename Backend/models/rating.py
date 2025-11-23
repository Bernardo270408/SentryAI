from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from extensions import db


class Rating(db.Model):
    __tablename__ = 'ratings'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    chat_id = Column(Integer, ForeignKey('chats.id'), unique=True, nullable=False)
    score = Column(Integer, nullable=False)
    feedback = Column(String(255))

    user = relationship("User", back_populates="ratings")
    chat = relationship("Chat", back_populates="rating")


    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "chat_id": self.chat.id if self.chat else None,
            "score": self.score,
            "feedback": self.feedback  # Adicionado feedback
        }
        
    def __repr__(self):
        return f"<Rating User {self.user_id} - Chat {self.chat_id} - Score {self.score}>"
    
    def update_from_dict(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
                
        db.session.commit()