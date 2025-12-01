from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from extensions import db

class User(db.Model):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(String(255), nullable=True) # Pode ser nulo se vier do Google
    extra_data = Column(Text)
    is_admin = Column(Boolean, default=False)

    # Novos campos para Autenticação e Verificação
    google_id = Column(String(255), unique=True, nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String(6), nullable=True)
    verification_code_expires_at = Column(DateTime, nullable=True)

    chats = relationship("Chat", back_populates="user", cascade="all, delete-orphan")
    user_messages = relationship("UserMessage", back_populates="user", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="user", cascade="all, delete-orphan")
    contracts = relationship("Contract", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "extra_data": self.extra_data,
            "is_admin": self.is_admin,
            "is_verified": self.is_verified
        }
        
    def __repr__(self):
        return f"<User {self.name} - {self.email}>"
    
    def update_from_dict(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
                
        db.session.commit()