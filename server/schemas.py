from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class ConfigUpdate(BaseModel):
    id: int
    keywords: List[str]

class LogQuery(BaseModel):
    limit: int = 100
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class UserCreate(BaseModel):
    username: str
    password: str
    is_superuser: bool = False

class UserResponse(BaseModel):
    id: int
    username: str
    is_active: bool
    is_superuser: bool

    class Config:
        orm_mode = True

class AlarmConfigUpdate(BaseModel):
    no_recognition_threshold: int
    email_notification: bool
    email_address: Optional[str] = None
