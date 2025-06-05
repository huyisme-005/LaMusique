# database.py
# -------------------------------------------------------------
# SQLAlchemy Database Configuration for FastAPI Backend
# Handles PostgreSQL connection and session management
# -------------------------------------------------------------

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Database URL, configurable via the DATABASE_URL environment variable
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost/songsdb')

# SQLAlchemy engine for PostgreSQL
engine = create_engine(DATABASE_URL)
# SQLAlchemy session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
