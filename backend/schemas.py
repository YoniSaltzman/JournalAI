from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str 
    
class JournalEntryBase(BaseModel):
    entry: str

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntryOut(JournalEntryBase):
    id: int
    entry: str
    summary: str
    date_created: datetime

    class Config:
        from_attributes = True

class UserSettingsSchema(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    style: Optional[str] = None
    memories: Optional[bool] = None
    about_me: Optional[str] = None