
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
import { Loader2, Music, ScrollText, Info, Smile, Blend, Edit3, ListChecks } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

const songCrafterSchema = z.object({
  theme: z.string().optional(), // This will store the combined theme string from UI selections
  keywords: z.string().optional(),
  genre: z.string().min(1, "Genre is required for melody generation."),
  emotion: z.string().optional().describe("The desired emotion for the song."),
  key: z.string().min(1, "Key is required for melody generation."),
  tempo: z.coerce.number().min(40, "Tempo must be at least 40 BPM.").max(220, "Tempo must be at most 220 BPM."),
});

type SongCrafterFormValues = z.infer<typeof songCrafterSchema>;

interface SongCrafterProps {
  currentLyrics: string;
  onLyricsGenerated: (lyrics: string) => void;
  onLyricsChange: (lyrics: string) => void;
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

const PREDEFINED_THEMES = [
  "Love & Romance", "Heartbreak & Loss", "Friendship & Connection",
  "Adventure & Journey", "Nature & Seasons", "City Life & Urban Dreams",
  "Sci-Fi & Fantasy", "Mystery & Suspense", "Historical Tales",
  "Social Commentary & Protest", "Personal Growth & Self-Discovery",
  "Celebration & Joy", "Nostalgia & Memories", "Dreams & Aspirations",
  "Party & Nightlife"
];

const SongCrafter: FC<SongCrafterProps> = ({ currentLyrics, onLyricsGenerated, onLyricsChange, onMelodyGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMixedEmotions, setSelectedMixedEmotions] = useState<string[]>([]);
  
  const [selectedPredefinedThemes, setSelectedPredefinedThemes] = useState<string[]>([]);
  const [customTheme, setCustomTheme] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<SongCrafterFormValues>({
    resolver: zodResolver(songCrafterSchema),
    defaultValues: {
      theme: "", // RHF theme will be updated by our custom logic
      keywords: "",
      genre: "",
      emotion: "None",
      key: "C",
      tempo: 120,
    },
  });

  const watchedEmotion = form.watch("emotion");
  const totalSelectedThemes = selectedPredefinedThemes.length + (customTheme.trim() ? 1 : 0);

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

  const handlePredefinedThemeChange = (theme: string, checked: boolean) => {
    setSelectedPredefinedThemes(prev => {
      if (checked) {
        if (prev.length + (customTheme.trim() ? 1 : 0) < 3) {
          return [...prev, theme];
        } else {
          toast({ title: "Max 3 themes", description: "You can select up to 3 themes in total.", duration: 3000 });
          return prev;
        }
      } else {
        return prev.filter(t => t !== theme);
      }
    });
  };

  const handleCustomThemeChange = (value: string) => {
    const prevHadCustomTheme = customTheme.trim() !== "";
    const newHasCustomTheme = value.trim() !== "";

    if (!prevHadCustomTheme && newHasCustomTheme) { // Adding a custom theme
      if (selectedPredefinedThemes.length >= 3) {
         toast({ title: "Max 3 themes", description: "Cannot add custom theme, 3 predefined themes already selected.", duration: 3000 });
         return; // Don't update customTheme state
      }
    }
    setCustomTheme(value);
  };
  
  useEffect(() => {
    const themesForRHF: string[] = [...selectedPredefinedThemes];
    if (customTheme.trim()) {
      themesForRHF.push(`Custom: ${customTheme.trim()}`);
    }
    form.setValue('theme', themesForRHF.join(', '));
  }, [selectedPredefinedThemes, customTheme, form]);


  const onSubmit: SubmitHandler<SongCrafterFormValues> = async (data) => {
    setIsLoading(true);
    let lyricsForMelody = currentLyrics;
    let newLyricsWereGenerated = false;

    const finalSelectedThemes: string[] = [...selectedPredefinedThemes];
    if (customTheme.trim() !== "") {
      finalSelectedThemes.push(`Custom: ${customTheme.trim()}`);
    }

    if (finalSelectedThemes.length > 3) {
      toast({
        title: "Theme Selection Error",
        description: "Please select a maximum of 3 themes in total.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    const themeStringForAI = finalSelectedThemes.join(', ');

    try {
      // Step 1: Generate lyrics from AI if themeStringForAI or keywords are provided
      if (themeStringForAI.trim() !== "" || (data.keywords && data.keywords.trim() !== "")) {
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
          theme: themeStringForAI, 
          keywords: data.keywords || "", // Use keywords from RHF data
          emotion: emotionInputForLyrics
        };
        const aiLyricsResult = await generateSongLyrics(lyricsInput);
        onLyricsGenerated(aiLyricsResult.lyrics);
        lyricsForMelody = aiLyricsResult.lyrics;
        newLyricsWereGenerated = true;
        toast({
          title: "Lyrics Generated!",
          description: "AI has crafted new lyrics based on your inputs. They are now in the lyrics area.",
        });
      } else if (!currentLyrics || currentLyrics.trim() === "") {
        toast({
          title: "Missing Lyrics Source",
          description: "Please provide Themes or Keywords to generate lyrics, or type/paste lyrics directly into the text area below.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

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
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error in song crafting process:", error);
      const errorMessage = (error as Error).message || "Something went wrong.";
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
  const displayedSelectedThemes = [...selectedPredefinedThemes];
  if (customTheme.trim()) {
    displayedSelectedThemes.push(`Custom: ${customTheme.trim()}`);
  }


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
                  <strong>To generate lyrics:</strong> Select/enter Themes, Keywords, and optionally Emotion, Key, Tempo, Genre. Then click the button.
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
            
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="flex items-center gap-1"><ListChecks className="text-primary inline-block h-4 w-4" /> Themes</FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="text-xs">Select up to 3 themes total (predefined or custom) to guide lyrical content. (Optional if typing lyrics manually)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
              </div>
              <FormDescUI>Select up to 3 themes. This will guide the AI if generating lyrics.</FormDescUI>
              <div className="space-y-2 pt-1">
                <ScrollArea className="max-h-32 w-full rounded-md border p-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {PREDEFINED_THEMES.map(theme => (
                      <FormItem key={theme} className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={selectedPredefinedThemes.includes(theme)}
                            onCheckedChange={(checked) => handlePredefinedThemeChange(theme, !!checked)}
                            disabled={!selectedPredefinedThemes.includes(theme) && totalSelectedThemes >= 3}
                          />
                        </FormControl>
                        <Label className="text-sm font-normal cursor-pointer" htmlFor={theme.replace(/\s/g, '-')}>{theme}</Label>
                      </FormItem>
                    ))}
                  </div>
                </ScrollArea>
                <div>
                  <Label htmlFor="customTheme" className="text-sm font-medium">Custom Theme</Label>
                  <Input
                    id="customTheme"
                    value={customTheme}
                    onChange={(e) => handleCustomThemeChange(e.target.value)}
                    placeholder="Type a custom theme (optional)"
                    disabled={customTheme.trim() === "" && selectedPredefinedThemes.length >= 3 && totalSelectedThemes >=3}
                    className="mt-1"
                  />
                </div>
                <FormDescUI className="text-xs text-muted-foreground">
                  Selected ({totalSelectedThemes}/3): {displayedSelectedThemes.join(', ') || "None"}
                </FormDescUI>
              </div>
            </FormItem>

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
                      <FormLabel className="text-sm font-normal cursor-pointer" htmlFor={emotionItem.replace(/\s/g, '-')}>
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
                If Themes & Keywords above are filled, AI will generate lyrics here. Otherwise, type your own.
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

