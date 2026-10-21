from pydantic import BaseModel
from datetime import datetime


class SignalCreate(BaseModel):
    citizen_name: str
    address: str
    latitude: float
    longitude: float
    type_id: int
    description: str


class SignalResponse(BaseModel):
    id: int
    address: str
    latitude: float
    longitude: float
    type_id: int
    severity: str
    status: str

    class Config:
        from_attributes = True


class SignalListItem(BaseModel):
    id: int
    address: str
    severity: str
    status: str
    officer_name: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class AssignSignal(BaseModel):
    signal_id: int

class UpdateSignalStatus(BaseModel):
    status: str