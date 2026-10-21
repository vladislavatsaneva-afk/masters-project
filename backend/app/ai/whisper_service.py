import whisper
import os


MODEL_NAME = "small"


class WhisperService:
    def __init__(self):
        self.model = whisper.load_model(MODEL_NAME)

    def transcribe_audio(self, audio_path: str) -> dict:
        """
        Transcribes an audio file using Whisper.

        Returns:
        {
            "transcript": str,
            "language": str
        }
        """

        if not os.path.exists(audio_path):
            raise FileNotFoundError(
                f"Audio file not found: {audio_path}"
            )

        result = self.model.transcribe(
            audio_path,
            language="bg"
        )

        return {
            "transcript": result.get("text", "").strip(),
            "language": result.get("language", "unknown")
        }


whisper_service = WhisperService()