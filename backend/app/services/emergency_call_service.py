import json
from sqlalchemy.orm import Session
from app.models.emergency_call import EmergencyCall
from app.models.signal_draft import SignalDraft
from app.ai.whisper_service import whisper_service
from app.ai.draft_generator import draft_generator


class EmergencyCallService:

    def process_emergency_call(
        self,
        db: Session,
        audio_file_path: str,
        caller_info: str = None,
        dispatcher_id: int = None
    ):


        emergency_call = EmergencyCall(
            AudioFilePath=audio_file_path,
            CallerInfo=caller_info,
            DispatcherId=dispatcher_id,
            Status="Pending",
            ProcessingStatus="Transcribing"
        )

        db.add(emergency_call)
        db.commit()
        db.refresh(emergency_call)

        try:


            transcription_result = (
                whisper_service.transcribe_audio(
                    audio_file_path
                )
            )

            transcript = transcription_result["transcript"]
            emergency_call.RawTranscript = transcript
            emergency_call.ProcessingStatus = "Transcribed"

            db.commit()


            generated_draft = draft_generator.generate_signal_draft(transcript)
            citizen_name = generated_draft.get("extracted_entities", {}).get("citizen_name")


            draft = SignalDraft(
                EmergencyCallId=emergency_call.Id,
                Summary=generated_draft["summary"],
                SuggestedCitizenName=citizen_name,
                SuggestedTypeId=generated_draft[
                    "suggested_type_id"
                ],
                SuggestedSeverity=generated_draft[
                    "suggested_severity"
                ],
                SuggestedAddress=generated_draft[
                    "suggested_address"
                ],
                SuggestedLatitude=generated_draft[
                    "suggested_latitude"
                ],
                SuggestedLongitude=generated_draft[
                    "suggested_longitude"
                ],
                ConfidenceScore=generated_draft[
                    "confidence_score"
                ],
                ExtractedEntities=json.dumps(
                    generated_draft["extracted_entities"],
                    ensure_ascii=False
                ),
                ReviewStatus="Pending"
            )

            db.add(draft)
            emergency_call.ProcessingStatus = "Pending"
            db.commit()

            db.refresh(draft)

            return {
                "emergency_call": emergency_call,
                "draft": draft
            }

        except Exception as e:
            emergency_call.ProcessingStatus = "Failed"
            db.commit()
            raise e


emergency_call_service = EmergencyCallService()