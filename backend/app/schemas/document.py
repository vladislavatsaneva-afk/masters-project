from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: int
    signal_id: int
    officer_id: int
    type: str
    file_path: str
    original_file_name: str

    class Config:
        from_attributes = True