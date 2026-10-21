from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime
from app.db.base import Base
from sqlalchemy.orm import relationship

class Signal(Base):
    __tablename__ = "Signals"

    Id = Column(Integer, primary_key=True, index=True)

    CitizenName = Column(String, nullable=False)

    Address = Column(String, nullable=False)
    Latitude = Column(Float, nullable=False)
    Longitude = Column(Float, nullable=False)

    Description = Column(String)

    Severity = Column(String, nullable=False)
    Status = Column(String, default="Submitted")

    SignalCount = Column(Integer, default=1)

    AssignedOfficerId = Column(Integer, ForeignKey("Officers.Id"))
    assigned_officer = relationship("Officer")

    TypeId = Column(Integer, ForeignKey("SignalTypes.Id"))
    signal_type = relationship("SignalType")

    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime)
    ResolvedAt = Column(DateTime)