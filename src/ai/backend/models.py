from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel

Base = declarative_base()

class Song(Base):
    __tablename__ = 'songs'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    lyrics = Column(Text, nullable=False)
    genre = Column(String(100), nullable=False)
    key = Column(String(20), nullable=False)
    tempo = Column(Integer, nullable=False)
    melody = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    lyric_feedback = Column(Text, nullable=True)

class SongCreate(BaseModel):
    title: str
    lyrics: str
    genre: str
    key: str
    tempo: int
    melody: str
    description: str | None = None
    lyric_feedback: str | None = None

class SongRead(SongCreate):
    id: int

    class Config:
        orm_mode = True
