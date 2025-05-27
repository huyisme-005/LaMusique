
# HarmonicAI

HarmonicAI is an adaptive song-writing application designed to be your creative music partner. It leverages AI to generate song lyrics and fitting melodies based on user-provided themes, details, and a selected emotion. The app allows users to refine and manually edit their creations. It features integrated AI Copilot hints within each section for better guidance and allows users to save their progress locally.

## Core Features

*   **AI Song & Melody Crafter with User-Selected Emotion and Integrated Editing**: A unified section on the main creation page to:
    *   Generate original song lyrics by specifying themes (from a predefined scrollable list or custom input, max 3 total), keywords, genre, and a desired emotion (including "Mixed Emotion" with up to 3 selectable sub-emotions).
    *   Manually type, paste, or edit lyrics directly in an integrated textarea. The main generation button changes to a dropdown ("Compose Options") after manual lyric edits, offering to either "Generate Lyrics & Compose Melody" (overwriting manual lyrics) or "Continue with these Lyrics".
    *   Compose a melody based on the current lyrics (either AI-generated or manually entered/edited), selected key, and tempo.
    *   The generated melody description includes **instructions on how to manually sing the song**.
    *   The AI also provides **feedback and suggestions on the lyrics** used for melody generation.
    *   Includes an expanded list of music genres.
    *   Includes an experimental AI-powered **scan for potential lyrical plagiarism** based on the generated or entered lyrics.
*   **Audio Input & Analysis (Optional)**:
    *   Upload audio files (e.g., song ideas, vocal snippets). If no audio is uploaded, a default silent placeholder is used for analysis. Audio input is optional, but required to enable plagiarism scan for audio.
    *   (Planned) Record audio directly using a microphone.
    *   (Planned) AI-powered audio generation.
    *   Perform an experimental AI-powered scan for potential lyrical or obvious thematic overlaps with existing works based on the audio (and any globally available lyrics, if applicable). (Note: This is a preliminary check with limitations).
*   **Music Video Asset Management (Optional)**:
    *   Optionally upload image and video files if you intend to use assets for a music video. These are managed on the main creation page.
    *   (Planned) AI-powered music video generation using uploaded assets.
    *   (Planned) Experimental plagiarism scan for uploaded visual assets.
*   **Exporting Feature (Functional for Lyrics PDF, Placeholders for Audio)**: 
    *   Functionality to export lyrics, melody description, and AI lyric feedback as a PDF (via browser's print-to-PDF). Prompts for song name if not already set.
    *   Placeholders for exporting songs in common audio formats (e.g., MP3, WAV, MIDI) are planned, accessible from the creation page.
*   **Social Media Sharing (Placeholder)**: Easily share your generated songs on social media platforms (planned feature), accessible from the creation page.
*   **Save & Load Progress**:
    *   Users can save their current song (lyrics and melody data) with a custom name. Saved songs are stored in the browser's `localStorage`.
    *   A dedicated "Saved Songs" page (`/saved`) lists all saved work, allowing users to view details, load a song back into the main creation editor, or delete saved entries.

## Getting Started

This is a Next.js application. To get started:

1.  **Install dependencies**:
    Run the following command in your project's root directory. This will install all necessary project dependencies as defined in the `package.json` file.
    ```bash
    npm install
    ```
2.  **Environment Variables (for local development)**:
    *   Create a `.env` file in the root of the project.
    *   Add your `GOOGLE_API_KEY` for Genkit to access Google AI models:
        ```env
        GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY_HERE
        ```
    *   For more advanced Google Cloud integrations, you might use Application Default Credentials. Refer to Google Cloud and Genkit documentation.

3.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:9002`.

4.  **(Optional) Run Genkit Developer UI**:
    To inspect and test your Genkit flows locally:
    ```bash
    npm run genkit:dev
    # or for auto-reloading on changes
    npm run genkit:watch
    ```
    The Genkit Developer UI is usually available at `http://localhost:4000`.

5.  **Explore the UI**:
    *   The main page (`/`) is for song creation:
        *   The left panel contains all song creation tools (including theme selection from a list, emotion selection with mixed emotion options, direct lyrics input/editing, melody parameters), audio input, and export/share controls, organized into a single vertically scrollable view with sections. A "Save Current Song" button is available here.
        *   The right panel displays generated lyrics (with plagiarism scan option), melody information (including singing instructions and lyric feedback), and music video asset controls (with placeholder plagiarism scan option).
    *   The "Saved Songs" page (`/saved`), accessible from the header, allows management of locally saved songs.

## Deployment

This application is structured for deployment, particularly with Firebase App Hosting in mind due to the presence of `apphosting.yaml`.

### Firebase App Hosting

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
4.  **Configure Environment Variables for Genkit**:
    *   For Genkit to function in the deployed environment, it needs access to your Google AI API key.
    *   Go to your Firebase project settings in the Firebase console.
    *   Navigate to the settings for your App Hosting backend.
    *   Add an environment variable named `GOOGLE_API_KEY` with your actual API key as its value.
    *   **IMPORTANT**: Do NOT commit your API key directly into your `.env` file or any other version-controlled file. The `.env` file is for local development and should be listed in your `.gitignore`.
5.  **Deploy**:
    ```bash
    firebase apphosting:backends:deploy
    ```
    Or, depending on your Firebase CLI version and setup:
    ```bash
    firebase deploy --only apphosting
    ```
    The CLI will provide a URL for your deployed application.

### General Deployment Considerations for Next.js (e.g., Vercel)

*   **Git Repository**: Platforms like Vercel integrate best with Git repositories (GitHub, GitLab, Bitbucket) for continuous deployment.
*   **Environment Variables**: Similar to Firebase, you'll need to configure `GOOGLE_API_KEY` (and any other necessary environment variables) in your hosting provider's settings.
*   **Build Process**: The `npm run build` script (`next build`) prepares your Next.js app for production. Most modern hosting platforms for Next.js will run this command automatically.
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

## Current MVPs (Minimum Viable Products)

*   Unified generation of song lyrics (from AI or manual input) and melody data (MusicXML format, description with singing instructions, and lyric feedback) based on user input (theme, keywords, selected emotion including "Mixed Emotion", genre, key, tempo) with expanded genre options on a single creation page.
*   Integrated lyrics editing within the main song crafting component, with conditional buttons for continuing with manual edits or regenerating AI content.
*   UI for audio file upload (optional, with default silent placeholder if none provided, explicit audio required for audio plagiarism scan) and an experimental AI flow for basic plagiarism concern flagging of audio.
*   Experimental AI flow for basic plagiarism concern flagging of generated/entered lyrics.
*   A responsive split-screen user interface on the creation page with a vertically scrollable left panel for controls and a right panel for viewing generated content. Horizontal scrollbars with arrow controls appear on individual cards if content overflows.
*   UI for optionally uploading image/video assets for future music video generation, with a placeholder for asset plagiarism scanning.
*   Local song saving (lyrics & melody data) and loading functionality via `localStorage`, managed on a separate "Saved Songs" page.
*   Export to PDF for lyrics and melody information (via browser print).

## Known Issues & Future Enhancements

*   **SongCrafter Form State**: When loading a saved song from `localStorage`, only lyrics and melody are restored. The form inputs in `SongCrafter` (theme, keywords, genre, etc.) are not repopulated.
*   **User Authentication & Accounts**:
    *   Implement a full user authentication system (e.g., email/password, phone number, social media logins like Google/Facebook).
    *   This is a prerequisite for many advanced features.
*   **Cloud-Based Work History**:
    *   Replace `localStorage` with cloud-based storage (e.g., Firestore) for saved songs, linked to user accounts. This would allow users to access their work across devices and sessions after logging in.
*   **Admin Accounts & Management**:
    *   Develop an admin role with capabilities to manage users, view user information (with appropriate privacy considerations), and potentially oversee app functionalities.
*   **Tiered Plans & Subscriptions**:
    *   Introduce different subscription levels (e.g., Free, Premium, Corporate) with varied feature access or usage limits, once user accounts are in place.
*   **Full Audio Recording & Processing**: Implementing robust microphone recording, audio editing, and potential speech-to-text for the "Audio Input" section.
*   **AI Audio Generation**: Fully implementing the AI audio generation feature.
*   **Advanced Plagiarism Detection**: The current plagiarism scan for audio and lyrics is basic. A more sophisticated system would require advanced analysis techniques and potentially access to larger content databases. Plagiarism detection for visual assets is also a complex future feature.
*   **Melody Playback & Visualization**: Currently, melodies are generated as data (MusicXML) but not played back or visualized in detail. This is a key future enhancement.
*   **Music Video Generation**: The music video generation feature itself is a placeholder and requires significant development beyond asset uploading.
*   **Full Export Functionality**: Implementing actual file export in various audio formats (MP3, WAV, MIDI).
*   **Social Media Integration**: Direct API integration for seamless sharing on social platforms.
*   **Audio-Reactive Visualizations**: Implementing subtle audio-reactive visuals to enhance user engagement.
*   **Custom Iconography**: While `lucide-react` is used, implementing custom-designed icons for musical elements could further enhance the UI.
*   **Dark Mode Theme**: The current focus is on the light theme; a polished dark mode could be added.

This project is built with Firebase Studio and aims to provide a foundation for a powerful AI-assisted music creation tool.
