from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import SECRET_KEY, ALGORITHM
from app.models.officer import Officer

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security),
                     db: Session = Depends(get_db)):
    token = credentials.credentials

    print("\n=== AUTH DEBUG ===")
    print("RAW HEADER:", credentials)
    print("TOKEN:", credentials.credentials)

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        if "id" not in payload:
            raise HTTPException(401, "Invalid token")
        if "role" not in payload:
            raise HTTPException(401, "Invalid token")

        user_id = payload["id"]
        officer = (
            db.query(Officer)
            .filter(Officer.Id == user_id)
            .first()
        )
        if not officer:
            raise HTTPException(401)

        return officer

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

# -------------------------
# ROLE CHECKS
# -------------------------
def require_roles(allowed_roles: list):

    def checker(user: Officer = Depends(get_current_user)):

        if user.Role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions"
            )

        return user

    return checker


require_admin = require_roles(["Admin"])
require_officer = require_roles(["Admin", "Officer"])
require_dispatcher = require_roles(["Admin", "Dispatcher"])
