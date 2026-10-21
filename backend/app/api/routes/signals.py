from fastapi import (APIRouter, Depends, HTTPException, UploadFile, File, Form)
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.models import SignalType
from app.models.signal import Signal
from app.models.document import Document
from app.schemas.signal import SignalCreate, AssignSignal, UpdateSignalStatus
from app.api.deps import (require_officer, require_admin)
from datetime import datetime, date
from typing import Optional
import os, shutil, uuid

router = APIRouter(prefix="/signals", tags=["signals"])

@router.post("/")
def create_signal(signal: SignalCreate, db: Session = Depends(get_db)):
    signal_type = db.query(SignalType).filter(SignalType.Id == signal.type_id).first()
    if not signal_type:
        raise HTTPException(status_code=400, detail="Invalid signal type")

    db_signal = Signal(
        CitizenName=signal.citizen_name,
        Address=signal.address,
        Latitude=signal.latitude,
        Longitude=signal.longitude,
        TypeId=signal.type_id,
        Description=signal.description,
        Severity=signal_type.DefaultSeverity,
        Status="Pending"
    )

    db.add(db_signal)
    db.commit()
    db.refresh(db_signal)

    return db_signal



@router.get("/types")
def get_signal_types(db: Session = Depends(get_db)):
    return db.query(SignalType).all()



@router.get("/statuses")
def get_statuses():
    return [
        "Pending",
        "Assigned",
        "InProgress",
        "Resolved",
        "Rejected"
    ]



@router.post("/status")
def update_status(
    data: UpdateSignalStatus,
    signal_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_officer),
):
    signal = db.query(Signal).filter(Signal.Id == signal_id).first()

    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")

    if signal.AssignedOfficerId != user.Id:
        raise HTTPException(status_code=403, detail="Not your signal")

    signal.Status = data.status

    if data.status == "Resolved":
        signal.ResolvedAt = datetime.utcnow()

    signal.UpdatedAt = datetime.utcnow()

    db.commit()
    db.refresh(signal)

    return {"message": "Status updated"}



@router.get("/list")
def get_signals_list(
    db: Session = Depends(get_db),
    user=Depends(require_officer)
):
    query = (
        db.query(Signal)
        .options(
            joinedload(Signal.assigned_officer)
        )
    )

    if user.Role == "Officer":
        query = query.filter(
            (Signal.AssignedOfficerId == user.Id) |
            (Signal.AssignedOfficerId == None)
        )

    signals = query.all()

    return [
        {
            "id": s.Id,
            "address": s.Address,
            "severity": s.Severity,
            "status": s.Status,
            "officer_id": s.AssignedOfficerId,
            "officer_name":
                s.assigned_officer.Username
                if s.assigned_officer
                else None,
            "created_at": s.CreatedAt
        }
        for s in signals
    ]



@router.post("/assign")
def assign_signal(
    data: AssignSignal,
    db: Session = Depends(get_db),
    user=Depends(require_officer)
):
    signal = db.query(Signal).filter(Signal.Id == data.signal_id).first()

    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")

    signal.AssignedOfficerId = user.Id
    signal.Status = "InProgress"
    signal.UpdatedAt = datetime.utcnow()

    db.commit()
    db.refresh(signal)

    return {"message": "Signal assigned", "signal": signal}



@router.post("/document")
def add_document(
    signal_id: int = Form(...),
    type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(require_officer)
):
    signal = db.query(Signal).filter(Signal.Id == signal_id).first()

    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")

    if signal.AssignedOfficerId != user.Id:
        raise HTTPException(status_code=403, detail="Not your signal")

    allowed_types = [
        "IncidentReport",
        "WitnessStatement",
        "PhotoEvidence",
        "VideoEvidence",
        "Citation",
        "ResolutionReport",
        "EvidenceAttachment"
    ]

    if type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid document type")

    upload_dir = f"app/uploads/documents/signal_{signal_id}"
    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename)[1]
    unique_name = f"{uuid.uuid4()}{ext}"

    file_path = os.path.join(upload_dir, unique_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    doc = Document(
        SignalId=signal_id,
        OfficerId=user.Id,
        Type=type,
        FilePath=file_path,
        OriginalFileName=file.filename
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {
        "message": "Document uploaded",
        "document_id": doc.Id
    }



@router.get("/{signal_id}/documents")
def get_signal_documents(
    signal_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_officer)
):
    docs = (
        db.query(Document)
        .filter(Document.SignalId == signal_id)
        .all()
    )

    return [
        {
            "id": d.Id,
            "type": d.Type,
            "file_name": d.OriginalFileName,
            "created_at": d.CreatedAt,
            "path": d.FilePath
        }
        for d in docs
    ]



@router.delete("/documents/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_officer)
):
    doc = (
        db.query(Document)
        .filter(Document.Id == document_id)
        .first()
    )

    if not doc:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    signal = (
        db.query(Signal)
        .filter(Signal.Id == doc.SignalId)
        .first()
    )

    if (
        user.Role != "Admin"
        and signal.AssignedOfficerId != user.Id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not your signal"
        )

    if doc.FilePath and os.path.exists(doc.FilePath):
        os.remove(doc.FilePath)

    db.delete(doc)
    db.commit()

    return {
        "message": "Document deleted"
    }



@router.get("/map")
def get_map_signals(
    status: Optional[str] = None,
    officer_id: Optional[int] = None,
    severity: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    user=Depends(require_officer)
):
    query = db.query(Signal)
    if user.Role == "Officer":
        query = query.filter(
            (Signal.AssignedOfficerId == user.Id) |
            (Signal.AssignedOfficerId == None)
        )

    if status:
        query = query.filter(Signal.Status == status)

    if officer_id is not None:
        query = query.filter(Signal.AssignedOfficerId == officer_id)

    if severity:
        query = query.filter(Signal.Severity == severity)

    if date_from:
        query = query.filter(Signal.CreatedAt >= datetime.combine(date_from, datetime.min.time()))

    if date_to:
        query = query.filter(Signal.CreatedAt <= datetime.combine(date_to, datetime.max.time()))

    signals = (
        query
        .options(joinedload(Signal.assigned_officer))
        .all()
    )

    grouped = {}

    for s in signals:
        key = s.Address

        if key not in grouped:
            grouped[key] = {
                "lat": s.Latitude,
                "lng": s.Longitude,
                "count": 0,
                "severity_levels": [],
                "signals": []
            }

        grouped[key]["count"] += 1
        grouped[key]["severity_levels"].append(s.Severity)
        grouped[key]["signals"].append({
            "id": s.Id,
            "severity": s.Severity,
            "status": s.Status
        })

    result = []

    for address, data in grouped.items():
        if "High" in data["severity_levels"]:
            severity_val = "High"
        elif "Medium" in data["severity_levels"]:
            severity_val = "Medium"
        else:
            severity_val = "Low"

        result.append({
            "address": address,
            "lat": data["lat"],
            "lng": data["lng"],
            "count": data["count"],
            "severity": severity_val,
            "signals": data["signals"]
        })

    return result



@router.get("/details")
def get_signal_details(
    ids: str,
    db: Session = Depends(get_db),
    user=Depends(require_officer)
):
    id_list = [int(i) for i in ids.split(",")]

    query = (
        db.query(Signal)
        .options(
            joinedload(Signal.assigned_officer),
            joinedload(Signal.signal_type)
        )
        .filter(Signal.Id.in_(id_list))
    )

    if user.Role == "Officer":
        query = query.filter(
            or_(
                Signal.AssignedOfficerId == None,
                Signal.AssignedOfficerId == user.Id
            )
        )

    signals = query.all()

    response = []

    for s in signals:
        response.append({
            "id": s.Id,
            "citizen_name": s.CitizenName,
            "address": s.Address,
            "latitude": s.Latitude,
            "longitude": s.Longitude,
            "description": s.Description,
            "severity": s.Severity,
            "type": (
                s.signal_type.LabelBG
                if s.signal_type and s.signal_type.LabelBG
                else "Неизвестен"
            ),
            "status": s.Status,
            "officer_id": s.AssignedOfficerId,
            "officer_name":
                s.assigned_officer.Username
                if s.assigned_officer
                else None,
            "created_at": s.CreatedAt,
            "updated_at": s.UpdatedAt,
            "resolved_at": s.ResolvedAt
        })

    return response



@router.get("/{signal_id}")
def get_signal(
    signal_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_officer)
):
    signal = (
        db.query(Signal)
        .options(
            joinedload(Signal.assigned_officer),
            joinedload(Signal.signal_type)
        )
        .filter(Signal.Id == signal_id)
        .first()
    )

    if not signal:
        raise HTTPException(
            status_code=404,
            detail="Signal not found"
        )

    if (
            user.Role == "Officer"
            and signal.AssignedOfficerId is not None
            and signal.AssignedOfficerId != user.Id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not your signal"
        )


    return {
        "id": signal.Id,
        "citizen_name": signal.CitizenName,
        "address": signal.Address,
        "latitude": signal.Latitude,
        "longitude": signal.Longitude,
        "description": signal.Description,
        "severity": signal.Severity,
        "status": signal.Status,
        "signal_count": signal.SignalCount,
        "created_at": signal.CreatedAt,
        "updated_at": signal.UpdatedAt,
        "resolved_at": signal.ResolvedAt,
        "officer_id": signal.AssignedOfficerId,
        "officer_name": (
            signal.assigned_officer.Username
            if signal.assigned_officer
            else None
        ),
        "type_id": signal.TypeId,
        "type_name": (
            signal.signal_type.LabelBG
            if signal.signal_type
            else None
        )
    }



@router.delete("/{signal_id}")
def delete_signal(
    signal_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_admin)
):
    signal = (
        db.query(Signal)
        .filter(Signal.Id == signal_id)
        .first()
    )

    if not signal:
        raise HTTPException(
            status_code=404,
            detail="Signal not found"
        )

    db.delete(signal)
    db.commit()

    return {
        "message": "Signal deleted"
    }

