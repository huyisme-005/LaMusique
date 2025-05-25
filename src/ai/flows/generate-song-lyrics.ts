'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating song lyrics based on a theme and keywords.
 *
 * - generateSongLyrics - A function that takes a theme and keywords as input and generates song lyrics.
 * - GenerateSongLyricsInput - The input type for the generateSongLyrics function.
 * - GenerateSongLyricsOutput - The return type for the generateSongLyrics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSongLyricsInputSchema = z.object({
  theme: z.string().describe('The theme of the song.'),
  keywords: z.string().describe('Keywords to include in the lyrics.'),
});
export type GenerateSongLyricsInput = z.infer<typeof GenerateSongLyricsInputSchema>;

const GenerateSongLyricsOutputSchema = z.object({
  lyrics: z.string().describe('The generated song lyrics.'),
});
export type GenerateSongLyricsOutput = z.infer<typeof GenerateSongLyricsOutputSchema>;

export async function generateSongLyrics(input: GenerateSongLyricsInput): Promise<GenerateSongLyricsOutput> {
  return generateSongLyricsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSongLyricsPrompt',
  input: {schema: GenerateSongLyricsInputSchema},
  output: {schema: GenerateSongLyricsOutputSchema},
  prompt: `You are a songwriter. Generate song lyrics based on the following theme and keywords.

Theme: {{{theme}}}
Keywords: {{{keywords}}}

Lyrics:`,
});

const generateSongLyricsFlow = ai.defineFlow(
  {
    name: 'generateSongLyricsFlow',
    inputSchema: GenerateSongLyricsInputSchema,
    outputSchema: GenerateSongLyricsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
