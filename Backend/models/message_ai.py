from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from extensions import db


class AIMessage(db.Model):
    __tablename__ = "ai_messages"

    id = Column(Integer, primary_key=True)

    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False)
    content = Column(Text, nullable=False)
    model = Column(String(50), nullable=True)

    created_at = Column(DateTime, server_default=db.func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=db.func.now(), onupdate=db.func.now())

    chat = relationship("Chat", back_populates="ai_messages")

    def to_dict(self):
        return {
            "id": self.id,
            "chat_id": self.chat_id,
            "content": self.content,
            "model": self.model,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def update_from_dict(self, data):
        allowed_fields = {"content", "model"}  # não permitirá trocar chat_id

        for key, value in data.items():
            if key in allowed_fields:
                setattr(self, key, value)

        db.session.commit()

    def __repr__(self):
        return f"<AIMessage id={self.id} chat={self.chat_id} model={self.model}>"
