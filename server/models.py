from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    configs = relationship("Config", back_populates="owner")
    logs = relationship("Log", back_populates="owner")
    audits = relationship("Audit", back_populates="owner")

class Config(Base):
    __tablename__ = "configs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    link_id = Column(Integer)
    keywords = Column(Text) # JSON string: ["keyword1", "keyword2"]

    owner = relationship("User", back_populates="configs")

class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.now)
    type = Column(String) # info, success, warning, error
    message = Column(String)
    details = Column(Text, nullable=True)

    owner = relationship("User", back_populates="logs")

class Audit(Base):
    __tablename__ = "audits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.now)
    action = Column(String) # login, update_config, etc.
    details = Column(String)
    ip_address = Column(String)

    owner = relationship("User", back_populates="audits")
