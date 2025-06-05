
# La Musique

**Author:** Huy Le

La Musique is an adaptive song-writing application designed to be your creative music partner. It leverages AI to generate song lyrics and fitting melodies based on user-provided themes, details, and a selected emotion. The app allows users to refine and manually edit their creations. It features integrated AI Copilot hints (via tooltips) within each section for better guidance and allows users to save their progress locally. Users can also submit detailed feedback via an in-app survey, which is currently saved to their browser's local storage.

## Core Features

*   **AI Song & Melody Crafter with User-Selected Emotion and Integrated Editing**: A unified section on the main creation page to:
    *   Generate original song lyrics by specifying themes (from a predefined scrollable list or custom input, max 3 total), keywords, genre, and a desired emotion (including "Mixed Emotion" with up to 3 selectable sub-emotions).
    *   Manually type, paste, or edit lyrics directly in an integrated textarea. The main generation button changes to a dropdown ("Compose Options") after manual lyric edits, offering to either "Generate Lyrics & Compose Melody" (overwriting manual lyrics) or "Continue with these Lyrics".
    *   Compose a melody based on the current lyrics (either AI-generated or manually entered/edited), selected key, and tempo.
    *   The generated melody description includes **instructions on how to manually sing the song**.
    *   The AI also provides **feedback and suggestions on the lyrics** used for melody generation.
    *   Includes an expanded list of music genres.
    *   Includes an experimental AI-powered **scan for potential lyrical plagiarism** based on the generated or entered lyrics (currently a placeholder for a future feature).
*   **Audio Input (Optional)**:
    *   Upload audio files (e.g., song ideas, vocal snippets). A default silent placeholder is used if no audio is explicitly provided. A text note indicates that scanning audio for plagiarism is a future feature.
    *   (Planned) Record audio directly using a microphone.
    *   (Planned) AI-powered audio generation.
*   **Music Video Asset Management (Optional)**:
    *   Optionally upload image and video files if you intend to use assets for a music video. These are managed on the main creation page.
    *   (Planned) AI-powered music video generation using uploaded assets.
    *   (Planned) Experimental plagiarism scan for uploaded visual assets.
*   **Exporting Feature (Functional for Lyrics PDF, Placeholders for Audio)**:
    *   Functionality to export lyrics, melody description, and AI lyric feedback as a PDF (via browser's print-to-PDF). Prompts for song name if not already set or uses the current song name if available.
    *   Placeholders for exporting songs in common audio formats (e.g., MP3, WAV, MIDI) are planned, accessible from the creation page.
*   **Social Media Sharing (Placeholder)**: Easily share your generated songs on social media platforms (planned feature), accessible from the creation page.
*   **Save & Load Progress**:
    *   Users can save their current song (lyrics and melody data) with a custom name. Saved songs are stored in the browser's `localStorage`.
    *   A dedicated "Saved Songs" page (`/saved`) lists all saved work, allowing users to view details, load a song back into the main creation editor, or delete saved entries.
*   **Firebase Authentication**:
    *   User sign-up, login (email/password, Google), and logout functionality.
    *   User session persistence.
*   **Feedback Submission**:
    *   A dedicated "Feedback" page (`/feedback`) allows users to submit detailed survey responses. (Currently external link, future in-app integration)
    *   Currently, submitted feedback is saved to the user's browser `localStorage`. (Future enhancement: Store feedback centrally for admin review).

## Getting Started

### **1. Crucial Step for AI and Firebase Functionality: Environment Variables**

For the AI features (Genkit/Gemini) and Firebase features (Authentication) to work, you **MUST** have valid API keys and configuration.

**A. For Genkit AI Features (Lyrics Generation, Melody Composition, etc.):**
*   **`GOOGLE_API_KEY`**: You need a Google API key enabled for the "Generative Language API" (which provides access to Gemini models).
    *   **How to Obtain:**
        *   Go to [Google AI Studio](https://aistudio.google.com/).
        *   Sign in and follow instructions to "Get API key". Ensure it's enabled for the "Generative Language API".

**B. For Firebase Features (Authentication, Future Database/Storage):**
*   **Firebase Project Configuration Keys**: You need credentials from your Firebase project.
    *   **How to Obtain:**
        1.  Go to the [Firebase Console](https://console.firebase.google.com/) and select your project (or create one).
        2.  Ensure **Authentication** is set up (e.g., Email/Password and Google Sign-In methods enabled).
        3.  Click the **gear icon** (Project settings) next to "Project Overview".
        4.  In the **General** tab, scroll down to the "Your apps" section.
        5.  If you don't have a web app, click "Add app" and choose the web platform (`</>`). Follow the setup steps.
        6.  Once your web app is registered, find its "SDK setup and configuration" and copy the following values:
            *   `apiKey`
            *   `authDomain`
            *   `projectId`
            *   `storageBucket`
            *   `messagingSenderId`
            *   `appId`
            *   `measurementId` (optional, for Analytics)

**Setting up your Environment Variables for Local Development:**
*   **Create/Edit the `.env` file:** In the **root directory** of this project, create or edit the file named `.env`.
*   **Add your keys:**
    ```env
    # For Genkit AI Features
    GOOGLE_API_KEY="YOUR_ACTUAL_GOOGLE_API_KEY_FOR_GEMINI"

    # For Firebase Client-Side SDK (Authentication, etc.)
    # These MUST start with NEXT_PUBLIC_
    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_WEB_APP_API_KEY"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_PROJECT_AUTH_DOMAIN"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID" # Optional
    ```
    *   **Important:** Replace placeholder values with your actual keys. Ensure no extra spaces or characters.
*   **Restart the Development Server:** If your local development server is running (e.g., `npm run dev`), **you MUST stop and restart it** after saving changes to the `.env` file. Environment variables are typically loaded only when the server starts.
*   **Security:** The `.env` file is already listed in `.gitignore`, so your local API keys will not be committed to your Git repository. This is good practice.
*   **If AI or Firebase features still don't work:**
    *   Double-check all keys for typos.
    *   Ensure the `GOOGLE_API_KEY` is enabled for the correct API in Google Cloud Console.
    *   Ensure your Firebase app is correctly set up and the sign-in methods you intend to use are enabled in the Firebase Authentication console.
    *   Ensure you've restarted your development environment after setting the keys.

### **2. Install Dependencies**
Run the following command in your project's root directory.
```bash
npm install
```

### **3. Run the Development Server**
```bash
npm run dev
```
The application will typically be available at `http://localhost:9002`.

### **4. (Optional) Run Genkit Developer UI**
To inspect and test your Genkit flows locally:
```bash
npm run genkit:dev
# or for auto-reloading on changes
npm run genkit:watch
```
The Genkit Developer UI is usually available at `http://localhost:4000`.

### **5. Explore the UI**
*   The main page (`/`) is for song creation.
*   Authentication (Login/Signup) is available via the user icon in the header.
*   The "Saved Songs" page (`/saved`), accessible from the header, allows management of locally saved songs.
*   The "Feedback" link in the header navigates to an external Google Form.

## Deployment

### **Crucial Environment Variables for Deployment**

For your deployed application to function correctly, especially its AI (Genkit/Gemini) and Firebase (Authentication, future Firestore) features, you **MUST** configure the following environment variables in your **hosting provider's settings** (e.g., Vercel, Firebase App Hosting).

**1. For Genkit AI Features (Server-Side):**
*   `GOOGLE_API_KEY`: Your Google API key enabled for the "Generative Language API" (Gemini). This is used by Genkit flows running on the server.
    *   Obtain this as described in the "Getting Started" section.

**2. For Firebase Client-Side Features (Authentication, etc.):**
These variables are prefixed with `NEXT_PUBLIC_` to make them accessible to the client-side Firebase SDK.
*   `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase Web App's API Key.
*   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase Web App's Auth Domain (e.g., `your-project-id.firebaseapp.com`).
*   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase Project ID.
*   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase Storage Bucket (e.g., `your-project-id.appspot.com`).
*   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase Messaging Sender ID.
*   `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase Web App's App ID.
*   `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`: Your Firebase Web App's Measurement ID (optional, for Analytics).
    *   Obtain these from your Firebase project settings as described in the "Getting Started" section (under "B. For Firebase Features").

**Important Security Note for Deployment:**
*   The `GOOGLE_API_KEY` (without `NEXT_PUBLIC_`) is treated as a server-side secret by hosting platforms.
*   The `NEXT_PUBLIC_FIREBASE_...` keys are specifically prefixed to be bundled by Next.js for client-side use, which is necessary for the Firebase SDK to operate in the browser.

### Setting Environment Variables on Hosting Platforms:

The exact method depends on your hosting provider. Ensure you set **ALL** the variables listed above.

#### Deploying to Vercel
Vercel is an excellent platform for deploying Next.js applications.
1.  **Framework Preset**: Next.js (Vercel usually auto-detects this).
2.  **Build Command**: `npm run build` (or `next build`). Vercel usually auto-detects this.
3.  **Output Directory**: `.next` (Vercel usually auto-detects this).
4.  **Install Command**: `npm install` (Vercel usually auto-detects or handles this).
5.  **Push to Git:** Ensure your project is pushed to a Git repository (GitHub, GitLab, Bitbucket). Vercel integrates directly with these.
6.  **Import to Vercel:**
    *   Go to your [Vercel dashboard](https://vercel.com/dashboard).
    *   Click "Add New..." -> "Project".
    *   Import your Git repository.
7.  **Configure Project:**
    *   Vercel should automatically detect it as a Next.js project and configure build settings appropriately.
    *   **Environment Variables (CRUCIAL):**
        *   Navigate to your project's "Settings" tab on Vercel.
        *   Select "Environment Variables" from the side menu.
        *   Add **each** of the following variables with their respective correct values:
            *   `GOOGLE_API_KEY`
            *   `NEXT_PUBLIC_FIREBASE_API_KEY`
            *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
            *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
            *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
            *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
            *   `NEXT_PUBLIC_FIREBASE_APP_ID`
            *   `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (if you are using it)
        *   Ensure you select the appropriate environments (Production, Preview, Development) for each variable. Usually, they are needed in all.
8.  **Deploy:**
    *   After configuring environment variables, go to the "Deployments" tab for your project.
    *   Trigger a new deployment (Vercel might do this automatically if you push changes to your connected Git branch, or you can manually redeploy).
    *   **Important:** Changes to environment variables on Vercel require a **new deployment** to take effect.
9.  **Node.js Version**: Vercel typically uses a recent LTS version of Node.js. If you have specific requirements, you can configure this in `package.json` (`engines` field) or Vercel project settings, though defaults are usually fine (this project specifies Node.js >=20.0.0).

#### Firebase App Hosting
Given the `apphosting.yaml` file, Firebase App Hosting is a suitable deployment target.
1.  **Install Firebase CLI**:
    ```bash
    npm install -g firebase-tools
    ```
2.  **Login to Firebase**:
    ```bash
    firebase login
    ```
3.  **Initialize Firebase in your project** (if not already done):
    *   Run `firebase init apphosting` in your project root.
    *   Follow the prompts, selecting your Firebase project (or creating a new one) and configuring the App Hosting backend. It should detect your Next.js app.
4.  **Configure Environment Variables for Firebase App Hosting**:
    *   Go to your Firebase project in the [Firebase Console](https://console.firebase.google.com/).
    *   Navigate to your App Hosting backend settings.
    *   Add **ALL** the following environment variables (as listed in the "Crucial Environment Variables for Deployment" section above):
        *   `GOOGLE_API_KEY`
        *   `NEXT_PUBLIC_FIREBASE_API_KEY`
        *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
        *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
        *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
        *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
        *   `NEXT_PUBLIC_FIREBASE_APP_ID`
        *   `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (Optional)
    *   **Note:** For `NEXT_PUBLIC_` prefixed variables, Firebase App Hosting will make these available to your Next.js application during build and runtime.
5.  **Deploy**:
    ```bash
    firebase apphosting:backends:deploy
    ```
    Or, depending on your Firebase CLI version and setup:
    ```bash
    firebase deploy --only apphosting
    ```
    The CLI will provide a URL for your deployed application. After deployment, ensure all features (AI and Firebase Auth) are working, which depends on the correct environment variable setup.

#### Deploying to Render
1.  **Push to Git:** Ensure your project is pushed to a Git repository.
2.  **New Web Service on Render:** On the Render dashboard, click "New +" -> "Web Service" and connect your Git repository.
3.  **Configuration:**
    *   **Build Command:** `npm install && npm run build` (or `next build` if `npm install` is handled separately by Render)
    *   **Start Command:** `npm start` (or `next start`)
    *   **Node Version:** Ensure Render uses Node.js 20 or higher (you can set this in "Environment" settings or by having an `engines` field in `package.json` like `"node": ">=20.0.0"`).
    *   **Environment Variables (CRUCIAL):** In your service settings on Render, under "Environment", add **ALL** the crucial environment variables listed in the "Crucial Environment Variables for Deployment" section.
4.  **Create Service:** Click "Create Web Service". Redeploy if you update environment variables.

### General Deployment Considerations for Next.js

*   **Node.js Version**: Ensure your hosting provider is using a Node.js version compatible with your project (Node.js >=20.0.0 as per `package.json`).
*   **Build Command**: Typically `npm run build` or `next build`.
*   **Start Command**: Typically `npm start` or `next start`. Vercel handles this automatically.
*   **Health Check Path**: This app provides one at `/api/health`. You may need to configure this path in your hosting provider's settings if it's not auto-detected.
*   **Debugging Client-Side Errors**: If you encounter generic errors like "a client-side exception has occurred" after deployment, **it is crucial to check your browser's developer console** on the deployed site for more specific error messages. These messages will provide vital clues for debugging. Common causes include:
    *   Issues with environment variables not being set correctly on the server or not being available to the client (e.g., missing `NEXT_PUBLIC_FIREBASE_...` or `GOOGLE_API_KEY`).
    *   Attempts to access browser-specific APIs (`window`, `localStorage`) during server-side rendering without proper guards. Ensure such code is deferred to the client-side (e.g., within `useEffect` hooks with an `isClient` check, or by using `<Suspense>` for components that depend on client-side data).
*   **Serverless Functions**: Next.js App Router features (Server Components, Server Actions, Route Handlers) are well-suited for serverless environments, which Vercel excels at. Your Genkit flows (`'use server';`) are also designed to run server-side.

## Tech Stack & Design

*   Next.js (App Router, Server Components, Server Actions)
*   TypeScript
*   Tailwind CSS (for responsive styling)
*   ShadCN UI Components (responsive by design)
*   Firebase (Authentication)
*   Genkit (for AI flow integration, using Google AI models like Gemini)
*   Lucide Icons
*   `localStorage` for saving song progress and submitted feedback.

The application is built with responsive design principles, aiming for usability across various screen sizes.

## Future Backend Architecture Enhancements (Pydantic, SQLAlchemy, PostgreSQL, Docker)

The current application uses `localStorage` for data persistence, which is browser-based and has limitations (data is only on one browser, not easily shareable, limited storage). For a more robust, scalable, and production-ready backend, consider the following architecture:

1.  **Separate Python Backend API**:
    *   **Framework**: Use a Python web framework like **FastAPI** or Flask. FastAPI is highly recommended for its modern features, performance, and excellent integration with Pydantic.
    *   **Purpose**: This backend service will handle all core business logic related to data management (creating, reading, updating, deleting songs, user profiles, feedback, etc.).
    *   Your Next.js application will then act primarily as a frontend, making HTTP requests to this Python API.

2.  **PostgreSQL for Data Storage**:
    *   **Purpose**: A powerful, open-source relational database to securely store all application data (users, songs, feedback). This replaces `localStorage`.
    *   **Benefits**: Data integrity, relationships between data (e.g., a user owns multiple songs), scalability, and robust querying capabilities.

3.  **SQLAlchemy for ORM (Object-Relational Mapping)**:
    *   **Purpose**: Used within the Python backend to interact with the PostgreSQL database using Python objects and methods instead of raw SQL.
    *   **Models**: You'll define Python classes (e.g., `Song`, `User`) that map to your database tables and their columns.
    *   **Operations**: SQLAlchemy will manage database sessions, transactions, and querying.

4.  **Pydantic for Data Validation & Serialization**:
    *   **Purpose**: Also used in the Python backend (especially with FastAPI) to define clear data schemas for API request bodies and responses.
    *   **Validation**: Ensures incoming data conforms to expected structures and types before processing.
    *   **Serialization**: Formats data correctly for API responses.
    *   **API Documentation**: FastAPI can use Pydantic models to automatically generate interactive API documentation (e.g., Swagger UI/OpenAPI).

5.  **Docker for Containerization**:
    *   **Next.js Frontend**: Create a `Dockerfile` for your Next.js application to build and serve it. (A basic example is provided in the project root as `Dockerfile`).
    *   **Python Backend API**: Create a separate `Dockerfile` for your Python (FastAPI/Flask) application.
    *   **PostgreSQL**: Use the official PostgreSQL Docker image.
    *   **`docker-compose.yml`**: This file will define and orchestrate all three services (Next.js, Python API, PostgreSQL), managing their networking, environment variables, and data persistence for the database.

**High-Level Integration Steps:**

1.  **Design API Endpoints**: Define the routes and data structures your Python API will expose (e.g., `POST /songs`, `GET /songs/:id`, `POST /feedback`).
2.  **Develop Python Backend**:
    *   Set up a new Python project using FastAPI.
    *   Define SQLAlchemy models for your database tables (e.g., `songs`, `feedback_submissions`).
    *   Define Pydantic schemas for request/response validation and serialization.
    *   Implement API routes in FastAPI to handle CRUD operations, using SQLAlchemy to interact with PostgreSQL.
3.  **Database Setup**:
    *   Run PostgreSQL locally using Docker for development.
    *   For production, use a managed PostgreSQL service (e.g., on AWS, Google Cloud, Heroku, or Vercel Postgres).
4.  **Modify Next.js Frontend**:
    *   Remove all `localStorage` logic for saving/loading songs and feedback.
    *   Implement client-side functions (e.g., in a `services/api.ts` file) to make `fetch` or `axios` requests to your new Python API endpoints.
    *   Update components like `SongCrafter.tsx`, `SavedSongsPage.tsx`, `FeedbackForm.tsx`, and the main `page.tsx` to use these API calls for data persistence and retrieval.
    *   Firebase Authentication can remain, and you can pass user IDs or JWTs from the frontend to your Python backend to authorize requests and associate data with users.
5.  **Containerize**:
    *   Finalize the `Dockerfile` for the Next.js app.
    *   Create a `Dockerfile` for the Python API.
    *   Write a `docker-compose.yml` to run all services together.
6.  **Environment Variables**:
    *   The Python backend will need environment variables for database connection strings, any API secrets, etc.
    *   The Next.js frontend will need an environment variable for the URL of the Python backend API (e.g., `NEXT_PUBLIC_API_BASE_URL`).

This architectural change is a significant undertaking but leads to a much more robust and professional application structure. The Genkit AI flows can remain as server-side logic within your Next.js app or could also be migrated to the Python backend if they primarily interact with the data managed there.

## Known Issues & Future Enhancements

*   **SongCrafter Form State on Load**: When loading a saved song from `localStorage`, only lyrics and melody are restored. The form inputs in `SongCrafter` (theme, keywords, genre, etc.) are not repopulated.
*   **Advanced Plagiarism Detection**: The current plagiarism scans (lyrics, planned for visual assets) are basic and experimental.
*   **Melody Playback & Visualization**: Currently, melodies are generated as data (MusicXML) but not played back or visualized in detail.
*   **Full Audio Functionality**: Implementing robust microphone recording, AI audio generation, and more detailed audio analysis. Audio plagiarism scanning is also a future feature.
*   **Music Video Generation**: The music video generation feature itself is a placeholder.
*   **Full Export Functionality**: Implementing actual file export in various audio formats (MP3, WAV, MIDI).
*   **Social Media Integration**: Direct API integration for seamless sharing on social platforms.
*   **Centralized Feedback System**:
    *   **Current State**: The in-app Feedback page has been temporarily replaced by an external Google Form link in the header due to ongoing issues with Firebase setup for Firestore. Originally, user feedback submitted via the in-app survey was stored in the user's browser `localStorage`.
    *   **Future Enhancement**: Re-integrate the in-app feedback form and connect it to a backend database (e.g., PostgreSQL via a Python API as described above, or Firebase Firestore) for permanent, anonymous storage, allowing admin access.
*   **Admin View for Feedback Analysis**: Once feedback is centrally stored, an admin-only interface could be developed.
*   **Cloud Storage for Saved Songs**: Replace `localStorage` with cloud-based storage (e.g., PostgreSQL or Firestore) for saved songs, linked to user accounts, allowing access across devices.
*   **Admin Accounts & Management**: Develop admin roles.
*   **Tiered Plans & Subscriptions**: Introduce subscription levels.
*   **Dark Mode Theme**: A polished dark mode could be added.

This project is built with Firebase Studio and aims to provide a foundation for a powerful AI-assisted music creation tool.

```