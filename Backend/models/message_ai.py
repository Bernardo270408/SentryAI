from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from extensions import db

class AIMessage(db.Model):
    __tablename__ = 'ai_messages'

    id = Column(Integer, primary_key=True)
    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False)
    content = Column(Text, nullable=False)
    model = Column(String(50), nullable=True)
    
    rating = Column(Integer, nullable=True, default=0) #-1, 0, 1
    feedback = Column(Text, nullable=True) 
    
    created_at = Column(DateTime, server_default=db.func.now())
    updated_at = Column(DateTime, onupdate=db.func.now())

    chat = relationship("Chat", back_populates="ai_messages")

    def to_dict(self):
        return {
            "id": self.id,
            "chat_id": self.chat_id,
            "content": self.content,
            'model': self.model,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    def __repr__(self):
        return f"<Message {self.id} - Chat ID: {self.chat_id} - Model: {self.model}>"

    def update_from_dict(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
                
        db.session.commit()


