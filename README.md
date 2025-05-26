
# HarmonicAI

HarmonicAI is an adaptive song-writing application designed to be your creative music partner. It leverages AI to generate song lyrics and fitting melodies based on user-provided themes and details. The app also offers AI-powered suggestions for song completion and allows users to refine and manually edit their creations.

## Core Features

*   **AI Song & Melody Crafter**: Generate original song lyrics and melodies by specifying themes, keywords, genre, key, and tempo.
    *   Lyrics generation includes an automatic switch to the "Edit" tab for immediate refinement.
    *   Melody generation offers an expanded list of music genres.
*   **Audio Input & Analysis (New!)**:
    *   Upload audio files (e.g., song ideas, vocal snippets).
    *   (Planned) Record audio directly using a microphone.
    *   Provide optional lyrics associated with the uploaded audio.
    *   Perform an experimental AI-powered scan for potential lyrical or obvious thematic overlaps with existing works. (Note: This is a preliminary check with limitations).
*   **Emotion Analysis**: Input text to analyze its emotional content, receiving insights on detected emotion, confidence, and an AI explanation. (Voice input planned for future).
*   **Refinement Interface**: Get AI suggestions for completing your songs and tweak parameters to match your preferences.
*   **Manual Edit Module**: Directly edit generated lyrics. Placeholder for future advanced melody editing.
*   **Music Video Asset Management (Enhanced!)**:
    *   Upload image and video files to be used as assets for a music video.
    *   (Planned) AI-powered music video generation using uploaded assets.
*   **Exporting Feature (Placeholder)**: Functionality to export songs in common audio formats (e.g., MP3, WAV, MIDI) is planned.
*   **Social Media Sharing (Placeholder)**: Easily share your generated songs on social media platforms (planned feature).

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
    *   Use the "Lyrics" tab to generate song lyrics. You will be automatically switched to the "Edit" tab.
    *   Use the "Melody" tab to compose a melody for your lyrics, selecting from a wide range of genres.
    *   The "Audio Input" tab allows uploading audio and performing a basic plagiarism scan.
    *   The "Emotion" tab lets you analyze the emotional tone of text.
    *   The "Refine" tab offers AI suggestions for song completion.
    *   The "Edit" tab allows manual modification of lyrics.
    *   The "Export" tab shows planned options for exporting, sharing, and managing music video assets.

## Tech Stack

*   Next.js (App Router, Server Components, Server Actions)
*   TypeScript
*   Tailwind CSS
*   ShadCN UI Components
*   Genkit (for AI flow integration, using Google AI models like Gemini)

## Current MVPs (Minimum Viable Products)

*   Generation of song lyrics based on user input (theme, keywords), with direct navigation to editor.
*   Generation of melody data (MusicXML format and description) based on lyrics and musical parameters (genre, key, tempo) with expanded genre options.
*   UI for audio file upload and an experimental AI flow for basic plagiarism concern flagging.
*   AI-powered text emotion analysis.
*   AI-powered suggestions for song completion.
*   A responsive split-screen user interface for inputting parameters and viewing generated content, with horizontally scrollable tabs for controls.
*   Basic manual editing capability for lyrics.
*   UI for uploading image/video assets for future music video generation.
*   Placeholders for export, social sharing, and full music video generation features.

## Known Issues & Future Enhancements

*   **Full Audio Recording & Processing**: Implementing robust microphone recording, audio editing, and potential speech-to-text for the "Audio Input" tab.
*   **Advanced Plagiarism Detection**: The current plagiarism scan is very basic. A more sophisticated system would require advanced audio analysis and a comprehensive database, which is a significant undertaking.
*   **Melody Playback & Advanced Editing**: Currently, melodies are generated as data (MusicXML) but not played back or visualized in detail. An advanced melody editor is a key future enhancement.
*   **Music Video Generation**: The music video generation feature itself is a placeholder and requires significant development beyond asset uploading.
*   **Inline AI Copilot-Style Suggestions**: Enhancing the editing experience with real-time, contextual AI suggestions as the user types.
*   **User Accounts & Work History**: Implementing user authentication (signup/login) and database functionality to save, load, and manage user projects and work history.
*   **Tiered Plans & Subscriptions**: Adding different subscription levels with varied features.
*   **Full Export Functionality**: Implementing actual file export in various audio formats.
*   **Social Media Integration**: Direct API integration for seamless sharing on social platforms.
*   **Audio-Reactive Visualizations**: Implementing subtle audio-reactive visuals to enhance user engagement.
*   **Custom Iconography**: While `lucide-react` is used, implementing custom-designed icons for musical elements could further enhance the UI.
*   **Dark Mode Theme**: The current focus is on the light theme; a polished dark mode could be added.

This project is built with Firebase Studio and aims to provide a foundation for a powerful AI-assisted music creation tool.
