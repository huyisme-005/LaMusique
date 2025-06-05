from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models
from .database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post('/songs/', response_model=models.SongRead)
def create_song(song: models.SongCreate, db: Session = Depends(get_db)):
    db_song = models.Song(**song.dict())
    db.add(db_song)
    db.commit()
    db.refresh(db_song)
    return db_song

@app.get('/songs/{song_id}', response_model=models.SongRead)
def read_song(song_id: int, db: Session = Depends(get_db)):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail='Song not found')
    return song

@app.get('/songs/', response_model=list[models.SongRead])
def list_songs(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(models.Song).offset(skip).limit(limit).all()
