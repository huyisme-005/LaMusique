# App Folder (`src/app`)

## Purpose
This folder contains the main application code for the La Musique project, including:
- The Next.js frontend
- UI components and pages for song creation, editing, feedback, and more
- API routes for frontend-backend communication

## Tech Stack
- **Next.js** (React framework)
- **TypeScript**
- **Tailwind CSS** (styling)
- **Axios** (API calls)

## Structure
- `page.tsx` — Main entry point for the app
- `api/` — API routes (e.g., health checks)
- `feedback/`, `saved/` — Feature pages
- `components/` — UI and feature components
- `globals.css` — Global styles

## How to Run
1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. The app will be available at `http://localhost:3000` by default.

## Notes
- Ensure the backend (see `src/ai/README.md`) is running for full functionality.
- Configure environment variables as needed in your `.env` file.
