from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from config import db

class User(db.Model):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    
    extra_data = Column(Text)
    
    chats = relationship("Chat", back_populates="user", cascade="all, delete-orphan")


    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "extra_data": self.extra_data
        }
        
    def __repr__(self):
        return f"<User {self.name} - {self.email}>"
    
    def update_from_dict(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
                
        db.session.commit()
