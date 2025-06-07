
'use server';

/**
 * @fileOverview A melody generation AI agent.
 *
 * - generateMelody - A function that handles the melody generation process.
 * - GenerateMelodyInput - The input type for the generateMelody function.
 * - GenerateMelodyOutput - The return type for the generateMelody function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { saveSong } from '../backend/apiClient';

const GenerateMelodyInputSchema = z.object({
  lyrics: z.string().describe('The lyrics of the song.'),
  genre: z.string().describe('The genre of the song.'),
  key: z.string().describe('The key of the song.'),
  tempo: z.number().describe('The tempo of the song in BPM.'),
});
export type GenerateMelodyInput = z.infer<typeof GenerateMelodyInputSchema>;

const GenerateMelodyOutputSchema = z.object({
  melody: z.string().describe('The generated melody in a suitable format (e.g., MusicXML, MIDI data URI).'),
  description: z.string().describe('A description of the generated melody, including musical considerations and instructions on how to sing the main vocal line.'),
  lyricFeedback: z.string().describe("Constructive feedback and suggestions for improving the provided lyrics, considering the song's genre, key, tempo, and emotional intent (if inferable). This may include line-by-line comments or general observations on theme, rhyme, rhythm, and imagery."),
});
export type GenerateMelodyOutput = z.infer<typeof GenerateMelodyOutputSchema>;

export async function generateMelody(input: GenerateMelodyInput): Promise<GenerateMelodyOutput> {
  const result = await generateMelodyFlow(input);

  // Attempt to save the generated song to the backend only if BACKEND_API_URL is configured
  if (process.env.BACKEND_API_URL) {
    try {
      console.log(`Attempting to save song to backend at ${process.env.BACKEND_API_URL}`);
      // You might want to pass a more dynamic title, perhaps from user input or derived from lyrics
      const songTitle = `Song for lyrics: "${input.lyrics.substring(0, 30)}..."`;
      
      await saveSong({
        title: songTitle,
        lyrics: input.lyrics,
        genre: input.genre,
        key: input.key,
        tempo: input.tempo,
        melody: result.melody,
        description: result.description,
        lyric_feedback: result.lyricFeedback,
      });
      console.log('Song successfully saved to backend.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`WARN: Could not save song to backend. Melody generation was successful, but saving failed. 
        Error: ${errorMessage}. 
        Please ensure your backend server (Python/FastAPI) is running at the configured BACKEND_API_URL (${process.env.BACKEND_API_URL || 'default http://localhost:8000'}) and is accessible.
        If you haven't configured BACKEND_API_URL, it defaults to http://localhost:8000.
        Check the README for instructions on running the backend services (FastAPI, PostgreSQL).`);
      // The flow continues and returns the melody result even if saving fails.
    }
  } else {
    console.log('BACKEND_API_URL environment variable is not set. Skipping save song to backend. Generated melody will not be persisted to the database.');
  }
  return result;
}

const prompt = ai.definePrompt({
  name: 'generateMelodyPrompt',
  input: {schema: GenerateMelodyInputSchema},
  output: {schema: GenerateMelodyOutputSchema},
  prompt: `You are an AI music composer and lyric analyst.

Task 1: Melody Generation
Compose a fitting melody for the given lyrics, considering the specified genre, key, and tempo.
Provide the melody in MusicXML format.
In your melody description, include detailed, step-by-step instructions on how to manually sing the main vocal line. Describe pitches (e.g., C4, G#5), rhythms (e.g., quarter note, half note, dotted rhythm), and any expressive details (e.g., crescendo, staccato, legato) for key phrases or the beginning of the song.

Task 2: Lyric Feedback
After composing the melody, provide constructive feedback on the submitted lyrics. Analyze them based on the provided genre, key, and tempo. If the lyrics imply a certain emotion, consider that as well.
Offer specific suggestions for improvement. This could include comments on:
- Word choice and imagery
- Rhyme scheme and rhythm
- Thematic consistency and development
- Clarity and impact
- How well the lyrics suit the specified genre and musical parameters.
If specific lines can be improved, point them out with suggestions.

Inputs:
Lyrics: {{{lyrics}}}
Genre: {{{genre}}}
Key: {{{key}}}
Tempo: {{{tempo}}} BPM

Output Format:
Melody (MusicXML):
[MusicXML content here]
Description (including singing instructions):
[Melody description and singing instructions here]
Lyric Feedback:
[Constructive feedback and suggestions for the lyrics here]
`,
});

const generateMelodyFlow = ai.defineFlow(
  {
    name: 'generateMelodyFlow',
    inputSchema: GenerateMelodyInputSchema,
    outputSchema: GenerateMelodyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a melody and provide lyric feedback.');
    }
    return output;
  }
);

