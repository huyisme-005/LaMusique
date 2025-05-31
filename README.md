
# La Musique

**Author:** [Your Name/Organization Here]

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
*   **Feedback Submission**:
    *   A dedicated "Feedback" page (`/feedback`) allows users to submit detailed survey responses.
    *   Currently, submitted feedback is saved to the user's browser `localStorage`. (Future enhancement: Store feedback centrally for admin review, see "Centralized Feedback System" in Future Enhancements).

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
    # IMPORTANT: Replace with your actual Google API Key for Gemini models
    GOOGLE_API_KEY="YOUR_ACTUAL_VALID_API_KEY_GOES_HERE"
    # Example: GOOGLE_API_KEY="Abc123XYZ"
    ```
    *   **Important:** Make sure there are no extra spaces or characters around your key.
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
    *   The right panel displays generated lyrics (with placeholder plagiarism scan option), melody information (including singing instructions and lyric feedback), and music video asset controls (with placeholder plagiarism scan option). Individual cards here will also show horizontal scrollbars if their content overflows.
*   The "Saved Songs" page (`/saved`), accessible from the header, allows management of locally saved songs.
*   The "Feedback" page (`/feedback`), accessible from the header, provides a survey for user input.

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
*   `localStorage` for saving song progress and submitted feedback.

The application is built with responsive design principles, aiming for usability across various screen sizes, including desktop PCs and mobile devices like iPhones (accessed via a web browser).

## Known Issues & Future Enhancements

*   **SongCrafter Form State on Load**: When loading a saved song from `localStorage`, only lyrics and melody are restored. The form inputs in `SongCrafter` (theme, keywords, genre, etc.) are not repopulated.
*   **Advanced Plagiarism Detection**: The current plagiarism scans (lyrics, planned for visual assets) are basic and experimental. More sophisticated systems would require advanced techniques and access to larger content databases.
*   **Melody Playback & Visualization**: Currently, melodies are generated as data (MusicXML) but not played back or visualized in detail.
*   **Full Audio Functionality**: Implementing robust microphone recording, AI audio generation, and more detailed audio analysis. Audio plagiarism scanning is also a future feature.
*   **Music Video Generation**: The music video generation feature itself is a placeholder and requires significant development beyond asset uploading.
*   **Full Export Functionality**: Implementing actual file export in various audio formats (MP3, WAV, MIDI).
*   **Social Media Integration**: Direct API integration for seamless sharing on social platforms.
*   **Centralized Feedback System**:
    *   **Current State**: User feedback submitted via the survey is stored in the user's browser `localStorage`. This means only the user who submitted it can see it on that browser, and the admin cannot centrally view all submissions.
    *   **Future Enhancement**: To allow admin access to all feedback and for permanent, anonymous storage, a backend database (e.g., Firebase Firestore) and API endpoints would need to be implemented. See "Implementing a Backend for Feedback (Firebase Firestore)" section below for guidance.
*   **Admin View for Feedback Analysis**:
    *   **Future Enhancement**: Once feedback is centrally stored, an admin-only interface could be developed to display aggregated feedback, including percentages for multiple-choice answers. This requires backend setup and authentication.
*   **User Authentication & Cloud Storage**:
    *   Implement a full user authentication system (e.g., email/password, phone number, social media logins).
    *   Replace `localStorage` with cloud-based storage (e.g., Firestore) for saved songs, linked to user accounts. This would allow users to access their work across devices and sessions after logging in.
*   **Admin Accounts & Management**:
    *   Develop an admin role with capabilities to manage users, view user information (with appropriate privacy considerations), and potentially oversee app functionalities (including centrally viewing submitted feedback).
*   **Tiered Plans & Subscriptions**:
    *   Introduce different subscription levels (e.g., Free, Premium, Corporate) with varied feature access or usage limits, once user accounts are in place.
*   **Dark Mode Theme**: The current focus is on the light theme; a polished dark mode could be added.

## Implementing a Backend for Feedback (Firebase Firestore)

To store user feedback permanently, anonymously, and allow admin access, you'll need a backend. Firebase Firestore is a good free-to-start option.

**1. Set up Firebase:**
   * Go to the [Firebase Console](https://console.firebase.google.com/).
   * Create a new project or use an existing one.
   * Add **Firestore Database** to your project.
     * When prompted for security rules, start with "test mode" for easier development. **Remember to secure these rules before any public launch.**
     * `rules_version = '2'; service cloud.firestore { match /databases/{database}/documents { match /{document=**} { allow read, write: if false; } } }` (default deny)
     * You'll later change this to something like:
       ```
       rules_version = '2';
       service cloud.firestore {
         match /databases/{database}/documents {
           // Allow anyone to submit feedback (write)
           match /feedback/{feedbackId} {
             allow create: if true; // Or add request.auth != null for authenticated users
             // Allow only authenticated admins to read feedback
             allow read, list, delete, update: if request.auth != null && request.auth.token.admin === true;
           }
         }
       }
       ```
       (Implementing admin custom claims (`request.auth.token.admin === true`) requires additional Firebase setup.)

**2. Add Firebase SDK to Your Project:**
   * In your project's root directory, run:
     ```bash
     npm install firebase
     ```

**3. Configure Firebase in Your Next.js App:**
   * Create a file, e.g., `src/lib/firebaseConfig.js` (or `.ts`):
     ```javascript
     // src/lib/firebaseConfig.js
     import { initializeApp, getApps } from "firebase/app";
     import { getFirestore } from "firebase/firestore";

     const firebaseConfig = {
       apiKey: "YOUR_API_KEY", // Get this from Firebase project settings
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
     };

     // Initialize Firebase
     let app;
     if (!getApps().length) {
       app = initializeApp(firebaseConfig);
     } else {
       app = getApps()[0];
     }

     const db = getFirestore(app);

     export { db };
     ```
   * Replace `YOUR_...` placeholders with your actual Firebase project credentials (Project Settings > General > Your apps > SDK setup and configuration).
   * **Important for Security**: Store these Firebase client config keys securely. For local development, they can be in `.env.local` and accessed via `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`, etc. For deployment (e.g., Vercel), set them as environment variables on your hosting platform. **Do not commit actual keys directly into your `firebaseConfig.js` file if it's part of your Git repository.**

**4. Create an API Endpoint or Server Action to Submit Feedback:**
   * **Using Next.js API Route (e.g., `src/app/api/submit-feedback/route.ts`):**
     ```typescript
     // src/app/api/submit-feedback/route.ts
     import { NextResponse } from 'next/server';
     import { db } from '@/lib/firebaseConfig'; // Adjust path if needed
     import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

     export async function POST(request: Request) {
       try {
         const feedbackData = await request.json();
         
         // Add a server timestamp for when the feedback was received
         const feedbackToSave = {
           ...feedbackData,
           submittedAt: serverTimestamp() 
         };

         const docRef = await addDoc(collection(db, "feedback"), feedbackToSave);
         console.log("Feedback submitted to Firestore with ID: ", docRef.id);
         return NextResponse.json({ message: "Feedback submitted successfully!", id: docRef.id }, { status: 201 });
       } catch (error) {
         console.error("Error submitting feedback to Firestore:", error);
         let errorMessage = "Failed to submit feedback.";
         if (error instanceof Error) {
            errorMessage = error.message;
         }
         return NextResponse.json({ error: "Failed to submit feedback.", details: errorMessage }, { status: 500 });
       }
     }
     ```
   * **Using Next.js Server Action (within `FeedbackForm.tsx` or a separate actions file):**
     Server Actions can directly interact with Firestore if the Firebase SDK is initialized appropriately for server-side use. This often involves using the Firebase Admin SDK if you need privileged operations, or carefully managing client-SDK initialization in server components. For simple writes from authenticated users (or anonymous with open rules), client-SDK usage within Server Actions is also possible.

**5. Update `FeedbackForm.tsx` to Use the API/Action:**
   * Modify the `onSubmit` handler:
     ```tsx
     // Inside FeedbackForm.tsx onSubmit function
     // ...
     setIsLoading(true);
     try {
       const response = await fetch('/api/submit-feedback', { // Or call your Server Action
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data), // data is from react-hook-form
       });

       if (!response.ok) {
         const errorResult = await response.json();
         throw new Error(errorResult.details || 'Failed to submit feedback to server.');
       }
       
       const result = await response.json();
       console.log("Feedback Submitted via API:", result);
       toast({
         title: "Feedback Sent!",
         description: "Thank you! Your feedback has been submitted.",
       });
       form.reset();
       // Optionally, still save to localStorage as a backup or if offline submission is a goal
       // localStorage.setItem(...) 
     } catch (error) {
       console.error("Error submitting feedback:", error);
       toast({
         title: "Submission Error",
         description: (error as Error).message || "Could not submit your feedback. Please try again.",
         variant: "destructive",
       });
     } finally {
       setIsLoading(false);
     }
     // ...
     ```

**6. Admin Access to Feedback (Future Enhancement):**
   * Create a new admin-only page (e.g., `/admin/feedback`).
   * Implement authentication to protect this page.
   * On this page, fetch data from the "feedback" collection in Firestore.
   * Implement logic to aggregate the data (e.g., count answers, calculate percentages).
   * Display the aggregated data using tables or charts.

This provides a robust way to collect and manage feedback. Remember to prioritize security, especially with Firestore rules and API key management.

This project is built with Firebase Studio and aims to provide a foundation for a powerful AI-assisted music creation tool.
