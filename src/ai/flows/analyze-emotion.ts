
'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing emotion from text.
 *
 * - analyzeEmotion - A function that takes text input and returns the detected emotion, confidence, and explanation.
 * - AnalyzeEmotionInput - The input type for the analyzeEmotion function.
 * - AnalyzeEmotionOutput - The return type for the analyzeEmotion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeEmotionInputSchema = z.object({
  textToAnalyze: z.string().min(1, "Text to analyze cannot be empty.").describe('The text from which to analyze emotion.'),
});
export type AnalyzeEmotionInput = z.infer<typeof AnalyzeEmotionInputSchema>;

const AnalyzeEmotionOutputSchema = z.object({
  detectedEmotion: z.string().describe('The primary emotion detected in the text (e.g., Joy, Sadness, Anger, Fear, Surprise, Neutral).'),
  confidence: z.number().min(0).max(1).describe('The confidence score for the detected emotion (0.0 to 1.0).'),
  explanation: z.string().describe('A brief explanation of why this emotion was detected, referencing parts of the text if possible.'),
});
export type AnalyzeEmotionOutput = z.infer<typeof AnalyzeEmotionOutputSchema>;

export async function analyzeEmotion(input: AnalyzeEmotionInput): Promise<AnalyzeEmotionOutput> {
  return analyzeEmotionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeEmotionPrompt',
  input: {schema: AnalyzeEmotionInputSchema},
  output: {schema: AnalyzeEmotionOutputSchema},
  prompt: `You are an expert in sentiment and emotion analysis. Analyze the provided text and identify the primary emotion conveyed.
Return the detected emotion, a confidence score between 0.0 and 1.0, and a brief explanation for your analysis.
Possible emotions to consider: Joy, Sadness, Anger, Fear, Surprise, Disgust, Neutral. If multiple emotions are present, identify the most dominant one.

Text to Analyze:
{{{textToAnalyze}}}
`,
});

const analyzeEmotionFlow = ai.defineFlow(
  {
    name: 'analyzeEmotionFlow',
    inputSchema: AnalyzeEmotionInputSchema,
    outputSchema: AnalyzeEmotionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to get a response from the AI for emotion analysis.');
    }
    return output;
  }
);
