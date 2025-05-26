
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription as FormDescUI, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // Renamed FormDescription to FormDescUI
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { generateSongLyrics, type GenerateSongLyricsInput } from '@/ai/flows/generate-song-lyrics';
import { generateMelody, type GenerateMelodyOutput, type GenerateMelodyInput } from '@/ai/flows/generate-melody';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Music, ScrollText, Info, Smile, Blend } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

const songCrafterSchema = z.object({
  theme: z.string().min(3, "Theme must be at least 3 characters long."),
  keywords: z.string().min(3, "Keywords must be at least 3 characters long."),
  genre: z.string().min(1, "Genre is required."),
  emotion: z.string().optional().describe("The desired emotion for the song."),
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
  const [selectedMixedEmotions, setSelectedMixedEmotions] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<SongCrafterFormValues>({
    resolver: zodResolver(songCrafterSchema),
    defaultValues: {
      theme: "",
      keywords: "",
      genre: "",
      emotion: "None",
      key: "C",
      tempo: 120,
    },
  });

  const watchedEmotion = form.watch("emotion");

  useEffect(() => {
    if (watchedEmotion !== "Mixed Emotion") {
      setSelectedMixedEmotions([]);
    }
  }, [watchedEmotion]);

  const handleMixedEmotionChange = (emotionValue: string) => {
    setSelectedMixedEmotions(prev => {
      const isAlreadySelected = prev.includes(emotionValue);
      if (isAlreadySelected) {
        return prev.filter(e => e !== emotionValue);
      } else {
        if (prev.length < 3) {
          return [...prev, emotionValue];
        }
        toast({ 
          title: "Maximum 3 Emotions", 
          description: "You can select up to 3 emotions for a mix.", 
          variant: "default",
          duration: 3000, 
        });
        return prev;
      }
    });
  };

  const onSubmit: SubmitHandler<SongCrafterFormValues> = async (data) => {
    setIsLoading(true);
    let generatedLyrics = "";
    try {
      let emotionInputForLyrics: string | undefined;
      if (data.emotion === "None") {
        emotionInputForLyrics = undefined;
      } else if (data.emotion === "Mixed Emotion") {
        if (selectedMixedEmotions.length > 0) {
          emotionInputForLyrics = selectedMixedEmotions.join(', ');
        } else {
          // If "Mixed Emotion" is selected but no sub-emotions are picked, treat as "None" or a default.
          // For now, let's treat it as if no specific emotion guidance is given.
          emotionInputForLyrics = undefined; 
          toast({
            title: "Mixed Emotions Not Specified",
            description: "You selected 'Mixed Emotion' but didn't choose any specific emotions. Proceeding without specific emotional guidance for lyrics.",
            variant: "default",
            duration: 4000,
          });
        }
      } else {
        emotionInputForLyrics = data.emotion;
      }

      const lyricsInput: GenerateSongLyricsInput = { 
        theme: data.theme, 
        keywords: data.keywords,
        emotion: emotionInputForLyrics
      };
      const lyricsResult = await generateSongLyrics(lyricsInput);
      generatedLyrics = lyricsResult.lyrics;
      onLyricsGenerated(generatedLyrics);
      toast({
        title: "Lyrics Generated!",
        description: "Your song lyrics have been successfully crafted.",
      });

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
          description: "A melody has been generated, including singing instructions in its description.",
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

  const mixedEmotionOptions = songEmotions.filter(e => e !== "None" && e !== "Mixed Emotion");

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
                <p className="text-sm">Enter song parameters to generate lyrics and melody. You can select an emotion (or mix up to 3) to influence the lyrical content. Melody output includes singing instructions.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Craft your song's foundation. Melody output will include singing instructions.</CardDescription>
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
                          <p className="text-xs">Select an emotion for lyrical guidance. Choose "Mixed Emotion" to select up to 3 specific emotions.</p>
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

            {watchedEmotion === "Mixed Emotion" && (
              <Card className="p-4 bg-muted/50">
                <Label className="flex items-center gap-1 mb-3 text-sm font-medium"><Blend className="text-primary inline-block h-4 w-4" /> Select up to 3 emotions to mix:</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {mixedEmotionOptions.map(emotionItem => (
                    <FormItem key={emotionItem} className="flex flex-row items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={selectedMixedEmotions.includes(emotionItem)}
                          onCheckedChange={() => handleMixedEmotionChange(emotionItem)}
                          disabled={selectedMixedEmotions.length >= 3 && !selectedMixedEmotions.includes(emotionItem)}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        {emotionItem}
                      </FormLabel>
                    </FormItem>
                  ))}
                </div>
                <FormDescUI className="text-xs text-muted-foreground mt-3">
                  Selected: {selectedMixedEmotions.join(', ') || "None"} (Max 3)
                </FormDescUI>
              </Card>
            )}

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
