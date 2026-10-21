from datetime import datetime, date
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.signal import Signal
from app.models.signal_draft import SignalDraft
from app.models.emergency_call import EmergencyCall

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)



@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["Admin", "Officer", "Dispatcher"]))
):
    open_signals = (
        db.query(Signal)
        .filter(
            Signal.Status != "Resolved"
        )
        .count()
    )

    high_severity = (
        db.query(Signal)
        .filter(
            Signal.Severity == "High"
        )
        .count()
    )

    pending_drafts = (
        db.query(SignalDraft)
        .filter(
            SignalDraft.ReviewStatus ==
            "Pending"
        )
        .count()
    )

    today = date.today()

    calls_today = (
        db.query(EmergencyCall)
        .filter(
            EmergencyCall.ReceivedAt >= today
        )
        .count()
    )

    return {
        "open_signals": open_signals,
        "high_severity": high_severity,
        "pending_drafts": pending_drafts,
        "calls_today": calls_today
    }