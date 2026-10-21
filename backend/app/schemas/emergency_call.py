from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class EmergencyCallBase(BaseModel):
    CallerInfo: Optional[str] = None
    Status: Optional[str] = "Pending"


class EmergencyCallCreate(EmergencyCallBase):
    AudioFilePath: str


class EmergencyCallResponse(EmergencyCallBase):
    Id: int

    RawTranscript: Optional[str] = None

    AudioFilePath: str

    DispatcherId: Optional[int] = None

    ProcessingStatus: Optional[str] = "Pending"

    DurationSeconds: Optional[int] = None

    ReceivedAt: datetime

    class Config:
        from_attributes = True