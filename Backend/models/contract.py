import datetime
from sqlalchemy import Column, Integer, ForeignKey, JSON, DateTime, Text
from sqlalchemy.orm import relationship
from extensions import db


class Contract(db.Model):
    __tablename__ = 'contracts'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    text = Column(Text, nullable=False) # entrada
    json = Column(JSON, nullable=False) # saida

    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="contracts")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "json": self.json,
            "text": self.text,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
        
    def __repr__(self):
        return f"<Contract {self.id} - User {self.user_id} - Created at {self.created_at} - Updated at {self.updated_at}>"
    
    def update_from_dict(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        db.session.commit()