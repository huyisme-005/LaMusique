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
  // Save the generated song to backend
  await saveSong({
    title: 'Untitled', // You may want to pass a title from UI
    lyrics: input.lyrics,
    genre: input.genre,
    key: input.key,
    tempo: input.tempo,
    melody: result.melody,
    description: result.description,
    lyric_feedback: result.lyricFeedback,
  });
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

