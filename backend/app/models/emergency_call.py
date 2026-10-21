from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base


class EmergencyCall(Base):
    __tablename__ = "EmergencyCalls"

    Id = Column(Integer, primary_key=True, index=True)

    RawTranscript = Column(Text, nullable=True)

    AudioFilePath = Column(String, nullable=False)

    CallerInfo = Column(String, nullable=True)

    DispatcherId = Column(Integer, nullable=True)

    Status = Column(String, default="Pending")

    ReceivedAt = Column(DateTime(timezone=True), server_default=func.now())

    DurationSeconds = Column(Integer, nullable=True)

    ProcessingStatus = Column(String, default="Pending")

    drafts = relationship(
        "SignalDraft",
        back_populates="emergency_call",
        cascade="all, delete-orphan"
    )