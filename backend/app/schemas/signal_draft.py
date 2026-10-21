from pydantic import BaseModel
from datetime import datetime
from typing import Optional


VALID_SEVERITIES = ["Low", "Medium", "High"]


class SignalDraftBase(BaseModel):
    Summary: str
    SuggestedTypeId: Optional[int] = None
    SuggestedSeverity: str
    SuggestedAddress: Optional[str] = None
    SuggestedLatitude: Optional[float] = None
    SuggestedLongitude: Optional[float] = None
    ConfidenceScore: Optional[float] = None
    ExtractedEntities: Optional[str] = None


class SignalDraftCreate(SignalDraftBase):
    EmergencyCallId: int


class SignalDraftReview(BaseModel):
    approved: bool
    rejection_reason: Optional[str] = None


class SignalDraftResponse(SignalDraftBase):
    Id: int
    EmergencyCallId: int
    ReviewStatus: str
    ReviewedByOfficerId: Optional[int] = None
    ReviewedAt: Optional[datetime] = None
    RejectionReason: Optional[str] = None
    CreatedAt: datetime

    class Config:
        from_attributes = True


class DraftApproveRequest(BaseModel):
    suggested_type_id: int
    suggested_address: str
    suggested_citizen_name: str
    suggested_severity: str


class DraftRejectRequest(BaseModel):
    rejection_reason: str