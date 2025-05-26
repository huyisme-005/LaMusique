
"use client";

import type { FC }from 'react';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { generateSongLyrics, type GenerateSongLyricsInput } from '@/ai/flows/generate-song-lyrics';
import { useToast } from "@/hooks/use-toast";
import { Loader2, ScrollText, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const lyricsSchema = z.object({
  theme: z.string().min(3, "Theme must be at least 3 characters long."),
  keywords: z.string().min(3, "Keywords must be at least 3 characters long."),
});

type LyricsFormValues = z.infer<typeof lyricsSchema>;

interface LyricsGeneratorProps {
  onLyricsGenerated: (lyrics: string) => void;
  currentLyrics: string;
}

const LyricsGenerator: FC<LyricsGeneratorProps> = ({ onLyricsGenerated, currentLyrics }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LyricsFormValues>({
    resolver: zodResolver(lyricsSchema),
    defaultValues: {
      theme: "",
      keywords: "",
    },
  });

  const onSubmit: SubmitHandler<LyricsFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const result = await generateSongLyrics(data);
      onLyricsGenerated(result.lyrics);
      toast({
        title: "Lyrics Generated!",
        description: "Your song lyrics have been successfully crafted.",
      });
    } catch (error) {
      console.error("Error generating lyrics:", error);
      toast({
        title: "Error Generating Lyrics",
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><ScrollText className="text-primary" /> Generate Lyrics</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">Enter a theme (e.g., 'lost love') and some keywords (e.g., 'rain, city, memories') to generate song lyrics. The result will appear below and in the main display.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Describe your song's theme and keywords to generate lyrics.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Summer romance, Space adventure" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Beach, stars, journey, hope" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="space-y-1">
              <Label htmlFor="generated-lyrics-display">Current Lyrics</Label>
              <Textarea
                id="generated-lyrics-display"
                value={currentLyrics}
                readOnly
                placeholder="Generated lyrics will appear here..."
                className="min-h-[150px] bg-muted/50"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="animate-spin" /> : "Generate Lyrics"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default LyricsGenerator;
