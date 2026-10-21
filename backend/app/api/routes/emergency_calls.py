import os
import shutil
from uuid import uuid4
from fastapi import (APIRouter, Depends, UploadFile, File, Form, HTTPException)
from sqlalchemy.orm import Session

from app.api.deps import (require_dispatcher,  require_admin)
from app.db.session import get_db
from app.services.emergency_call_service import (emergency_call_service)
from app.models.emergency_call import EmergencyCall


router = APIRouter(
    prefix="/emergency-calls",
    tags=["Emergency Calls"]
)


UPLOAD_FOLDER = "uploads/calls"


ALLOWED_EXTENSIONS = [".mp3", ".wav", ".m4a"]


def validate_audio_file(filename: str):

    extension = os.path.splitext(filename)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported audio format."
        )


@router.post("/upload")
async def upload_emergency_call(
    audio: UploadFile = File(...),
    caller_info: str = Form(None),
    dispatcher_id: int = Form(None),
    db: Session = Depends(get_db),
    user=Depends(require_dispatcher)
):

    validate_audio_file(audio.filename)

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    unique_filename = (
        f"{uuid4()}_{audio.filename}"
    )

    saved_path = os.path.join(
        UPLOAD_FOLDER,
        unique_filename
    )

    try:

        with open(saved_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        result = (
            emergency_call_service.process_emergency_call(
                db=db,
                audio_file_path=saved_path,
                caller_info=caller_info,
                dispatcher_id=dispatcher_id
            )
        )

        return {
            "message": "Emergency call processed successfully.",

            "emergency_call_id":
                result["emergency_call"].Id,

            "draft_id":
                result["draft"].Id,

            "processing_status":
                result["emergency_call"].ProcessingStatus
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/")
def get_emergency_calls(
    db: Session = Depends(get_db),
    user=Depends(require_dispatcher)
):

    calls = db.query(EmergencyCall).all()

    return calls



@router.get("/list")
def get_emergency_calls_list(
    db: Session = Depends(get_db),
    user=Depends(require_dispatcher)
):

    calls = db.query(EmergencyCall).all()

    return [
        {
            "id": c.Id,
            "caller_info": c.CallerInfo,
            "received_at": c.ReceivedAt,
            "duration_seconds": c.DurationSeconds,
            "status": c.Status,
            "processing_status": c.ProcessingStatus
        }
        for c in calls
    ]



@router.get("/{call_id}")
def get_emergency_call(
    call_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_dispatcher)
):

    call = (
        db.query(EmergencyCall)
        .filter(EmergencyCall.Id == call_id)
        .first()
    )

    if not call:
        raise HTTPException(
            status_code=404,
            detail="Emergency call not found."
        )

    return {
        "id": call.Id,
        "caller_info": call.CallerInfo,
        "dispatcher_id": call.DispatcherId,
        "status": call.Status,
        "processing_status": call.ProcessingStatus,
        "received_at": call.ReceivedAt,
        "duration_seconds": call.DurationSeconds,
        "transcript": call.RawTranscript,
        "audio_file_path": call.AudioFilePath
    }



@router.delete("/{call_id}")
def delete_emergency_call(
    call_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_admin)
):
    call = (
        db.query(EmergencyCall)
        .filter(EmergencyCall.Id == call_id)
        .first()
    )

    if not call:
        raise HTTPException(
            status_code=404,
            detail="Emergency call not found"
        )

    if (
        call.AudioFilePath
        and os.path.exists(call.AudioFilePath)
    ):
        os.remove(call.AudioFilePath)

    db.delete(call)
    db.commit()

    return {
        "message": "Emergency call deleted"
    }