from sqlalchemy import Column, Integer, String, DateTime, Boolean, func, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)    
    entries = relationship("JournalEntry", back_populates="user")
class JournalEntry(Base):
    __tablename__ = 'journal_entries'

    id = Column(Integer, primary_key=True, index=True)
    entry = Column(String)
    summary = Column(String)
    date_created = Column(DateTime(timezone=True), server_default=func.now()) # research this later (how to define this column as a datetime object)
    saved = Column(Boolean, default=True)

    user_id = Column(Integer, ForeignKey('users.id'))
    user = relationship('User', back_populates='entries')

class UserSettings(Base):
    __tablename__  = 'settings'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default='')
    age = Column(Integer, default=0)
    style = Column(String, default='regular')
    memories = Column(Boolean, default=False)
    about_me = Column(String(100), default='')

    user_id = Column(Integer, ForeignKey('users.id'))

