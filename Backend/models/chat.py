from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from config import db

class Chat(db.Model):

    __tablename__ = 'chats'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, server_default=db.func.now())
    
    user = relationship("User", back_populates="chats")

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


