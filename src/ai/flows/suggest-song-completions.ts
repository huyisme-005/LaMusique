// src/ai/flows/suggest-song-completions.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting song completions.
 *
 * - suggestSongCompletions - A function that takes initial lyrics and suggests ways to complete the song.
 * - SuggestSongCompletionsInput - The input type for the suggestSongCompletions function.
 * - SuggestSongCompletionsOutput - The return type for the suggestSongCompletions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSongCompletionsInputSchema = z.object({
  initialLyrics: z
    .string()
    .describe('The initial lyrics of the song for which to suggest completions.'),
  genre: z.string().describe('The genre of the song.'),
  artist: z.string().describe('The artist of the song.'),
});
export type SuggestSongCompletionsInput = z.infer<typeof SuggestSongCompletionsInputSchema>;

const SuggestSongCompletionsOutputSchema = z.object({
  suggestedCompletions: z
    .array(z.string())
    .describe('An array of suggested lyrics to complete the song.'),
  reasoning: z.string().describe('Explanation of completion suggestions.'),
});
export type SuggestSongCompletionsOutput = z.infer<typeof SuggestSongCompletionsOutputSchema>;

export async function suggestSongCompletions(
  input: SuggestSongCompletionsInput
): Promise<SuggestSongCompletionsOutput> {
  return suggestSongCompletionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSongCompletionsPrompt',
  input: {schema: SuggestSongCompletionsInputSchema},
  output: {schema: SuggestSongCompletionsOutputSchema},
  prompt: `You are a professional songwriter who helps users complete their songs.

  Based on the initial lyrics, genre, and artist provided, suggest multiple possible ways to complete the song.
  Explain the reasoning behind your suggestions.

  Genre: {{{genre}}}
  Artist: {{{artist}}}
  Initial Lyrics:
  {{{
    initialLyrics
  }}}
  `,
});

const suggestSongCompletionsFlow = ai.defineFlow(
  {
    name: 'suggestSongCompletionsFlow',
    inputSchema: SuggestSongCompletionsInputSchema,
    outputSchema: SuggestSongCompletionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
