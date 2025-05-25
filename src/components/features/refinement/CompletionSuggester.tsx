
"use client";

import type { FC } from 'react';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { suggestSongCompletions, type SuggestSongCompletionsOutput } from '@/ai/flows/suggest-song-completions';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Lightbulb } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const completionSchema = z.object({
  initialLyrics: z.string().min(10, "Initial lyrics must be at least 10 characters long."),
  genre: z.string().min(1, "Genre is required."),
  artist: z.string().min(1, "Artist style is required."),
});

type CompletionFormValues = z.infer<typeof completionSchema>;

interface CompletionSuggesterProps {
  currentLyrics: string;
  onSuggestionSelected: (suggestion: string) => void;
}

const CompletionSuggester: FC<CompletionSuggesterProps> = ({ currentLyrics, onSuggestionSelected }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestSongCompletionsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<CompletionFormValues>({
    resolver: zodResolver(completionSchema),
    defaultValues: {
      initialLyrics: currentLyrics || "",
      genre: "",
      artist: "",
    },
    values: { // Keep form in sync with currentLyrics prop
      initialLyrics: currentLyrics,
      genre: form.getValues("genre"),
      artist: form.getValues("artist"),
    }
  });

  const onSubmit: SubmitHandler<CompletionFormValues> = async (data) => {
    setIsLoading(true);
    setSuggestions(null);
    try {
      const result = await suggestSongCompletions(data);
      setSuggestions(result);
      toast({
        title: "Suggestions Ready!",
        description: "AI has provided some completion ideas.",
      });
    } catch (error) {
      console.error("Error suggesting completions:", error);
      toast({
        title: "Error Getting Suggestions",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Wand2 className="text-primary" /> Song Completion AI</CardTitle>
        <CardDescription>Get AI-powered suggestions to complete your song based on existing lyrics, genre, and artist style.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="initialLyrics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Lyrics</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter your current lyrics here..." {...field} className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Indie Pop, Synthwave" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="artist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artist Style (Inspiration)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Taylor Swift, Daft Punk" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="animate-spin" /> : "Get Suggestions"}
            </Button>
          </CardFooter>
        </form>
      </Form>

      {suggestions && (
        <CardContent className="mt-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Lightbulb className="text-accent" /> AI Suggestions</h3>
          {suggestions.reasoning && (
            <p className="text-sm text-muted-foreground mb-3 italic">AI Reasoning: {suggestions.reasoning}</p>
          )}
          <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-muted/30">
            <div className="space-y-3">
              {suggestions.suggestedCompletions.map((suggestion, index) => (
                <div key={index}>
                  <p className="text-sm whitespace-pre-line">{suggestion}</p>
                  <Button variant="link" size="sm" onClick={() => onSuggestionSelected(suggestion)} className="text-primary p-0 h-auto">
                    Use this suggestion
                  </Button>
                  {index < suggestions.suggestedCompletions.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
};

export default CompletionSuggester;
