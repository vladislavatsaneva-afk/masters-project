from sqlalchemy import (Column, Integer, String, Float, DateTime, Text, ForeignKey)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base


class SignalDraft(Base):
    __tablename__ = "SignalDrafts"

    Id = Column(Integer, primary_key=True, index=True)

    EmergencyCallId = Column(Integer, ForeignKey("EmergencyCalls.Id"), nullable=False)
    Summary = Column(Text, nullable=False)
    SuggestedTypeId = Column(Integer, ForeignKey("SignalTypes.Id"), nullable=True)
    SuggestedSeverity = Column(String, nullable=False)
    SuggestedCitizenName = Column(String, nullable=True)
    SuggestedAddress = Column(String, nullable=True)
    SuggestedLatitude = Column(Float, nullable=True)
    SuggestedLongitude = Column(Float, nullable=True)
    ConfidenceScore = Column(Float, nullable=True)
    ExtractedEntities = Column(Text, nullable=True)
    CreatedAt = Column(DateTime(timezone=True), server_default=func.now())
    ReviewStatus = Column(String, default="Pending")
    ReviewedByOfficerId = Column(Integer, nullable=True)
    ReviewedAt = Column(DateTime(timezone=True), nullable=True)
    RejectionReason = Column(Text, nullable=True)
    emergency_call = relationship(
        "EmergencyCall",
        back_populates="drafts"
    )
    signal_type = relationship("SignalType")
