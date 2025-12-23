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
