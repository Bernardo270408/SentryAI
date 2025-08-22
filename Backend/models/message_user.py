from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from extensions import db

class UserMessage(db.Model):
    __tablename__ = 'user_messages'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=db.func.now())
    updated_at = Column(DateTime, onupdate=db.func.now())

    user = relationship("User", back_populates="user_messages")
    chat = relationship("Chat", back_populates="user_messages")

    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "chat_id": self.chat_id,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f"<Message {self.id} - User ID: {self.user_id} - Chat ID: {self.chat_id}>"
    
    def update_from_dict(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
                
        db.session.commit()


