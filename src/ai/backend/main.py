# main.py
# -------------------------------------------------------------
# FastAPI Application for Song Management
# Provides endpoints for creating, reading, and listing songs
# -------------------------------------------------------------

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import models
from database import engine, SessionLocal

# Create all database tables (if not already present)
models.Base.metadata.create_all(bind=engine)

# FastAPI app instance
app = FastAPI()

def get_db():
    """
    Dependency to get a SQLAlchemy session for each request.
    Yields a database session and ensures it is closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post('/songs/', response_model=models.SongRead)
def create_song(song: models.SongCreate, db: Session = Depends(get_db)):
    """
    Create a new song in the database.
    @param song: SongCreate Pydantic model with song data
    @param db: SQLAlchemy session (injected)
    @return: The created SongRead model
    """
    db_song = models.Song(**song.dict())
    db.add(db_song)
    db.commit()
    db.refresh(db_song)
    return db_song

@app.get('/songs/{song_id}', response_model=models.SongRead)
def read_song(song_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a song by its ID.
    @param song_id: The unique ID of the song
    @param db: SQLAlchemy session (injected)
    @return: The SongRead model if found, else 404 error
    """
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail='Song not found')
    return song

@app.get('/songs/', response_model=list[models.SongRead])
def list_songs(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """
    List all songs in the database (paginated).
    @param skip: Number of records to skip
    @param limit: Maximum number of records to return
    @param db: SQLAlchemy session (injected)
    @return: List of SongRead models
    """
    return db.query(models.Song).offset(skip).limit(limit).all()
