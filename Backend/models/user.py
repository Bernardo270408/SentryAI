from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(String(255), nullable=True)
    extra_data = Column(Text)
    is_admin = Column(Boolean, default=False)

    google_id = Column(String(255), unique=True, nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String(6), nullable=True)
    verification_code_expires_at = Column(DateTime, nullable=True)

    # --- CAMPOS DE SEGURANÇA E BANIMENTO ---
    is_banned = Column(Boolean, default=False)
    ban_reason = Column(String(255), nullable=True)
    ban_expires_at = Column(DateTime, nullable=True) # Null = Ban permanente
    
    # Quem baniu este usuário? (Para evitar abuso de poder)
    banned_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Dados do recurso (JSON) -> { message: "...", date: "...", status: "pending" }
    appeal_data = Column(JSON, nullable=True)

    # Cache do perfil de risco
    risk_profile_score = Column(Integer, default=0)
    risk_profile_summary = Column(Text, nullable=True)
    last_risk_analysis = Column(DateTime, nullable=True)

    # Relacionamentos
    chats = relationship("Chat", back_populates="user", cascade="all, delete-orphan")
    user_messages = relationship("UserMessage", back_populates="user", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="user", cascade="all, delete-orphan")
    contracts = relationship("Contract", back_populates="user", cascade="all, delete-orphan")
    
    # Auto-relacionamento para saber quem baniu
    banner = relationship("User", remote_side=[id])

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "extra_data": self.extra_data,
            "is_admin": self.is_admin,
            "is_verified": self.is_verified,
            "is_banned": self.is_banned,
            "appeal_data": self.appeal_data,
            "risk_profile": {
                "score": self.risk_profile_score,
                "summary": self.risk_profile_summary
            }
        }

    def update_from_dict(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        db.session.commit()