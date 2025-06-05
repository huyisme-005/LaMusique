# models.py
# -------------------------------------------------------------
# Pydantic and SQLAlchemy Models for Song Data
# Defines ORM and validation schemas for FastAPI backend
# -------------------------------------------------------------

from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel

# SQLAlchemy base class for ORM models
Base = declarative_base()

class Song(Base):
    """
    SQLAlchemy ORM model for the 'songs' table.
    Represents a saved song with metadata and melody/feedback.
    """
    __tablename__ = 'songs'
    id = Column(Integer, primary_key=True, index=True)  # Unique song ID
    title = Column(String(255), nullable=False)         # Song title
    lyrics = Column(Text, nullable=False)               # Song lyrics
    genre = Column(String(100), nullable=False)         # Song genre
    key = Column(String(20), nullable=False)            # Musical key
    tempo = Column(Integer, nullable=False)             # Tempo in BPM
    melody = Column(Text, nullable=False)               # Melody data (e.g., MusicXML)
    description = Column(Text, nullable=True)           # Melody description
    lyric_feedback = Column(Text, nullable=True)        # Feedback on lyrics

class SongCreate(BaseModel):
    """
    Pydantic model for song creation (request body validation).
    """
    title: str
    lyrics: str
    genre: str
    key: str
    tempo: int
    melody: str
    description: str | None = None
    lyric_feedback: str | None = None

class SongRead(SongCreate):
    """
    Pydantic model for reading a song (response model).
    Extends SongCreate with a unique song ID.
    """
    id: int

    class Config:
        orm_mode = True  # Enable ORM mode for SQLAlchemy integration
