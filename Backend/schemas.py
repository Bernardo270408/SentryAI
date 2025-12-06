from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional

# SCHEMAS DE USUÁRIO
class UserCreateSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    extra_data: Optional[str] = None

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

# SCHEMAS DE MENSAGEM
class MessageCreateSchema(BaseModel):
    chat_id: int
    content: str = Field(..., min_length=1)
    user_id: int

# SCHEMAS DE CHAT
class ChatCreateSchema(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    user_id: int

# SCHEMAS DE CONTRATO
class ContractAnalyzeSchema(BaseModel):
    user_id: int
    text: Optional[str] = None
    
    @validator('text')
    def check_content(cls, v, values):
        # Validação customizada se necessário
        return v