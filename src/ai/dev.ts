/**
 * @fileOverview Development entry point for Genkit flows.
 * This file imports and thereby registers all Genkit flows and necessary backend clients
 * for use during development, typically with the Genkit developer UI.
 * It also loads environment variables using dotenv.
 */
import { config } from 'dotenv';
config();

import './flows/generate-song-lyrics.ts';
import './flows/generate-melody.ts';
import './flows/analyze-audio-genre.ts'; // Added new flow
import './backend/apiClient';
