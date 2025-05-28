
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-song-lyrics.ts';
import '@/ai/flows/generate-melody.ts';
// import '@/ai/flows/suggest-song-completions.ts'; // Removed as it's no longer used
import '@/ai/flows/analyze-emotion.ts';
// import '@/ai/flows/check-audio-plagiarism.ts'; // Removed as this feature is now a future plan
