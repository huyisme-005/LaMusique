import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Ensure GOOGLE_API_KEY (or GOOGLE_APPLICATION_CREDENTIALS for service accounts)
// is set in your deployment environment for Genkit to authenticate with Google AI services.
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
