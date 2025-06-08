/**
 * Analyzes the musical genre(s) of a given audio sample.
 *
 * This module defines a Genkit flow for identifying the primary musical genres present in an audio clip.
 * It provides input and output schemas for type safety and validation, and leverages an AI prompt to perform the analysis.
 *
 * @module analyze-audio-genre
 *
 * @typedef {object} AnalyzeAudioGenreInput
 * @property {string} audioDataUri - The audio data to analyze, as a data URI including a MIME type and Base64 encoding.
 *
 * @typedef {object} AnalyzeAudioGenreOutput
 * @property {string[]} genres - A list of identified musical genres for the audio (e.g., ["Pop", "Electronic", "Rock"]).
 * @property {number} [confidence] - An optional overall confidence score (0.0 to 1.0) for the genre identification.
 * @property {string} [reasoning] - An optional brief explanation of why these genres were identified.
 *
 * @function analyzeAudioGenre
 * @description Analyzes the provided audio data and returns the most prominent musical genres, with optional confidence and reasoning.
 * @param {AnalyzeAudioGenreInput} input - The input object containing the audio data URI.
 * @returns {Promise<AnalyzeAudioGenreOutput>} The identified genres, optional confidence score, and reasoning.
 *
 * @throws {Error} If the provided audio data URI is missing or too short to be meaningful.
 * @throws {Error} If the AI fails to analyze the audio genre.
 */
'use server';
/**
 * @fileOverview A Genkit flow for analyzing musical genre from audio.
 *
 * - analyzeAudioGenre - A function that takes audio data and returns identified genre(s).
 * - AnalyzeAudioGenreInput - The input type for the analyzeAudioGenre function.
 * - AnalyzeAudioGenreOutput - The return type for the analyzeAudioGenre function.
 */

import {ai} from '@/ai/genkit';// Import the ai object from your Genkit setup
import {z} from 'genkit';// Import zod for schema validation

/**
 * Schema for the input to the audio genre analysis function.
 * This includes the audio data as a Base64-encoded data URI.
 */
const AnalyzeAudioGenreInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio data to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeAudioGenreInput = z.infer<typeof AnalyzeAudioGenreInputSchema>;

/**
 * Schema for the output of the audio genre analysis function.
 * This includes the identified genres, confidence score, and reasoning.
 */
const AnalyzeAudioGenreOutputSchema = z.object({
  genres: z.array(z.string()).min(1).describe('A list of identified musical genres for the audio (e.g., ["Pop", "Electronic", "Rock"]). Return the most prominent genres.'),
  confidence: z.number().min(0).max(1).optional().describe('An overall confidence score (0.0 to 1.0) for the genre identification, if determinable.'),
  reasoning: z.string().optional().describe('A brief explanation of why these genres were identified, highlighting specific musical elements if possible.')
});
export type AnalyzeAudioGenreOutput = z.infer<typeof AnalyzeAudioGenreOutputSchema>;

/**
 * 
 * @param input - The input for the audio genre analysis function, including the audio data URI.
 * @throws Will throw an error if the provided audio data URI is missing or too short to be meaningful.
 * @returns {Promise<AnalyzeAudioGenreOutput>} The identified genres, optional confidence score, and reasoning.
 * @description Analyzes the provided audio data and returns the most prominent musical genres, with optional confidence and reasoning.
 */
export async function analyzeAudioGenre(input: AnalyzeAudioGenreInput): Promise<AnalyzeAudioGenreOutput> {
  return analyzeAudioGenreFlow(input);
}

/**
 * Genkit prompt for analyzing musical genre from audio.
 * This prompt instructs the AI to listen to the provided audio and identify its primary musical genre(s).
 * It considers elements like instrumentation, rhythm, harmony, melody, and overall feel.
 */
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

/**
 * Genkit flow for analyzing musical genre from audio.
 */
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
