
# La Musique

**Author:** [Your Name/Organization Here]

La Musique is an adaptive song-writing application designed to be your creative music partner. It leverages AI to generate song lyrics and fitting melodies based on user-provided themes, details, and a selected emotion. The app allows users to refine and manually edit their creations. It features integrated AI Copilot hints (via tooltips) within each section for better guidance and allows users to save their progress locally.

## Core Features

*   **AI Song & Melody Crafter with User-Selected Emotion and Integrated Editing**: A unified section on the main creation page to:
    *   Generate original song lyrics by specifying themes (from a predefined scrollable list or custom input, max 3 total), keywords, genre, and a desired emotion (including "Mixed Emotion" with up to 3 selectable sub-emotions).
    *   Manually type, paste, or edit lyrics directly in an integrated textarea. The main generation button changes to a dropdown ("Compose Options") after manual lyric edits, offering to either "Generate Lyrics & Compose Melody" (overwriting manual lyrics) or "Continue with these Lyrics".
    *   Compose a melody based on the current lyrics (either AI-generated or manually entered/edited), selected key, and tempo.
    *   The generated melody description includes **instructions on how to manually sing the song**.
    *   The AI also provides **feedback and suggestions on the lyrics** used for melody generation.
    *   Includes an expanded list of music genres.
    *   Includes an experimental AI-powered **scan for potential lyrical plagiarism** based on the generated or entered lyrics.
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

## Getting Started

### **1. Crucial Step for AI Functionality: `GOOGLE_API_KEY`**

For the AI features (lyrics generation, melody composition, plagiarism checks via Genkit/Gemini) to work, you **MUST** have a valid Google API key enabled for the "Generative Language API" (which provides access to Gemini models).

**How to Obtain Your API Key:**
*   Go to [Google AI Studio](https://aistudio.google.com/).
*   Sign in with your Google account.
*   Follow the instructions to "Get API key" or create one within a new project. Ensure it's enabled for the "Generative Language API".

**Setting up your API Key for Local Development (e.g., Firebase Studio, your local machine):**
*   **Create/Edit the `.env` file:** In the **root directory** of this project, you will find a file named `.env`. If it doesn't exist, create it.
*   **Add your API key:** Open the `.env` file and ensure it has the following line, replacing `YOUR_ACTUAL_VALID_API_KEY_GOES_HERE` with your actual key:
    ```env
    GOOGLE_API_KEY="YOUR_ACTUAL_VALID_API_KEY_GOES_HERE"
    ```
    *   **Important:** Make sure there are no extra spaces or characters around your key.
    *   **Example if your key is `Abc123XYZ`**:
        ```env
        GOOGLE_API_KEY="Abc123XYZ"
        ```
*   **Restart the Development Server:** If you are running a local development server (e.g., `npm run dev`) or if you are in an environment like Firebase Studio, **you MUST restart the server/environment after saving changes to the `.env` file.** Environment variables are typically loaded only when the server starts.
*   **Security:** The `.env` file is already listed in `.gitignore`, so your local API key will not be committed to your Git repository. This is good practice.
*   **If AI features still don't work:**
    *   Double-check the key for typos.
    *   Ensure the key is enabled for the correct API in Google Cloud Console.
    *   Ensure you've restarted your development environment after setting the key.

### **2. Install Dependencies**
Run the following command in your project's root directory. This will install all necessary project dependencies as defined in the `package.json` file.
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
*   The main page (`/`) is for song creation:
    *   The left panel contains all song creation tools (including theme selection from a scrollable list with custom input, emotion selection with mixed emotion options, direct lyrics input/editing, melody parameters), audio input, and export/share controls, organized into a single vertically scrollable view with sections. A "Save Current Song" button is available here. Individual cards within this panel will show horizontal scrollbars if their content overflows.
    *   The right panel displays generated lyrics (with plagiarism scan option), melody information (including singing instructions and lyric feedback), and music video asset controls (with placeholder plagiarism scan option). Individual cards here will also show horizontal scrollbars if their content overflows.
*   The "Saved Songs" page (`/saved`), accessible from the header, allows management of locally saved songs.

## Deployment

### **Crucial Step for AI Functionality on Deployed App: `GOOGLE_API_KEY`**

For the AI features to work in your deployed application, you **MUST** configure the `GOOGLE_API_KEY` (obtained as described in "Getting Started") as an environment variable in your **hosting provider's settings**.

*   **Do NOT commit your API key directly into your `.env` file if that file is part of your Git repository.** The `.env` file is for local development.
*   The application's Genkit setup (`src/ai/genkit.ts`) is already designed to use this environment variable (`process.env.GOOGLE_API_KEY`).

### Setting Environment Variables on Hosting Platforms:

The exact method for setting environment variables depends on your hosting provider. Here are general pointers:
*   **Vercel:** In your project settings on the Vercel dashboard, find the "Settings" tab, then "Environment Variables" section. Add `GOOGLE_API_KEY` with your actual key.
*   **Render:** In your service settings on the Render dashboard, under "Environment", add `GOOGLE_API_KEY` with your actual key.
*   **Netlify:** In your site settings on Netlify, navigate to "Site configuration" -> "Build & deploy" -> "Environment".
*   **Firebase App Hosting:** (See specific section below)
*   **AWS Amplify:** In the Amplify console, for your app, look for "Environment variables".
*   **Heroku:** Use the Heroku Dashboard (Settings -> Config Vars) or the Heroku CLI (`heroku config:set GOOGLE_API_KEY=YOUR_KEY_HERE`).
*   **Other Platforms (Azure App Service, Google Cloud Run, DigitalOcean App Platform, etc.):** Consult your provider's specific documentation for "environment variables" or "application settings".

### Firebase App Hosting

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
4.  **Configure Environment Variables for Genkit in Firebase**:
    *   Go to your Firebase project settings in the Firebase console.
    *   Navigate to the settings for your App Hosting backend.
    *   Add an environment variable named `GOOGLE_API_KEY` with your actual API key as its value.
5.  **Deploy**:
    ```bash
    firebase apphosting:backends:deploy
    ```
    Or, depending on your Firebase CLI version and setup:
    ```bash
    firebase deploy --only apphosting
    ```
    The CLI will provide a URL for your deployed application.

### Deploying to Vercel

1.  **Push to Git:** Ensure your project is pushed to a Git repository (GitHub, GitLab, Bitbucket).
2.  **Import to Vercel:** Go to your Vercel dashboard, select "Add New..." -> "Project", and import your Git repository.
3.  **Configure Project:**
    *   Vercel should automatically detect it as a Next.js project.
    *   **Environment Variables:** Go to your project's "Settings" -> "Environment Variables" on Vercel. Add `GOOGLE_API_KEY` with your actual API key.
4.  **Deploy:** Click "Deploy". Vercel will build and deploy your app.

### Deploying to Render

1.  **Push to Git:** Ensure your project is pushed to a Git repository.
2.  **New Web Service on Render:** On the Render dashboard, click "New +" -> "Web Service" and connect your Git repository.
3.  **Configuration:**
    *   **Build Command:** `npm install && npm run build`
    *   **Start Command:** `npm start`
    *   **Node Version:** Ensure Render uses Node.js 20 or higher (you can set this in "Advanced Settings" or by having an `engines` field in `package.json` like `"node": ">=20.0.0"`).
    *   **Environment Variables:** In "Advanced Settings" -> "Environment Variables", add `GOOGLE_API_KEY` with your actual key.
4.  **Create Service:** Click "Create Web Service".

### General Deployment Considerations for Next.js

*   **Node.js Version**: Ensure your hosting provider is using a Node.js version compatible with your project. The `package.json` includes an `engines` field specifying `node >=20.0.0`. Platforms like Render might pick this up, or you may need to set it explicitly in their dashboard.
*   **Git Repository**: Platforms like Vercel and Render integrate best with Git repositories (GitHub, GitLab, Bitbucket) for continuous deployment.
*   **Environment Variables**: As mentioned above, configure `GOOGLE_API_KEY` (and any other necessary environment variables) in your hosting provider's settings dashboard.
*   **Build Command**: Platforms will typically use `npm install && npm run build` (or `yarn install && yarn build`).
*   **Start Command**: Platforms will typically use `npm start` (or `yarn start`).
*   **Health Check Path**: This app provides one at `/api/health`. You may need to configure this path in your hosting provider's settings.
*   **Debugging Client-Side Errors**: If you encounter generic errors like "a client-side exception has occurred" after deployment, **it is crucial to check your browser's developer console** on the deployed site for more specific error messages. These messages will provide vital clues for debugging. Common causes include:
    *   Issues with environment variables not being set correctly on the server (e.g., missing `GOOGLE_API_KEY`).
    *   Attempts to access browser-specific APIs (`window`, `localStorage`) during server-side rendering or static generation. Ensure such code is deferred to the client-side (e.g., within `useEffect` hooks guarded by a client check like `isClient`, or by using `<Suspense>` for components that depend on client-side data like URL search parameters). Your main page (`src/app/page.tsx`) now uses an `isClient` guard for `localStorage` access, and the `SongLoader` component handles `useSearchParams` within a `Suspense` boundary.
*   **Serverless Functions**: Next.js App Router features like Server Components and Server Actions are well-suited for serverless environments. Your Genkit flows (`'use server';`) are also designed to run server-side.
*   **Static Assets**: Ensure any static assets are correctly placed (usually in the `public` directory).

## Tech Stack & Design

*   Next.js (App Router, Server Components, Server Actions)
*   TypeScript
*   Tailwind CSS (for responsive styling)
*   ShadCN UI Components (responsive by design)
*   Genkit (for AI flow integration, using Google AI models like Gemini)
*   Lucide Icons
*   `localStorage` for saving song progress.

The application is built with responsive design principles, aiming for usability across various screen sizes, including desktop PCs and mobile devices like iPhones (accessed via a web browser).

## Known Issues & Future Enhancements

*   **SongCrafter Form State on Load**: When loading a saved song from `localStorage`, only lyrics and melody are restored. The form inputs in `SongCrafter` (theme, keywords, genre, etc.) are not repopulated.
*   **Advanced Plagiarism Detection**: The current plagiarism scans (lyrics, planned for visual assets) are basic and experimental. Audio plagiarism scanning is also a planned future feature. More sophisticated systems would require advanced techniques and access to larger content databases.
*   **Melody Playback & Visualization**: Currently, melodies are generated as data (MusicXML) but not played back or visualized in detail.
*   **Full Audio Functionality**: Implementing robust microphone recording, AI audio generation, and more detailed audio analysis.
*   **Music Video Generation**: The music video generation feature itself is a placeholder and requires significant development beyond asset uploading.
*   **Full Export Functionality**: Implementing actual file export in various audio formats (MP3, WAV, MIDI).
*   **Social Media Integration**: Direct API integration for seamless sharing on social platforms.
*   **User Authentication & Cloud Storage**:
    *   Implement a full user authentication system (e.g., email/password, phone number, social media logins).
    *   Replace `localStorage` with cloud-based storage (e.g., Firestore) for saved songs, linked to user accounts. This would allow users to access their work across devices and sessions after logging in.
*   **Admin Accounts & Management**:
    *   Develop an admin role with capabilities to manage users, view user information (with appropriate privacy considerations), and potentially oversee app functionalities.
*   **Tiered Plans & Subscriptions**:
    *   Introduce different subscription levels (e.g., Free, Premium, Corporate) with varied feature access or usage limits, once user accounts are in place.
*   **Dark Mode Theme**: The current focus is on the light theme; a polished dark mode could be added.

This project is built with Firebase Studio and aims to provide a foundation for a powerful AI-assisted music creation tool.
