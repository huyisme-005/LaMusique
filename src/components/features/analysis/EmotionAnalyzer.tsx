
"use client";

import type { FC } from 'react';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { analyzeEmotion, type AnalyzeEmotionOutput, type AnalyzeEmotionInput } from '@/ai/flows/analyze-emotion';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Smile, Brain, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label'; // Added Label import

const emotionSchema = z.object({
  textToAnalyze: z.string().min(5, "Please enter at least 5 characters to analyze.").max(2000, "Text cannot exceed 2000 characters."),
});

type EmotionFormValues = z.infer<typeof emotionSchema>;

interface EmotionAnalyzerProps {}

const EmotionAnalyzer: FC<EmotionAnalyzerProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeEmotionOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<EmotionFormValues>({
    resolver: zodResolver(emotionSchema),
    defaultValues: {
      textToAnalyze: "",
    },
  });

  const onSubmit: SubmitHandler<EmotionFormValues> = async (data) => {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeEmotion(data);
      setAnalysisResult(result);
      toast({
        title: "Emotion Analysis Complete!",
        description: "The AI has analyzed the emotion in your text.",
      });
    } catch (error) {
      console.error("Error analyzing emotion:", error);
      toast({
        title: "Error Analyzing Emotion",
        description: (error as Error).message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Smile className="text-primary" /> Emotion Analyzer</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">Paste text (e.g., lyrics, a poem) to analyze its emotional tone. The AI will detect the primary emotion, confidence, and provide an explanation.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>Enter text below to analyze its emotional content. Voice input coming soon!</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="textToAnalyze"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text for Emotion Analysis</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Type or paste your text here... (e.g., 'I'm so excited about this new song!' or 'This melody feels a bit melancholic.')" 
                        {...field} 
                        className="min-h-[120px] focus:ring-accent focus:border-accent" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="animate-spin" /> : <><Brain className="mr-2" /> Analyze Emotion</>}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Detected Emotion:</Label>
              <p className="text-2xl font-semibold text-primary">{analysisResult.detectedEmotion}</p>
            </div>
            <div>
              <Label>Confidence Score:</Label>
              <div className="flex items-center gap-2">
                <Progress value={analysisResult.confidence * 100} className="w-[80%]" />
                <span className="text-sm text-muted-foreground">{(analysisResult.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div>
              <Label>Explanation:</Label>
              <p className="text-sm text-muted-foreground italic whitespace-pre-wrap">{analysisResult.explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmotionAnalyzer;
