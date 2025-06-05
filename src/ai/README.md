# AI Folder (`src/ai`)

## Purpose
This folder contains all AI, backend, and orchestration logic for the La Musique project. It includes:
- AI flows for music and lyric generation (TypeScript)
- A Python backend for secure song storage using PostgreSQL
- API clients for communication between the frontend and backend

## Tech Stack
- **TypeScript** (Next.js flows, orchestration)
- **Python** (FastAPI backend)
- **Pydantic** (data validation)
- **SQLAlchemy** (Object-Relational Mapping)
- **PostgreSQL** (database)
- **Axios** (API client)

## Structure
- `flows/` — AI flows for melody, lyrics, emotion analysis, etc.
- `backend/` — Python FastAPI backend, models, and database config
- `dev.ts`, `genkit.ts` — Orchestration and development entry points

## How to Run All Components Together

### 1. Start the Python Backend
```sh
cd src/ai/backend
# (Optional) Create and activate a virtual environment
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
# Install dependencies
pip install -r requirements.txt
# Set up PostgreSQL and ensure DATABASE_URL is set in your environment
# Example: export DATABASE_URL=postgresql://postgres:password@localhost/songsdb
# Run the backend
uvicorn main:app --reload
```

### 2. Start the Next.js App (AI flows)
```sh
cd ../../../  # Project root
npm install
npm run dev
```

### 3. Environment Variables
- Set `BACKEND_API_URL` in your `.env` file (in the project root) to point to your FastAPI backend (e.g., `http://localhost:8000`).
- Set `DATABASE_URL` for the backend as needed.

### 4. Access
- The backend API will be available at `http://localhost:8000`.
- The Next.js app will be available at `http://localhost:3000` (by default).

## Notes
- Ensure PostgreSQL is running and accessible.
- The backend will automatically create the `songs` table if it does not exist.
- All AI flows will save and retrieve songs via the backend, not localStorage.
