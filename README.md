
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
*   **Audio Input & Analysis (Optional)**:
    *   Upload audio files (e.g., song ideas, vocal snippets). If no audio is uploaded, a default silent placeholder is used for analysis. Audio input is optional.
    *   (Planned) Record audio directly using a microphone.
    *   Perform an experimental AI-powered scan for potential lyrical or obvious thematic overlaps with existing works based on the audio (and any globally available lyrics, if applicable). (Note: This is a preliminary check with limitations).
*   **Integrated AI Copilot Hints**: Contextual tips and instructions for various features are available via "Info" icons and tooltips directly within each relevant component/section on the creation page.
*   **Music Video Asset Management (Optional)**:
    *   Optionally upload image and video files if you intend to use assets for a music video. These are managed on the main creation page.
    *   (Planned) AI-powered music video generation using uploaded assets.
*   **Exporting Feature (Placeholder)**: Functionality to export songs in common audio formats (e.g., MP3, WAV, MIDI) and lyrics as PDF is planned, accessible from the creation page.
*   **Social Media Sharing (Placeholder)**: Easily share your generated songs on social media platforms (planned feature), accessible from the creation page.
*   **Save & Load Progress**:
    *   Users can save their current song (lyrics and melody data) with a custom name. Saved songs are stored in the browser's `localStorage`.
    *   A dedicated "Saved Songs" page (`/saved`) lists all saved work, allowing users to view details, load a song back into the main creation editor, or delete saved entries.

## Getting Started

This is a Next.js application. To get started:

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:9002`.

3.  **Explore the UI**:
    *   The main page (`/`) is for song creation:
        *   The left panel contains all song creation tools (including theme selection from a list, emotion selection with mixed emotion options, direct lyrics input/editing, melody parameters), audio input, and export/share controls, organized into a single vertically scrollable view with sections. Integrated AI Copilot hints (info icons) provide guidance. A "Save Current Song" button is available here.
        *   The right panel displays generated lyrics, melody information (including singing instructions and lyric feedback), and music video asset controls.
    *   The "Saved Songs" page (`/saved`), accessible from the header, allows management of locally saved songs.

## Tech Stack & Design

*   Next.js (App Router, Server Components, Server Actions)
*   TypeScript
*   Tailwind CSS (for responsive styling)
*   ShadCN UI Components (responsive by design)
*   Genkit (for AI flow integration, using Google AI models like Gemini)
*   Lucide Icons & ShadCN Tooltips (for integrated AI Copilot hints)
*   `localStorage` for saving song progress.

The application is built with responsive design principles, aiming for usability across various screen sizes, including desktop PCs and mobile devices like iPhones (accessed via a web browser).

## Current MVPs (Minimum Viable Products)

*   Unified generation of song lyrics (from AI or manual input) and melody data (MusicXML format, description with singing instructions, and lyric feedback) based on user input (theme, keywords, selected emotion including "Mixed Emotion", genre, key, tempo) with expanded genre options on a single creation page.
*   Integrated lyrics editing within the main song crafting component, with conditional buttons for continuing with manual edits or regenerating AI content.
*   UI for audio file upload (optional, with default silent placeholder if none provided) and an experimental AI flow for basic plagiarism concern flagging.
*   Integrated AI Copilot hints via tooltips within each major feature component on the creation page.
*   A responsive split-screen user interface on the creation page with a vertically scrollable left panel for controls and a right panel for viewing generated content. Horizontal scrollbars appear on individual cards if content overflows.
*   UI for optionally uploading image/video assets for future music video generation.
*   Local song saving (lyrics & melody data) and loading functionality via `localStorage`, managed on a separate "Saved Songs" page.
*   Placeholders for export (including lyrics to PDF), social sharing, and full music video generation features.

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
*   **Advanced Plagiarism Detection**: The current plagiarism scan is very basic. A more sophisticated system would require advanced audio analysis and a comprehensive database.
*   **Melody Playback & Visualization**: Currently, melodies are generated as data (MusicXML) but not played back or visualized in detail. This is a key future enhancement.
*   **Music Video Generation**: The music video generation feature itself is a placeholder and requires significant development beyond asset uploading.
*   **Full Export Functionality**: Implementing actual file export in various audio formats (MP3, WAV, MIDI) and lyrics to PDF.
*   **Social Media Integration**: Direct API integration for seamless sharing on social platforms.
*   **Audio-Reactive Visualizations**: Implementing subtle audio-reactive visuals to enhance user engagement.
*   **Custom Iconography**: While `lucide-react` is used, implementing custom-designed icons for musical elements could further enhance the UI.
*   **Dark Mode Theme**: The current focus is on the light theme; a polished dark mode could be added.

This project is built with Firebase Studio and aims to provide a foundation for a powerful AI-assisted music creation tool.


    