import { config } from 'dotenv';
config();

import './flows/generate-song-lyrics.ts';
import './flows/generate-melody.ts';
import './backend/apiClient';
