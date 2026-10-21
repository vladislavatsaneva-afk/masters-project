from sqlalchemy import Column, Integer, String
from app.db.base import Base

class SignalType(Base):
    __tablename__ = "SignalTypes"

    Id = Column(Integer, primary_key=True, index=True)
    Name = Column(String)
    LabelBG = Column(String)
    DefaultSeverity = Column(String)