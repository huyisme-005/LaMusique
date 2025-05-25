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

const GenerateMelodyInputSchema = z.object({
  lyrics: z.string().describe('The lyrics of the song.'),
  genre: z.string().describe('The genre of the song.'),
  key: z.string().describe('The key of the song.'),
  tempo: z.number().describe('The tempo of the song in BPM.'),
});
export type GenerateMelodyInput = z.infer<typeof GenerateMelodyInputSchema>;

const GenerateMelodyOutputSchema = z.object({
  melody: z.string().describe('The generated melody in a suitable format (e.g., MusicXML, MIDI data URI).'),
  description: z.string().describe('A description of the generated melody, including musical considerations.'),
});
export type GenerateMelodyOutput = z.infer<typeof GenerateMelodyOutputSchema>;

export async function generateMelody(input: GenerateMelodyInput): Promise<GenerateMelodyOutput> {
  return generateMelodyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMelodyPrompt',
  input: {schema: GenerateMelodyInputSchema},
  output: {schema: GenerateMelodyOutputSchema},
  prompt: `You are an AI music composer specializing in melody generation.

You will generate a fitting melody for the given lyrics, considering the specified genre, key, and tempo.

Lyrics: {{{lyrics}}}
Genre: {{{genre}}}
Key: {{{key}}}
Tempo: {{{tempo}}} BPM

Compose a melody that complements the lyrics and adheres to the musical characteristics of the specified genre, key, and tempo. Provide the melody in MusicXML format, and include a description of your musical considerations.

Melody (MusicXML):
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
    return output!;
  }
);
