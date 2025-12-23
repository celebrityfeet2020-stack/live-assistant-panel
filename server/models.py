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
    is_superuser = Column(Boolean, default=False)

    configs = relationship("Config", back_populates="owner")
    alarm_config = relationship("AlarmConfig", uselist=False, back_populates="owner")
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

class AlarmConfig(Base):
    __tablename__ = "alarm_configs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    no_recognition_threshold = Column(Integer, default=300) # 连续多少秒无识别结果报警
    email_notification = Column(Boolean, default=False)
    email_address = Column(String, nullable=True)

    owner = relationship("User", back_populates="alarm_config")
