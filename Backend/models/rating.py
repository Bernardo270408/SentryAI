from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from extensions import db


class Rating(db.Model):
    __tablename__ = 'ratings'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    chat_id = Column(Integer, ForeignKey('chats.id'), nullable=False)
    score = Column(Integer, nullable=False) # 1-5
    feedback = Column(String(255), nullable=True)

    user = relationship("User", back_populates="ratings")
    chat = relationship("Chat", back_populates="ratings")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "chat_id": self.chat_id,
            "score": self.score
        }
        
    def __repr__(self):
        return f"<Rating User {self.user_id} - Chat {self.chat_id} - Score {self.score}>"
    
    def update_from_dict(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
                
        db.session.commit()