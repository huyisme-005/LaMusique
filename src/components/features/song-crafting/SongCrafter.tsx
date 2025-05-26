
"use client";

import type { FC } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateSongLyrics, type GenerateSongLyricsInput } from '@/ai/flows/generate-song-lyrics';
import { generateMelody, type GenerateMelodyOutput, type GenerateMelodyInput } from '@/ai/flows/generate-melody';
// analyzeEmotion import removed
import { useToast } from "@/hooks/use-toast";
import { Loader2, Music, ScrollText, Info, Smile } from 'lucide-react'; // Brain icon removed
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
// Progress import removed

const songCrafterSchema = z.object({
  theme: z.string().min(3, "Theme must be at least 3 characters long."),
  keywords: z.string().min(3, "Keywords must be at least 3 characters long."),
  genre: z.string().min(1, "Genre is required."),
  emotion: z.string().optional().describe("The desired emotion for the song."), // Added emotion field
  key: z.string().min(1, "Key is required."),
  tempo: z.coerce.number().min(40, "Tempo must be at least 40 BPM.").max(220, "Tempo must be at most 220 BPM."),
});

type SongCrafterFormValues = z.infer<typeof songCrafterSchema>;

interface SongCrafterProps {
  currentLyrics: string;
  onLyricsGenerated: (lyrics: string) => void;
  onMelodyGenerated: (melody: GenerateMelodyOutput) => void;
}

const musicKeys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", 
                   "Am", "A#m", "Bm", "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m"];

const genres = [
  // Electronic
  "Electronic", "Techno", "House", "Trance", "Dubstep", "Drum and Bass", "Synthwave", "Ambient", "IDM", "Chillwave", "Hardstyle", "UK Garage", "Progressive House", "Minimal Techno",
  // Pop
  "Pop", "Indie Pop", "Synth-Pop", "Electropop", "Power Pop", "K-Pop", "J-Pop", "Art Pop", "Bubblegum Pop", "Dance Pop",
  // Rock
  "Rock", "Alternative Rock", "Indie Rock", "Hard Rock", "Punk Rock", "Metal (Heavy Metal, Death Metal, Black Metal, etc.)", "Progressive Rock", "Psychedelic Rock", "Grunge", "Post-Rock", "Shoegaze", "Classic Rock",
  // Hip Hop / Rap
  "Hip Hop", "Rap", "Trap", "Boom Bap", "Conscious Hip Hop", "Cloud Rap", "Drill", "Mumble Rap", "Alternative Hip Hop",
  // Jazz
  "Jazz", "Smooth Jazz", "Bebop", "Fusion", "Swing", "Cool Jazz", "Acid Jazz", "Modal Jazz",
  // Folk / Acoustic
  "Folk", "Acoustic", "Singer-Songwriter", "Folk Rock", "Indie Folk", "Traditional Folk", "Americana",
  // Classical
  "Classical", "Orchestral", "Chamber Music", "Opera", "Baroque", "Romantic", "Modern Classical",
  // Blues
  "Blues", "Electric Blues", "Delta Blues", "Chicago Blues", "Soul Blues",
  // R&B / Soul
  "R&B", "Soul", "Neo-Soul", "Contemporary R&B", "Funk", "Motown",
  // Country
  "Country", "Country Pop", "Bluegrass", "Outlaw Country", "Honky Tonk",
  // Reggae / Ska
  "Reggae", "Ska", "Dancehall", "Dub", "Rocksteady",
  // Latin
  "Latin", "Salsa", "Reggaeton", "Bossa Nova", "Cumbia", "Tango", "Mariachi",
  // World / Global
  "World Music", "Afrobeat", "Celtic", "Bollywood", "Flamenco", "Klezmer",
  // Other
  "Experimental", "Avant-Garde", "Noise", "Video Game Music", "Film Score", "Musical Theatre", "Spoken Word"
];

const songEmotions = [
  "None", "Joy", "Sadness", "Anger", "Fear", "Surprise", "Love", "Hope", 
  "Excitement", "Calmness", "Nostalgia", "Melancholy", "Bittersweet", "Reflective", "Energetic", "Mixed Emotion"
];


const SongCrafter: FC<SongCrafterProps> = ({ currentLyrics, onLyricsGenerated, onMelodyGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Emotion analysis state and handler removed

  const form = useForm<SongCrafterFormValues>({
    resolver: zodResolver(songCrafterSchema),
    defaultValues: {
      theme: "",
      keywords: "",
      genre: "",
      emotion: "None", // Default emotion
      key: "C",
      tempo: 120,
    },
  });

  const onSubmit: SubmitHandler<SongCrafterFormValues> = async (data) => {
    setIsLoading(true);
    let generatedLyrics = "";
    try {
      // Step 1: Generate Lyrics
      const lyricsInput: GenerateSongLyricsInput = { 
        theme: data.theme, 
        keywords: data.keywords,
        emotion: data.emotion === "None" ? undefined : data.emotion // Pass emotion to lyrics generation
      };
      const lyricsResult = await generateSongLyrics(lyricsInput);
      generatedLyrics = lyricsResult.lyrics;
      onLyricsGenerated(generatedLyrics);
      toast({
        title: "Lyrics Generated!",
        description: "Your song lyrics have been successfully crafted.",
      });

      // Step 2: Generate Melody with the new lyrics
      if (generatedLyrics) {
        const melodyInput: GenerateMelodyInput = { 
          lyrics: generatedLyrics, 
          genre: data.genre, 
          key: data.key, 
          tempo: data.tempo 
        };
        const melodyResult = await generateMelody(melodyInput);
        onMelodyGenerated(melodyResult);
        toast({
          title: "Melody Composed!",
          description: "A melody has been generated for your lyrics.",
        });
      } else {
         toast({
          title: "Melody Generation Skipped",
          description: "Lyrics generation failed, so melody composition was skipped.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error in song crafting process:", error);
      const errorMessage = (error as Error).message || "Something went wrong.";
      if (generatedLyrics && !errorMessage.includes("melody")) { 
        toast({
          title: "Error Composing Melody",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (!generatedLyrics) { 
         toast({
          title: "Error Generating Lyrics",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
         toast({
          title: "Error in Song Crafting",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // handleEmotionAnalysis function removed

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Music className="text-primary" /> Lyrics & Melody</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">Enter song parameters to generate lyrics and melody. You can select an emotion to influence the lyrical content.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Craft your song's foundation by providing details below.</CardDescription>
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
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a genre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <ScrollArea className="h-[200px]">
                        {genres.sort().map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* New Emotion Select Field */}
            <FormField
              control={form.control}
              name="emotion"
              render={({ field }) => (
                <FormItem>
                   <div className="flex items-center justify-between">
                    <FormLabel className="flex items-center gap-1"><Smile className="text-primary inline-block h-4 w-4" /> Desired Emotion</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">Select an emotion to guide the lyrical content. "None" will not add specific emotional guidance.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select onValueChange={field.onChange} defaultValue={field.value || "None"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an emotion (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <ScrollArea className="h-[200px]">
                        {songEmotions.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a key" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <ScrollArea className="h-[200px]">
                        {musicKeys.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tempo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo (BPM)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 120" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-6" />

            {/* Emotion Analysis Section Removed */}
            
            <div className="space-y-1 pt-2">
              <Label htmlFor="generated-lyrics-display" className="flex items-center gap-1">
                <ScrollText size={16} /> Current Lyrics for Melody Generation
              </Label>
              <Textarea
                id="generated-lyrics-display"
                value={currentLyrics}
                readOnly
                placeholder="Generated lyrics will appear here after you click the 'Generate Lyrics & Melody' button..."
                className="min-h-[150px] bg-muted/50 text-sm"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="animate-spin" /> : "Generate Lyrics & Melody"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SongCrafter;

