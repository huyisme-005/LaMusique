
'use server';

/**
 * @fileOverview This file defines a Genkit flow for a preliminary check of potential plagiarism in audio content.
 *
 * - checkAudioPlagiarism - A function that takes audio data (and optional lyrics) and returns potential concerns.
 * - CheckAudioPlagiarismInput - The input type for the checkAudioPlagiarism function.
 * - CheckAudioPlagiarismOutput - The return type for the checkAudioPlagiarism function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckAudioPlagiarismInputSchema = z.object({
  audioDataUri: z.string().describe("Audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  lyrics: z.string().optional().describe('Optional lyrics associated with the audio to check for lyrical similarity.'),
});
export type CheckAudioPlagiarismInput = z.infer<typeof CheckAudioPlagiarismInputSchema>;

const CheckAudioPlagiarismOutputSchema = z.object({
  potentialConcerns: z.string().describe("A summary of potential plagiarism concerns, if any, based on the provided information. This will also highlight the limitations of the analysis."),
  isHighConcern: z.boolean().describe("Indicates if there is a high level of potential concern based on the limited analysis. True if significant similarities are found, false otherwise."),
});
export type CheckAudioPlagiarismOutput = z.infer<typeof CheckAudioPlagiarismOutputSchema>;

export async function checkAudioPlagiarism(input: CheckAudioPlagiarismInput): Promise<CheckAudioPlagiarismOutput> {
  return checkAudioPlagiarismFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkAudioPlagiarismPrompt',
  input: {schema: CheckAudioPlagiarismInputSchema},
  output: {schema: CheckAudioPlagiarismOutputSchema},
  prompt: `You are an AI assistant performing a *preliminary and limited* scan for potential plagiarism in audio content.
IMPORTANT LIMITATIONS:
- You CANNOT perform detailed musicological analysis (e.g., comparing melodies, harmonies, rhythm intricacies) from raw audio data.
- Your analysis of the audio itself ({{media url=audioDataUri}}) will be based on any discernible spoken words, vocalizations, or described musical ideas if present and interpretable. You cannot "listen" to it like a human.
- If lyrics are provided, focus primarily on checking for direct similarities or strong thematic overlaps with well-known existing songs.
- This is NOT a definitive copyright infringement assessment.

Task:
Analyze the provided audio (and lyrics, if available) for any *obvious* lyrical or thematic similarities to known songs or musical works.

Audio Data: {{media url=audioDataUri}}

{{#if lyrics}}
Provided Lyrics to check:
{{{lyrics}}}
---
Focus your lyrical analysis on direct phrase matches, very similar concepts to famous songs, or distinctive lyrical patterns that are widely recognizable.
{{else}}
---
No explicit lyrics provided. If the audio contains discernible speech or singing, briefly comment on any phrases or themes that seem highly familiar from existing popular songs. If it's instrumental or non-vocal, state that lyrical analysis is not possible without text.
{{/if}}

Output:
1.  'potentialConcerns': Provide a concise summary. If lyrics were checked, mention findings. If no lyrics, comment on audio if possible, or state limitations. Always reiterate the limitations of this scan.
2.  'isHighConcern': Set to true if you find strong, direct lyrical matches to known works or highly distinctive thematic overlaps that warrant further investigation. Otherwise, set to false.

Example of low concern output if only abstract audio provided: "The provided audio could not be analyzed for specific melodic or lyrical plagiarism due to tool limitations. No explicit lyrics were provided for comparison. This scan is inconclusive for detailed plagiarism assessment." (isHighConcern: false)
Example of high concern if obvious lyrics provided: "The provided lyrics 'Yesterday, all my troubles seemed so far away' are identical to the opening line of 'Yesterday' by The Beatles. This is a high concern for lyrical plagiarism. Limitations of audio analysis still apply." (isHighConcern: true)
`,
});

const checkAudioPlagiarismFlow = ai.defineFlow(
  {
    name: 'checkAudioPlagiarismFlow',
    inputSchema: CheckAudioPlagiarismInputSchema,
    outputSchema: CheckAudioPlagiarismOutputSchema,
  },
  async input => {
    // Gemini 2.0 Flash Exp is needed for multimodal
    const specificModel = ai.getModel('googleai/gemini-2.0-flash-exp');
    if (!specificModel) {
        throw new Error("Required model 'googleai/gemini-2.0-flash-exp' not available.");
    }
    const {output} = await prompt.withModel(specificModel)(input);
    
    if (!output) {
      return {
        potentialConcerns: "The AI model did not return a response for the plagiarism check. This could be due to input content or a temporary issue. Please try again, ensuring the audio is valid and lyrics (if any) are appropriate.",
        isHighConcern: false, // Default to false if no output
      };
    }
    return output;
  }
);
