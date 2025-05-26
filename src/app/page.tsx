
"use client";

import { useState, type FC, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from '@/components/ui/separator';
import SongCrafter from '@/components/features/song-crafting/SongCrafter'; 
import ExportControls from '@/components/features/export-share/ExportControls';
import ShareControls from '@/components/features/export-share/ShareControls';
import SongOutputDisplay from '@/components/features/output/SongOutputDisplay';
import MusicVideoControls from '@/components/features/output/MusicVideoControls';
import AudioInputHandler from '@/components/features/audio-input/AudioInputHandler';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

import type { GenerateMelodyOutput } from '@/ai/flows/generate-melody';

export interface SavedSong { // Exporting for use in /saved page
  id: string;
  name: string;
  lyrics: string;
  melody: GenerateMelodyOutput | null;
}

const HarmonicAiPage: FC = () => {
  const [lyrics, setLyrics] = useState<string>("");
  const [melody, setMelody] = useState<GenerateMelodyOutput | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const songIdToLoad = searchParams.get('loadSongId');
    if (songIdToLoad) {
      const storedSongs = localStorage.getItem('harmonicAI_savedSongs');
      if (storedSongs) {
        try {
          const songs: SavedSong[] = JSON.parse(storedSongs);
          const songToLoad = songs.find(s => s.id === songIdToLoad);
          if (songToLoad) {
            setLyrics(songToLoad.lyrics);
            setMelody(songToLoad.melody);
            // Note: Restoring SongCrafter form inputs (theme, keywords, genre, etc.) 
            // would require saving them as part of SavedSong and setting them here.
            // For this iteration, only lyrics and melody are loaded.
            toast({ title: "Song Loaded", description: `"${songToLoad.name}" lyrics and melody have been loaded.` });
          } else {
            toast({ title: "Error Loading Song", description: "Could not find the song to load.", variant: "destructive" });
          }
        } catch (e) {
          console.error("Error parsing saved songs from localStorage", e);
          toast({ title: "Error Loading Song", description: "Could not parse saved songs data.", variant: "destructive" });
        }
      } else {
        toast({ title: "No Saved Songs", description: "Could not find any saved songs to load.", variant: "default" });
      }
      // Clear the query parameter to prevent reloading on refresh/navigation
      // Using router.replace to avoid adding to browser history
      const newPath = window.location.pathname; // Keep current path, remove query params
      router.replace(newPath, { scroll: false });
    }
  }, [searchParams, router, toast]);


  const handleLyricsGenerated = (newLyrics: string) => {
    setLyrics(newLyrics);
  };

  const handleMelodyGenerated = (newMelody: GenerateMelodyOutput) => {
    setMelody(newMelody);
  };

  const handleLyricsEdited = (editedLyrics: string) => {
    setLyrics(editedLyrics);
  };

  const handleSaveCurrentSong = () => {
    const songName = window.prompt("Enter a name for your song:");
    if (songName && songName.trim() !== "") {
      const newSong: SavedSong = {
        id: Date.now().toString(),
        name: songName.trim(),
        lyrics: lyrics,
        melody: melody,
      };
      
      const storedSongs = localStorage.getItem('harmonicAI_savedSongs');
      let songs: SavedSong[] = [];
      if (storedSongs) {
        try {
          songs = JSON.parse(storedSongs);
        } catch (e) {
          console.error("Error parsing saved songs from localStorage for saving:", e);
          toast({ title: "Save Error", description: "Could not read existing saved songs. Your song was not saved.", variant: "destructive"});
          return;
        }
      }
      songs.push(newSong);
      try {
        localStorage.setItem('harmonicAI_savedSongs', JSON.stringify(songs));
        toast({
          title: "Song Saved!",
          description: `"${newSong.name}" has been saved. You can view it on the 'Saved Songs' page.`,
        });
      } catch (e) {
        console.error("Error saving song to localStorage:", e);
        toast({ title: "Save Error", description: "Could not save your song to local storage. It might be full.", variant: "destructive"});
      }
    } else if (songName !== null) { // User pressed OK but entered no name
      toast({
        title: "Save Cancelled",
        description: "Song name cannot be empty.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:gap-6 md:p-6">
        {/* Left Panel (Controls) */}
        <div className="bg-card text-card-foreground rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b rounded-t-xl bg-muted flex flex-col">
            <div className="flex items-center justify-end w-full mb-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveCurrentSong} 
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Current Song
              </Button>
            </div>
            <h2 className="text-xl font-semibold text-foreground self-start">Song Creation & Tools</h2>
          </div>
          
          <ScrollArea className="flex-1 h-full p-4 md:p-6 bg-background/30 rounded-b-xl">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Generate & Edit Lyrics / Compose Melody</h3>
                <div className="space-y-6">
                  <SongCrafter 
                    currentLyrics={lyrics}
                    onLyricsGenerated={handleLyricsGenerated} 
                    onLyricsChange={handleLyricsEdited} 
                    onMelodyGenerated={handleMelodyGenerated}
                  />
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Audio Input</h3>
                <div className="space-y-6">
                  <AudioInputHandler onAudioPrepared={() => { /* No action needed here now */ }} />
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Export & Share</h3>
                <div className="space-y-6">
                  <ExportControls />
                  <ShareControls />
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel (Display) */}
        <ScrollArea className="bg-card text-card-foreground rounded-xl shadow-xl p-4 md:p-6">
          <div className="space-y-6">
            <SongOutputDisplay lyrics={lyrics} melody={melody} />
            <Separator />
            <MusicVideoControls />
          </div>
        </ScrollArea>
      </main>
    </div>
  );
};

export default HarmonicAiPage;
