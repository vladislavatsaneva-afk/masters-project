from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.base import Base

class Officer(Base):
    __tablename__ = "Officers"

    Id = Column(Integer, primary_key=True, index=True)
    Username = Column(String, unique=True, nullable=False)
    PasswordHash = Column(String, nullable=False)
    Role = Column(String, nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)