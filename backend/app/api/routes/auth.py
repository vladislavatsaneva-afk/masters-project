from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.officer import Officer
from app.schemas.officer import LoginRequest, TokenResponse
from app.core.security import verify_password, create_access_token
from app.api.deps import require_admin

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Officer).filter(Officer.Username == data.username).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(data.password, user.PasswordHash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": str(user.Id),
        "role": user.Role,
        "id": user.Id
    })

    return {
        "access_token": token,
        "role": user.Role,
        "user_id": user.Id,
        "username": user.Username
    }

@router.get("/admin-test")
def admin_test(user=Depends(require_admin)):
    return {"message": "Admin access granted"}