
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
  description: z.string().describe('A description of the generated melody, including musical considerations and instructions on how to sing the main vocal line.'),
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

Compose a melody that complements the lyrics and adheres to the musical characteristics of the specified genre, key, and tempo. Provide the melody in MusicXML format.

Crucially, in your description, include detailed, step-by-step instructions on how to manually sing the main vocal line based on the generated melody. Describe pitches (e.g., C4, G#5), rhythms (e.g., quarter note, half note, dotted rhythm), and any expressive details (e.g., crescendo, staccato, legato) in a way a singer can understand and follow for key phrases or the beginning of the song. For example: "The first line 'The sun shines bright' starts with 'The' on C4 as a quarter note, 'sun' steps up to E4 as a half note, 'shines' holds E4 for another beat, and 'bright' resolves down to D4 as a whole note with a slight crescendo."

Melody (MusicXML):
Description (including singing instructions):
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

