from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from extensions import db

class UserMessage(db.Model):
    __tablename__ = 'user_messages'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False)
    content = Column(Text, nullable=False)

    created_at = Column(DateTime, server_default=db.func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=db.func.now(), onupdate=db.func.now())

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

    def update_from_dict(self, data):
        # Apenas campos permitidos podem ser atualizados
        allowed_fields = {"content"}

        for key, value in data.items():
            if key in allowed_fields:
                setattr(self, key, value)

        db.session.commit()

    def __repr__(self):
        return f"<UserMessage id={self.id} user={self.user_id} chat={self.chat_id}>"