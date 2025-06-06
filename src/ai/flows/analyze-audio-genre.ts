'use server';
/**
 * @fileOverview A Genkit flow for analyzing musical genre from audio.
 *
 * - analyzeAudioGenre - A function that takes audio data and returns identified genre(s).
 * - AnalyzeAudioGenreInput - The input type for the analyzeAudioGenre function.
 * - AnalyzeAudioGenreOutput - The return type for the analyzeAudioGenre function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAudioGenreInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio data to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeAudioGenreInput = z.infer<typeof AnalyzeAudioGenreInputSchema>;

const AnalyzeAudioGenreOutputSchema = z.object({
  genres: z.array(z.string()).min(1).describe('A list of identified musical genres for the audio (e.g., ["Pop", "Electronic", "Rock"]). Return the most prominent genres.'),
  confidence: z.number().min(0).max(1).optional().describe('An overall confidence score (0.0 to 1.0) for the genre identification, if determinable.'),
  reasoning: z.string().optional().describe('A brief explanation of why these genres were identified, highlighting specific musical elements if possible.')
});
export type AnalyzeAudioGenreOutput = z.infer<typeof AnalyzeAudioGenreOutputSchema>;

export async function analyzeAudioGenre(input: AnalyzeAudioGenreInput): Promise<AnalyzeAudioGenreOutput> {
  return analyzeAudioGenreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeAudioGenrePrompt',
  input: {schema: AnalyzeAudioGenreInputSchema},
  output: {schema: AnalyzeAudioGenreOutputSchema},
  prompt: `You are an expert AI musicologist specializing in genre identification from audio.
Listen to the provided audio and identify its primary musical genre(s).
Consider elements like instrumentation, rhythm, harmony, melody, and overall feel.
List the 1 to 3 most prominent genres you detect. Optionally, provide a confidence score and a brief reasoning.

Audio for analysis: {{media url=audioDataUri}}
`,
});

const analyzeAudioGenreFlow = ai.defineFlow(
  {
    name: 'analyzeAudioGenreFlow',
    inputSchema: AnalyzeAudioGenreInputSchema,
    outputSchema: AnalyzeAudioGenreOutputSchema,
  },
  async input => {
    // Basic check for very short or placeholder-like data URI.
    // A more robust check might involve looking at the actual length of the base64 data.
    if (!input.audioDataUri || input.audioDataUri.length < 200) { // Adjusted length check
        throw new Error('Meaningful audio data URI is required for genre analysis. The provided data seems too short.');
    }
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to analyze the audio genre.');
    }
    return output;
  }
);
