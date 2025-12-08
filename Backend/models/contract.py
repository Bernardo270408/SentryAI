import datetime
from sqlalchemy import Column, Integer, ForeignKey, JSON, DateTime, Text
from sqlalchemy.orm import relationship
from extensions import Base


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    text = Column(Text, nullable=False)  # entrada
    json = Column(JSON, nullable=False)  # saida

    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="contracts")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "json": self.json,
            "text": self.text,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<Contract {self.id} - User {self.user_id} - Created at {self.created_at} - Updated at {self.updated_at}>"
