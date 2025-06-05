
"use client";

import React, { useState, useEffect, useCallback } from 'react'; // Ensure React and hooks are imported
import type { FC } from 'react';
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
import { Loader2, Music, ScrollText, Smile, Blend, Edit3, ListChecks, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const songCrafterSchema = z.object({
  theme: z.string().optional(),
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

const INITIAL_THEMES_TO_SHOW = 6;

const getAIErrorMessage = (error: unknown, context: 'lyrics' | 'melody' | 'emotion' | 'crafting'): string => {
  let baseMessage = "An unexpected error occurred with the AI service.";
  if (context === 'lyrics') baseMessage = "Lyrics generation failed.";
  else if (context === 'melody') baseMessage = "Melody composition failed.";
  else if (context === 'emotion') baseMessage = "Emotion analysis failed.";
  else if (context === 'crafting') baseMessage = "AI song crafting failed.";

  let detailMessage = "";
  if (error instanceof Error && typeof error.message === 'string') {
    detailMessage = error.message;
  } else if (typeof error === 'string') {
    detailMessage = error;
  } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
    detailMessage = (error as { message: string }).message;
  } else {
    console.warn("getAIErrorMessage received an error of unknown structure:", error);
  }

  const detailMessageLower = detailMessage.toLowerCase();

  if (detailMessageLower.includes("503") || detailMessageLower.includes("model is overloaded") || detailMessageLower.includes("service unavailable")) {
    return `${baseMessage} The AI model is currently busy or unavailable. Please try again in a few moments.`;
  }
  if (detailMessageLower.includes("api key") && (detailMessageLower.includes("invalid") || detailMessageLower.includes("not valid") || detailMessageLower.includes("denied"))) {
    return `${baseMessage} There's an issue with the AI service API key (it might be invalid, missing, or lack necessary permissions). Please check your GOOGLE_API_KEY environment variable and Google Cloud project settings.`;
  }
  if (detailMessageLower.includes("billing") || detailMessageLower.includes("quota")) {
    return `${baseMessage} The request could not be processed due to AI service limits (e.g., billing or quota). Please check your Google Cloud project account or contact support.`;
  }
  // Check for errors thrown by the flows themselves
  if (detailMessageLower.startsWith("the ai failed to generate song lyrics") || 
      detailMessageLower.startsWith("the ai failed to generate a melody") ||
      detailMessageLower.startsWith("failed to get a response from the ai for emotion analysis")) {
      return detailMessage + " Please check your inputs or try again.";
  }
  
  if (detailMessage) {
    const conciseDetail = detailMessage.length > 150 ? detailMessage.substring(0, 147) + "..." : detailMessage;
    return `${baseMessage} Details: ${conciseDetail}`;
  }

  return `${baseMessage} An unexpected error occurred. Please check the console for more details or try again.`;
};


const SongCrafter: FC<SongCrafterProps> = ({ currentLyrics, onLyricsGenerated, onLyricsChange, onMelodyGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMixedEmotions, setSelectedMixedEmotions] = useState<string[]>([]);
  
  const [selectedPredefinedThemes, setSelectedPredefinedThemes] = useState<string[]>([]);
  const [customTheme, setCustomTheme] = useState<string>("");
  const [showAllThemes, setShowAllThemes] = useState(false);
  const [lyricsManuallyEdited, setLyricsManuallyEdited] = useState(false);
  const [lyricsWereAIDrivenThisSession, setLyricsWereAIDrivenThisSession] = useState(false);
  const { toast } = useToast();

  const themesScrollAreaViewportRef = React.useRef<HTMLDivElement>(null);

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
  const totalSelectedThemes = selectedPredefinedThemes.length + (customTheme.trim() ? 1 : 0);

  useEffect(() => {
    if (watchedEmotion !== "Mixed Emotion") {
      setSelectedMixedEmotions([]);
    }
  }, [watchedEmotion]);

  useEffect(() => {
    if (showAllThemes && themesScrollAreaViewportRef.current) {
      setTimeout(() => {
        if (themesScrollAreaViewportRef.current) {
          themesScrollAreaViewportRef.current.scrollTop = themesScrollAreaViewportRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [showAllThemes]);


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

    if (!prevHadCustomTheme && newHasCustomTheme) { 
      if (selectedPredefinedThemes.length >= 3) {
         toast({ title: "Max 3 themes", description: "Cannot add custom theme, 3 predefined themes already selected.", duration: 3000 });
         return; 
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

  const handleLyricsTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onLyricsChange(e.target.value);
    setLyricsManuallyEdited(true);
  };

  const executeMelodyGeneration = async (lyricsForMelody: string, genre: string, key: string, tempo: number) => {
    if (lyricsForMelody && lyricsForMelody.trim() !== "") {
      const melodyInput: GenerateMelodyInput = { 
        lyrics: lyricsForMelody, 
        genre: genre, 
        key: key, 
        tempo: tempo 
      };
      const melodyResult = await generateMelody(melodyInput);
      onMelodyGenerated(melodyResult);
      toast({
        title: "Melody Composed!",
        description: `A melody has been generated.`,
      });
    } else {
       toast({
        title: "Cannot Compose Melody",
        description: "No lyrics available to compose a melody. Please generate or type lyrics first.",
        variant: "default",
      });
    }
  };
  
  const handleGenerateOrRegenerateAction = async () => {
    setIsLoading(true);
    const isValid = await form.trigger(); 
    if (!isValid) {
      toast({ title: "Validation Error", description: "Please check your inputs.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    const data = form.getValues();
    let lyricsForMelody = currentLyrics;

    const finalSelectedThemes: string[] = [...selectedPredefinedThemes];
    if (customTheme.trim() !== "") {
      finalSelectedThemes.push(customTheme.trim()); 
    }
    
    if (finalSelectedThemes.length > 3) {
      toast({ title: "Theme Selection Error", description: "Please select a maximum of 3 themes in total.", variant: "destructive"});
      setIsLoading(false);
      return;
    }
    const themeStringForAI = finalSelectedThemes.join(', ');

    try {
      if (themeStringForAI.trim() !== "" || (data.keywords && data.keywords.trim() !== "")) {
        let emotionInputForLyrics: string | undefined;
        if (data.emotion === "None") {
          emotionInputForLyrics = undefined;
        } else if (data.emotion === "Mixed Emotion") {
          emotionInputForLyrics = selectedMixedEmotions.length > 0 ? selectedMixedEmotions.join(', ') : undefined;
        } else {
          emotionInputForLyrics = data.emotion;
        }

        const lyricsInput: GenerateSongLyricsInput = { 
          theme: themeStringForAI, 
          keywords: data.keywords || "", 
          emotion: emotionInputForLyrics
        };
        const aiLyricsResult = await generateSongLyrics(lyricsInput);
        onLyricsGenerated(aiLyricsResult.lyrics);
        lyricsForMelody = aiLyricsResult.lyrics;
        setLyricsManuallyEdited(false); 
        setLyricsWereAIDrivenThisSession(true);
        toast({
          title: "Lyrics Generated!",
          description: "AI has crafted new lyrics. They are now in the lyrics area.",
        });
      } else { 
        if (!lyricsForMelody && (themeStringForAI.trim() === "" && (!data.keywords || data.keywords.trim() === ""))) {
           toast({ title: "Missing Lyrics Source", description: "Provide Themes/Keywords for AI lyrics regeneration or type lyrics manually.", variant: "default"});
           setIsLoading(false);
           return;
        }
      }

      await executeMelodyGeneration(lyricsForMelody, data.genre, data.key, data.tempo);

    } catch (error) {
      console.error("Error in song crafting (generate/regenerate lyrics & melody):", error);
      const friendlyMessage = getAIErrorMessage(error, 'crafting');
      toast({ title: "AI Crafting Error", description: friendlyMessage, variant: "destructive", duration: 7000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWithLyricsAction = async () => {
    setIsLoading(true);
    const isValid = await form.trigger(["genre", "key", "tempo"]);
    if (!isValid) {
      toast({ title: "Validation Error", description: "Please ensure Genre, Key, and Tempo are set.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (!currentLyrics || currentLyrics.trim() === "") {
      toast({ title: "Missing Lyrics", description: "Please enter or edit lyrics before composing melody.", variant: "destructive"});
      setIsLoading(false);
      return;
    }
    const data = form.getValues();
    try {
      await executeMelodyGeneration(currentLyrics, data.genre, data.key, data.tempo);
    } catch (error) {
      console.error("Error in song crafting (continue with lyrics):", error);
      const friendlyMessage = getAIErrorMessage(error, 'melody');
      toast({ title: "AI Melody Error", description: friendlyMessage, variant: "destructive", duration: 7000 });
    } finally {
      setIsLoading(false);
    }
  };


  const mixedEmotionOptions = songEmotions.filter(e => e !== "None" && e !== "Mixed Emotion");
  const displayedSelectedThemes = [...selectedPredefinedThemes];
  if (customTheme.trim()) {
    displayedSelectedThemes.push(`Custom: ${customTheme.trim()}`);
  }

  const themesToRender = showAllThemes ? PREDEFINED_THEMES : PREDEFINED_THEMES.slice(0, INITIAL_THEMES_TO_SHOW);
  

  return (
    <Card className="min-w-0 overflow-x-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Music className="text-primary" /> Lyrics & Melody</CardTitle>
        </div>
        <CardDescription>
          Craft lyrics with AI or input manually. Then, compose a melody.
        </CardDescription>
      </CardHeader>
      <ScrollArea>
        <div className="min-w-max p-6 pt-0">
          <Form {...form}>
            <form
              className="min-w-max space-y-4" 
              onSubmit={(e) => e.preventDefault()} 
            >
            
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="flex items-center gap-1"><ListChecks className="text-primary inline-block h-4 w-4" /> Themes</FormLabel>
                </div>
                <FormDescUI>Select up to 3 themes. This will guide the AI if generating lyrics.</FormDescUI>
                <div className="space-y-2 pt-1">
                  {showAllThemes ? (
                    <ScrollArea viewportRef={themesScrollAreaViewportRef} className="max-h-[28rem] w-full rounded-md border p-2">
                      <div className="grid grid-cols-1 gap-y-2">
                        {PREDEFINED_THEMES.map(theme => (
                          <FormItem key={theme} className="flex flex-row items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={selectedPredefinedThemes.includes(theme)}
                                onCheckedChange={(checked) => handlePredefinedThemeChange(theme, !!checked)}
                                disabled={!selectedPredefinedThemes.includes(theme) && totalSelectedThemes >= 3}
                                id={`theme-${theme.replace(/[^a-zA-Z0-9-_]/g, '')}`}
                              />
                            </FormControl>
                            <Label className="text-sm font-normal cursor-pointer" htmlFor={`theme-${theme.replace(/[^a-zA-Z0-9-_]/g, '')}`}>{theme}</Label>
                          </FormItem>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="grid grid-cols-1 gap-y-2 p-2 border rounded-md bg-muted/20">
                      {themesToRender.map(theme => (
                        <FormItem key={theme} className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={selectedPredefinedThemes.includes(theme)}
                              onCheckedChange={(checked) => handlePredefinedThemeChange(theme, !!checked)}
                              disabled={!selectedPredefinedThemes.includes(theme) && totalSelectedThemes >= 3}
                               id={`theme-${theme.replace(/[^a-zA-Z0-9-_]/g, '')}`}
                            />
                          </FormControl>
                          <Label className="text-sm font-normal cursor-pointer" htmlFor={`theme-${theme.replace(/[^a-zA-Z0-9-_]/g, '')}`}>{theme}</Label>
                        </FormItem>
                      ))}
                    </div>
                  )}
                  {PREDEFINED_THEMES.length > INITIAL_THEMES_TO_SHOW && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => setShowAllThemes(!showAllThemes)}
                      className="p-0 h-auto text-primary mt-1 flex items-center gap-1"
                    >
                      {showAllThemes ? <><EyeOff size={14}/> Collapse</> : <><Eye size={14}/> View All</>}
                    </Button>
                  )}
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
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value || ""}>
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
                    </div>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value || "None"}>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {mixedEmotionOptions.map(emotionItem => (
                      <FormItem key={emotionItem} className="flex flex-row items-start space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={selectedMixedEmotions.includes(emotionItem)}
                            onCheckedChange={() => handleMixedEmotionChange(emotionItem)}
                            disabled={selectedMixedEmotions.length >= 3 && !selectedMixedEmotions.includes(emotionItem)}
                            id={`emotion-${emotionItem.replace(/\s/g, '-')}`}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer" htmlFor={`emotion-${emotionItem.replace(/\s/g, '-')}`}>
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
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value || "C"}>
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
                  onChange={handleLyricsTextareaChange}
                  placeholder="Type your lyrics here, or AI-generated lyrics will appear here. This content will be used for melody generation."
                  className="min-h-[180px] focus:ring-accent focus:border-accent text-sm"
                />
                <FormDescUI className="text-xs text-muted-foreground">
                  If Themes & Keywords above are filled, AI will generate lyrics here. Otherwise, type your own.
                </FormDescUI>
              </div>
            </form>
          </Form>
        </div>
      </ScrollArea>
      <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-2 pt-4 border-t">
         {(lyricsManuallyEdited || lyricsWereAIDrivenThisSession) ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? <Loader2 className="animate-spin" /> : "Compose Options"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem onSelect={handleGenerateOrRegenerateAction} disabled={isLoading}>
                  Generate Lyrics & Compose Melody
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleContinueWithLyricsAction} disabled={isLoading || !currentLyrics.trim()}>
                  Continue with these Lyrics
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button type="button" onClick={handleGenerateOrRegenerateAction} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="animate-spin" /> : "Generate Lyrics & Compose Melody"}
            </Button>
          )}
      </CardFooter>
    </Card>
  );
};

export default SongCrafter;
    

    

    