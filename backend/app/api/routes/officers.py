from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import ( require_admin, require_officer )
from app.db.session import get_db
from app.models.officer import Officer
from app.core.security import hash_password
from app.models.signal import Signal
from app.schemas.officer import OfficerCreate

router = APIRouter(prefix="/officers", tags=["officers"])

@router.get("/")
def get_officers(
    db: Session = Depends(get_db),
    user=Depends(require_admin)

):

    officers = db.query(Officer).all()

    return [
        {
            "id": o.Id,
            "username": o.Username,
            "role": o.Role,
            "created_at": o.CreatedAt
        }
        for o in officers
    ]



@router.get("/lookup")
def get_officers_lookup(
    db: Session = Depends(get_db),
    user=Depends(require_officer)
):
    officers = db.query(Officer).all()

    return [
        {
            "id": o.Id,
            "username": o.Username
        }
        for o in officers
    ]



@router.post("/")
def create_officer(
    data: OfficerCreate,
    db: Session = Depends(get_db),
    user=Depends(require_admin)
):
    officer = Officer(
        Username=data.username,
        PasswordHash=hash_password(
            data.password
        ),
        Role=data.role
    )

    db.add(officer)
    db.commit()
    db.refresh(officer)

    return {
        "id": officer.Id,
        "username": officer.Username,
        "role": officer.Role
    }



@router.delete("/{officer_id}")
def delete_officer(
    officer_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_admin)
):
    officer = (
        db.query(Officer)
        .filter(Officer.Id == officer_id)
        .first()
    )

    if not officer:
        raise HTTPException(
            status_code=404,
            detail="Officer not found"
        )

    if officer.Id == user.Id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account"
        )

    signals = (
        db.query(Signal)
        .filter(
            Signal.AssignedOfficerId == officer_id
        )
        .all()
    )

    for s in signals:
        s.AssignedOfficerId = None
        s.Status = "Pending"

    db.delete(officer)
    db.commit()

    return {
        "message": "Officer deleted"
    }