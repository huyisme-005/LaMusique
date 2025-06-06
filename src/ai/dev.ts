import { config } from 'dotenv';
config();

import './flows/generate-song-lyrics.ts';
import './flows/generate-melody.ts';
import './flows/analyze-audio-genre.ts'; // Added new flow
import './backend/apiClient';
