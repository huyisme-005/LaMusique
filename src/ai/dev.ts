import { config } from 'dotenv';
config();

import '@/ai/flows/generate-song-lyrics.ts';
import '@/ai/flows/generate-melody.ts';
import '@/ai/flows/suggest-song-completions.ts';