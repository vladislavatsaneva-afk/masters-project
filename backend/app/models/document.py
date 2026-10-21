from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from app.db.base import Base

class Document(Base):
    __tablename__ = "Documents"

    Id = Column(Integer, primary_key=True, index=True)

    SignalId = Column(Integer, ForeignKey("Signals.Id"), nullable=False)
    OfficerId = Column(Integer, ForeignKey("Officers.Id"), nullable=False)

    Type = Column(String, nullable=False)

    FilePath = Column(String, nullable=False)
    OriginalFileName = Column(String, nullable=False)

    CreatedAt = Column(DateTime, default=datetime.utcnow)