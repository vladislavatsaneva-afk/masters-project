from datetime import datetime
from fastapi import (APIRouter, Depends, HTTPException)
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.signal_draft import SignalDraft
from app.models.signal import Signal
from app.schemas.signal_draft import (SignalDraftReview, DraftRejectRequest)
from app.api.deps import (require_dispatcher, require_admin)
from app.models.emergency_call import EmergencyCall


router = APIRouter(
    prefix="/drafts",
    tags=["Signal Drafts"]
)


@router.get("/")
def get_all_drafts(
    db: Session = Depends(get_db),
    user=Depends(require_dispatcher)
):
    drafts = db.query(SignalDraft).all()

    return drafts


@router.get("/pending")
def get_pending_drafts(
    db: Session = Depends(get_db),
    user=Depends(require_dispatcher)
):

    drafts = (
        db.query(SignalDraft)
        .filter(SignalDraft.ReviewStatus == "Pending")
        .all()
    )

    return drafts



@router.get("/list")
def get_drafts_list(
    db: Session = Depends(get_db),
    user=Depends(require_dispatcher)
):
    drafts = db.query(SignalDraft).all()

    return [
        {
            "id": d.Id,
            "address": d.SuggestedAddress,
            "severity": d.SuggestedSeverity,
            "confidence": d.ConfidenceScore,
            "status": d.ReviewStatus,
            "created_at": d.CreatedAt
        }
        for d in drafts
    ]



@router.get("/{draft_id}")
def get_draft(
    draft_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_dispatcher)
):
    draft = (
        db.query(SignalDraft)
        .filter(SignalDraft.Id == draft_id)
        .first()
    )

    if not draft:
        raise HTTPException(404, "Draft not found")

    return {
        "id": draft.Id,
        "emergency_call_id": draft.EmergencyCallId,
        "summary": draft.Summary,

        "suggested": {
            "type_id": draft.SuggestedTypeId,
            "type_name": (
                draft.signal_type.LabelBG
                if draft.signal_type
                else None
            ),
            "severity": draft.SuggestedSeverity,
            "citizen_name": draft.SuggestedCitizenName,
            "address": draft.SuggestedAddress,
            "latitude": draft.SuggestedLatitude,
            "longitude": draft.SuggestedLongitude
        },

        "confidence": draft.ConfidenceScore,
        "entities": draft.ExtractedEntities,

        "status": draft.ReviewStatus,
        "rejection_reason": draft.RejectionReason,

        "created_at": draft.CreatedAt,
        "reviewed_at": draft.ReviewedAt
    }



@router.post("/{draft_id}/approve")
def approve_draft(
    draft_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_dispatcher)
):
    draft = (
        db.query(SignalDraft)
        .filter(SignalDraft.Id == draft_id)
        .first()
    )

    if not draft:
        raise HTTPException(
            status_code=404,
            detail="Draft not found."
        )
    if draft.ReviewStatus != "Pending":
        raise HTTPException(
            status_code=400,
            detail="Draft already reviewed."
        )

    required_fields = {
        "citizen_name": draft.SuggestedCitizenName,
        "address": draft.SuggestedAddress,
        "latitude": draft.SuggestedLatitude,
        "longitude": draft.SuggestedLongitude,
        "type_id": draft.SuggestedTypeId
    }

    missing = [
        field
        for field, value in required_fields.items()
        if value is None or value == ""
    ]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required fields: {', '.join(missing)}"
        )


    signal = Signal(
        CitizenName=draft.SuggestedCitizenName,
        Address=draft.SuggestedAddress,
        Latitude=draft.SuggestedLatitude,
        Longitude=draft.SuggestedLongitude,
        Description=draft.Summary,
        Severity=draft.SuggestedSeverity,
        Status="Pending",
        SignalCount=1,
        AssignedOfficerId=None,
        TypeId=draft.SuggestedTypeId
    )

    db.add(signal)

    draft.ReviewStatus = "Approved"
    draft.ReviewedByOfficerId = user.Id
    draft.ReviewedAt = datetime.utcnow()

    call = (
        db.query(EmergencyCall)
        .filter( EmergencyCall.Id == draft.EmergencyCallId )
        .first()
    )

    if call:
        call.Status = "Completed"
        call.ProcessingStatus = "Approved"

    db.commit()
    db.refresh(signal)

    return {
        "message": "Draft approved successfully.",
        "signal_id": signal.Id
    }



@router.post("/{draft_id}/reject")
def reject_draft(
    draft_id: int,
    review: DraftRejectRequest,
    db: Session = Depends(get_db),
    user=Depends(require_dispatcher)
):

    draft = (
        db.query(SignalDraft)
        .filter(SignalDraft.Id == draft_id)
        .first()
    )

    if not draft:
        raise HTTPException(
            status_code=404,
            detail="Draft not found."
        )

    if draft.ReviewStatus != "Pending":
        raise HTTPException(
            status_code=400,
            detail="Draft already reviewed."
        )

    draft.ReviewStatus = "Rejected"
    draft.ReviewedByOfficerId = user.Id
    draft.ReviewedAt = datetime.utcnow()
    draft.RejectionReason = (review.rejection_reason)

    call = (
        db.query(EmergencyCall)
        .filter( EmergencyCall.Id == draft.EmergencyCallId )
        .first()
    )

    if call:
        call.Status = "Completed"
        call.ProcessingStatus = "Rejected"

    db.commit()

    return {
        "message": "Draft rejected successfully."
    }



@router.delete("/{draft_id}")
def delete_draft(
    draft_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_admin)
):
    draft = (
        db.query(SignalDraft)
        .filter(SignalDraft.Id == draft_id)
        .first()
    )

    if not draft:
        raise HTTPException(
            status_code=404,
            detail="Draft not found"
        )

    db.delete(draft)
    db.commit()

    return {
        "message": "Draft deleted"
    }
