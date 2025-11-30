from sqlalchemy import Column, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from extensions import db


class Contract(db.Model):
    __tablename__ = 'contracts'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    json = Column(JSON, nullable=False)

    user = relationship("User", back_populates="contracts")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "json": self.json
        }
        
    def __repr__(self):
        return f"<Contract {self.id} - User {self.user_id}>"
    
    def update_from_dict(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
                
        db.session.commit()