
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
import { Form, FormControl, FormDescription as FormDescUI, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { generateSongLyrics, type GenerateSongLyricsInput } from '@/ai/flows/generate-song-lyrics';
import { generateMelody, type GenerateMelodyOutput, type GenerateMelodyInput } from '@/ai/flows/generate-melody';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Music, ScrollText, Info, Smile, Blend, Edit3 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

const songCrafterSchema = z.object({
  theme: z.string().optional(), // Optional now, as lyrics can be manual
  keywords: z.string().optional(), // Optional now
  genre: z.string().min(1, "Genre is required for melody generation."),
  emotion: z.string().optional().describe("The desired emotion for the song."),
  key: z.string().min(1, "Key is required for melody generation."),
  tempo: z.coerce.number().min(40, "Tempo must be at least 40 BPM.").max(220, "Tempo must be at most 220 BPM."),
});

type SongCrafterFormValues = z.infer<typeof songCrafterSchema>;

interface SongCrafterProps {
  currentLyrics: string;
  onLyricsGenerated: (lyrics: string) => void; // Called when AI generates lyrics
  onLyricsChange: (lyrics: string) => void;    // Called when user edits lyrics in textarea
  onMelodyGenerated: (melody: GenerateMelodyOutput) => void;
}

const musicKeys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", 
                   "Am", "A#m", "Bm", "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m"];

const genres = [
  "Electronic", "Techno", "House", "Trance", "Dubstep", "Drum and Bass", "Synthwave", "Ambient", "IDM", "Chillwave", "Hardstyle", "UK Garage", "Progressive House", "Minimal Techno",
  "Pop", "Indie Pop", "Synth-Pop", "Electropop", "Power Pop", "K-Pop", "J-Pop", "Art Pop", "Bubblegum Pop", "Dance Pop",
  "Rock", "Alternative Rock", "Indie Rock", "Hard Rock", "Punk Rock", "Metal (Heavy Metal, Death Metal, Black Metal, etc.)", "Progressive Rock", "Psychedelic Rock", "Grunge", "Post-Rock", "Shoegaze", "Classic Rock",
  "Hip Hop", "Rap", "Trap", "Boom Bap", "Conscious Hip Hop", "Cloud Rap", "Drill", "Mumble Rap", "Alternative Hip Hop",
  "Jazz", "Smooth Jazz", "Bebop", "Fusion", "Swing", "Cool Jazz", "Acid Jazz", "Modal Jazz",
  "Folk", "Acoustic", "Singer-Songwriter", "Folk Rock", "Indie Folk", "Traditional Folk", "Americana",
  "Classical", "Orchestral", "Chamber Music", "Opera", "Baroque", "Romantic", "Modern Classical",
  "Blues", "Electric Blues", "Delta Blues", "Chicago Blues", "Soul Blues",
  "R&B", "Soul", "Neo-Soul", "Contemporary R&B", "Funk", "Motown",
  "Country", "Country Pop", "Bluegrass", "Outlaw Country", "Honky Tonk",
  "Reggae", "Ska", "Dancehall", "Dub", "Rocksteady",
  "Latin", "Salsa", "Reggaeton", "Bossa Nova", "Cumbia", "Tango", "Mariachi",
  "World Music", "Afrobeat", "Celtic", "Bollywood", "Flamenco", "Klezmer",
  "Experimental", "Avant-Garde", "Noise", "Video Game Music", "Film Score", "Musical Theatre", "Spoken Word"
];

const songEmotions = [
  "None", "Joy", "Sadness", "Anger", "Fear", "Surprise", "Love", "Hope", 
  "Excitement", "Calmness", "Nostalgia", "Melancholy", "Bittersweet", "Reflective", "Energetic", "Mixed Emotion"
];

const SongCrafter: FC<SongCrafterProps> = ({ currentLyrics, onLyricsGenerated, onLyricsChange, onMelodyGenerated }) => {
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
    let lyricsForMelody = currentLyrics; // Start with current lyrics from the textarea
    let newLyricsWereGenerated = false;

    try {
      // Step 1: Generate lyrics from AI if theme and keywords are provided
      if (data.theme && data.theme.trim() !== "" && data.keywords && data.keywords.trim() !== "") {
        let emotionInputForLyrics: string | undefined;
        if (data.emotion === "None") {
          emotionInputForLyrics = undefined;
        } else if (data.emotion === "Mixed Emotion") {
          if (selectedMixedEmotions.length > 0) {
            emotionInputForLyrics = selectedMixedEmotions.join(', ');
          } else {
            emotionInputForLyrics = undefined; 
          }
        } else {
          emotionInputForLyrics = data.emotion;
        }

        const lyricsInput: GenerateSongLyricsInput = { 
          theme: data.theme, 
          keywords: data.keywords,
          emotion: emotionInputForLyrics
        };
        const aiLyricsResult = await generateSongLyrics(lyricsInput);
        onLyricsGenerated(aiLyricsResult.lyrics); // Update state in page.tsx, which updates currentLyrics prop
        lyricsForMelody = aiLyricsResult.lyrics;  // Use these newly generated lyrics for melody
        newLyricsWereGenerated = true;
        toast({
          title: "Lyrics Generated!",
          description: "AI has crafted new lyrics based on your inputs. They are now in the lyrics area.",
        });
      } else if (!currentLyrics || currentLyrics.trim() === "") {
        // No theme/keywords provided, and the current lyrics textarea is empty
        toast({
          title: "Missing Lyrics Source",
          description: "Please provide a Theme & Keywords to generate lyrics, or type/paste lyrics directly into the text area below.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      // If theme/keywords were not provided, lyricsForMelody remains currentLyrics (from user input/editing or previous generation)

      // Step 2: Generate Melody using lyricsForMelody
      if (lyricsForMelody && lyricsForMelody.trim() !== "") {
        const melodyInput: GenerateMelodyInput = { 
          lyrics: lyricsForMelody, 
          genre: data.genre, 
          key: data.key, 
          tempo: data.tempo 
        };
        const melodyResult = await generateMelody(melodyInput);
        onMelodyGenerated(melodyResult);
        toast({
          title: "Melody Composed!",
          description: `A melody has been generated for the ${newLyricsWereGenerated ? "newly generated" : "provided/edited"} lyrics.`,
        });
      } else {
         toast({
          title: "Cannot Compose Melody",
          description: "No lyrics available to compose a melody. Please generate or type lyrics first.",
          variant: "default", // or destructive
        });
      }
    } catch (error) {
      console.error("Error in song crafting process:", error);
      const errorMessage = (error as Error).message || "Something went wrong.";
      // Distinguish error source if possible
      if (newLyricsWereGenerated && lyricsForMelody && errorMessage.toLowerCase().includes("melody")) {
        toast({ title: "Error Composing Melody", description: errorMessage, variant: "destructive" });
      } else if (errorMessage.toLowerCase().includes("lyrics")) {
        toast({ title: "Error Generating Lyrics", description: errorMessage, variant: "destructive" });
      } else {
        toast({ title: "Error in Song Crafting", description: errorMessage, variant: "destructive" });
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
              <TooltipContent side="top" className="max-w-lg">
                <p className="text-sm">
                  <strong>To generate lyrics:</strong> Fill in Theme, Keywords, and optionally Emotion, Key, Tempo, Genre. Then click the button.
                  <br />
                  <strong>To use your own lyrics:</strong> Type or paste them into the "Lyrics for Melody Generation / Manual Editing" area below. Ensure Genre, Key, and Tempo are set. Then click the button.
                  <br />
                  Melody output includes singing instructions.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Craft lyrics with AI or input manually. Then, compose a melody.
        </CardDescription>
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
                    <Input placeholder="e.g., Summer romance, Space adventure (Optional if typing lyrics manually)" {...field} />
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
                    <Input placeholder="e.g., Beach, stars, journey (Optional if typing lyrics manually)" {...field} />
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
                          <p className="text-xs">Select an emotion to guide lyrical content. Choose "Mixed Emotion" to select up to 3 specific emotions. (Optional if typing lyrics manually)</p>
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
                  <FormLabel>Tempo</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 120 BPM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-6" />
            
            <div className="space-y-1 pt-2">
              <Label htmlFor="lyrics-input-area" className="flex items-center gap-1">
                <Edit3 size={16} /> Lyrics for Melody Generation / Manual Editing
              </Label>
              <Textarea
                id="lyrics-input-area"
                value={currentLyrics}
                onChange={(e) => onLyricsChange(e.target.value)}
                placeholder="Type your lyrics here, or AI-generated lyrics will appear here. This content will be used for melody generation."
                className="min-h-[180px] focus:ring-accent focus:border-accent text-sm"
              />
               <FormDescUI className="text-xs text-muted-foreground">
                If Theme & Keywords above are filled, AI will generate lyrics here. Otherwise, type your own.
              </FormDescUI>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="animate-spin" /> : "Generate Lyrics & Compose Melody"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SongCrafter;
