from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from extensions import db

class Chat(db.Model):
    __tablename__ = 'chats'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating_id = Column(Integer, ForeignKey("ratings.id"), unique=True, nullable=True)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, server_default=db.func.now())


    user = relationship("User", back_populates="chats")
    user_messages = relationship("UserMessage", back_populates="chat", cascade="all, delete-orphan")
    ai_messages = relationship("AIMessage", back_populates="chat", cascade="all, delete-orphan")
    rating = relationship("Rating", back_populates="chat", uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "created_at": self.created_at.isoformat() if self.created_at else None
            }
        
    def __repr__(self):
        return f"<Chat {self.name} - User ID: {self.user_id}>"
    
    def update_from_dict(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
                
        db.session.commit()