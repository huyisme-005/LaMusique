
# HarmonicAI

HarmonicAI is an adaptive song-writing application designed to be your creative music partner. It leverages AI to generate song lyrics and fitting melodies based on user-provided themes and details. The app also offers AI-powered suggestions for song completion and allows users to refine and manually edit their creations.

## Core Features

*   **AI Song & Melody Crafter**: Generate original song lyrics and melodies by specifying themes, keywords, genre, key, and tempo.
*   **Refinement Interface**: Get AI suggestions for completing your songs and tweak parameters to match your preferences.
*   **Manual Edit Module**: Directly edit generated lyrics. Placeholder for future advanced melody editing.
*   **Exporting Feature (Placeholder)**: Functionality to export songs in common audio formats (e.g., MP3, WAV, MIDI) is planned.
*   **Social Media Sharing (Placeholder)**: Easily share your generated songs on social media platforms (planned feature).
*   **Music Video Generator (Placeholder)**: A feature to generate music videos for your songs is envisioned for the future.

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
    *   Use the "Lyrics" tab to generate song lyrics.
    *   Use the "Melody" tab to compose a melody for your lyrics.
    *   The "Refine" tab offers AI suggestions for song completion.
    *   The "Edit" tab allows manual modification of lyrics.
    *   The "Export" tab shows planned options for exporting and sharing.

## Tech Stack

*   Next.js (App Router, Server Components, Server Actions)
*   TypeScript
*   Tailwind CSS
*   ShadCN UI Components
*   Genkit (for AI flow integration)

## Current MVPs (Minimum Viable Products)

*   Generation of song lyrics based on user input (theme, keywords).
*   Generation of melody data (MusicXML format and description) based on lyrics and musical parameters (genre, key, tempo).
*   AI-powered suggestions for song completion.
*   A responsive split-screen user interface for inputting parameters and viewing generated content.
*   Basic manual editing capability for lyrics.
*   Placeholders for export, social sharing, and music video generation features.

## Known Issues & Future Enhancements

*   **Melody Playback & Advanced Editing**: Currently, melodies are generated as data (MusicXML) but not played back or visualized in detail. An advanced melody editor is a key future enhancement.
*   **Music Video Generation**: The music video generation feature is a placeholder and requires significant development.
*   **Full Export Functionality**: Implementing actual file export in various audio formats.
*   **Social Media Integration**: Direct API integration for seamless sharing on social platforms.
*   **Audio-Reactive Visualizations**: Implementing subtle audio-reactive visuals to enhance user engagement, as suggested in the design proposal.
*   **User Accounts & Saving Projects**: Allowing users to save their work and manage multiple song projects.
*   **Expanded AI Models & Parameters**: Integrating more sophisticated AI models and offering finer control over generation parameters.
*   **Custom Iconography**: While `lucide-react` is used, implementing custom-designed icons for musical elements could further enhance the UI.
*   **Dark Mode Theme**: The current focus is on the light theme; a polished dark mode could be added.

This project is built with Firebase Studio and aims to provide a foundation for a powerful AI-assisted music creation tool.
