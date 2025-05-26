
# HarmonicAI

HarmonicAI is an adaptive song-writing application designed to be your creative music partner. It leverages AI to generate song lyrics and fitting melodies based on user-provided themes, details, and a selected emotion. The app allows users to refine and manually edit their creations. It features integrated AI Copilot hints within each section for better guidance.

## Core Features

*   **AI Song & Melody Crafter with User-Selected Emotion and Integrated Editing**: A unified section to:
    *   Generate original song lyrics by specifying themes, keywords, genre, and a desired emotion (including "Mixed Emotion" with up to 3 selectable sub-emotions).
    *   Manually type, paste, or edit lyrics directly in an integrated textarea.
    *   Compose a melody based on the current lyrics (either AI-generated or manually entered/edited), selected key, and tempo.
    *   The generated melody description includes **instructions on how to manually sing the song**.
    *   The AI also provides **feedback and suggestions on the lyrics** used for melody generation.
    *   Includes an expanded list of music genres.
*   **Audio Input & Analysis**:
    *   Upload audio files (e.g., song ideas, vocal snippets). If no audio is uploaded, a default silent placeholder is used for analysis. Audio input is optional.
    *   (Planned) Record audio directly using a microphone.
    *   Perform an experimental AI-powered scan for potential lyrical or obvious thematic overlaps with existing works based on the audio (and any globally available lyrics, if applicable). (Note: This is a preliminary check with limitations).
*   **Integrated AI Copilot Hints**: Contextual tips and instructions for various features are available via "Info" icons and tooltips directly within each relevant component/section.
*   **Music Video Asset Management**:
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
    *   The left panel contains all song creation tools (including emotion selection, direct lyrics input/editing, melody parameters), audio input, and export/share controls, organized into a single vertically scrollable view with sections. Integrated AI Copilot hints (info icons) provide guidance within each section.
    *   The right panel displays generated lyrics, melody information (including singing instructions and lyric feedback), and music video asset controls.

## Tech Stack

*   Next.js (App Router, Server Components, Server Actions)
*   TypeScript
*   Tailwind CSS
*   ShadCN UI Components
*   Genkit (for AI flow integration, using Google AI models like Gemini)
*   Lucide Icons & ShadCN Tooltips (for integrated AI Copilot hints)

## Current MVPs (Minimum Viable Products)

*   Unified generation of song lyrics (from AI or manual input) and melody data (MusicXML format, description with singing instructions, and lyric feedback) based on user input (theme, keywords, selected emotion including "Mixed Emotion", genre, key, tempo) with expanded genre options.
*   Integrated lyrics editing within the main song crafting component.
*   UI for audio file upload (optional, with default silent placeholder if none provided) and an experimental AI flow for basic plagiarism concern flagging.
*   Integrated AI Copilot hints via tooltips within each major feature component.
*   A responsive split-screen user interface with a vertically scrollable left panel for controls and a right panel for viewing generated content.
*   UI for uploading image/video assets for future music video generation.
*   Placeholders for export, social sharing, and full music video generation features.

## Known Issues & Future Enhancements

*   **Full Audio Recording & Processing**: Implementing robust microphone recording, audio editing, and potential speech-to-text for the "Audio Input" section.
*   **Advanced Plagiarism Detection**: The current plagiarism scan is very basic. A more sophisticated system would require advanced audio analysis and a comprehensive database.
*   **Melody Playback & Visualization**: Currently, melodies are generated as data (MusicXML) but not played back or visualized in detail. This is a key future enhancement.
*   **Music Video Generation**: The music video generation feature itself is a placeholder and requires significant development beyond asset uploading.
*   **Dynamic/Elaborate AI Copilot**: Expanding the integrated Copilot hints, perhaps with more interactive elements or AI-generated dynamic tips, rather than static tooltips.
*   **User Accounts & Work History**: Implementing user authentication (signup/login) and database functionality to save, load, and manage user projects and work history.
*   **Tiered Plans & Subscriptions**: Adding different subscription levels with varied features.
*   **Full Export Functionality**: Implementing actual file export in various audio formats.
*   **Social Media Integration**: Direct API integration for seamless sharing on social platforms.
*   **Audio-Reactive Visualizations**: Implementing subtle audio-reactive visuals to enhance user engagement.
*   **Custom Iconography**: While `lucide-react` is used, implementing custom-designed icons for musical elements could further enhance the UI.
*   **Dark Mode Theme**: The current focus is on the light theme; a polished dark mode could be added.

This project is built with Firebase Studio and aims to provide a foundation for a powerful AI-assisted music creation tool.
