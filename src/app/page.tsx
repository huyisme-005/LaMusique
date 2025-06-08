/**
 * @fileOverview Main page component for the La Musique application.
 * This page serves as the primary interface for song creation, featuring components
 * for lyrics generation/editing (SongCrafter), audio input (AudioInputHandler),
 * song output display (SongOutputDisplay), music video controls, export/share controls,
 * and song saving/loading functionality.
 *
 * @exports LaMusiquePage - The main React functional component for the application.
 * @exports SavedSong - Interface for the structure of a saved song object.
 */
"use client";

import React, { useState, type FC, useEffect, Suspense, useCallback } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from '@/components/ui/separator';
import SongCrafter from '@/components/features/song-crafting/SongCrafter'; 
import ExportControls from '@/components/features/export-share/ExportControls';
import ShareControls from '@/components/features/export-share/ShareControls';
import SongOutputDisplay from '@/components/features/output/SongOutputDisplay';
import MusicVideoControls from '@/components/features/output/MusicVideoControls';
import AudioInputHandler from '@/components/features/audio-input/AudioInputHandler';
import SongLoader from '@/components/features/song-loading/SongLoader';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

import type { GenerateMelodyOutput } from '@/ai/flows/generate-melody';

export interface SavedSong {
  id: string;
  name: string;
  lyrics: string;
  melody: GenerateMelodyOutput | null;
}

// Define a loading component for Suspense
const SongLoaderFallback: FC = () => {
  return (
    <div className="flex justify-center items-center p-4">
      <p className="text-muted-foreground">Loading song data...</p>
    </div>
  );
};


const LaMusiquePage: FC = () => {
  const [lyrics, setLyrics] = useState<string>("");
  const [melody, setMelody] = useState<GenerateMelodyOutput | null>(null);
  const [currentSongNameForExport, setCurrentSongNameForExport] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Component has mounted on the client
  }, []);

  const handleSongLoaded = useCallback((loadedLyrics: string, loadedMelody: GenerateMelodyOutput | null, songName: string) => {
    setLyrics(loadedLyrics);
    setMelody(loadedMelody);
    setCurrentSongNameForExport(songName);
  }, []); // setX functions from useState are stable

  const handleLyricsGenerated = useCallback((newLyrics: string) => {
    setLyrics(newLyrics);
    setCurrentSongNameForExport(null); 
  }, []); // setX functions from useState are stable

  const handleMelodyGenerated = useCallback((newMelody: GenerateMelodyOutput) => {
    setMelody(newMelody);
  }, []); // setX functions from useState are stable

  const handleLyricsEdited = useCallback((editedLyrics: string) => {
    setLyrics(editedLyrics);
  }, []); // setX functions from useState are stable

  const handleSaveCurrentSong = useCallback(() => {
    if (!isClient) { 
      toast({ title: "Error", description: "Cannot save song at this moment.", variant: "destructive" });
      return;
    }

    const songName = window.prompt("Enter a name for your song:");
    if (songName && songName.trim() !== "") {
      const newSong: SavedSong = {
        id: Date.now().toString(),
        name: songName.trim(),
        lyrics: lyrics,
        melody: melody,
      };
      
      let songs: SavedSong[] = [];
      try {
        const storedSongs = localStorage.getItem('laMusique_savedSongs');
        if (storedSongs) {
          songs = JSON.parse(storedSongs);
        }
      } catch (e) {
        console.error("Error parsing saved songs from localStorage for saving:", e);
        toast({ title: "Save Error", description: "Could not read existing saved songs. Your song was not saved.", variant: "destructive"});
        return;
      }

      songs.push(newSong);
      
      try {
        localStorage.setItem('laMusique_savedSongs', JSON.stringify(songs));
        setCurrentSongNameForExport(newSong.name); 
        toast({
          title: "Song Saved!",
          description: `"${newSong.name}" has been saved. You can view it on the 'Saved Songs' page.`,
        });
      } catch (e) {
        console.error("Error saving song to localStorage:", e);
        toast({ title: "Save Error", description: "Could not save your song to local storage. It might be full.", variant: "destructive"});
      }
    } else if (songName !== null) { 
      toast({
        title: "Save Cancelled",
        description: "Song name cannot be empty.",
        variant: "destructive",
      });
    }
  }, [isClient, toast, lyrics, melody, setCurrentSongNameForExport]);
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      {isClient && (
        <Suspense fallback={<SongLoaderFallback />}>
          <SongLoader onSongLoaded={handleSongLoaded} isClient={isClient} localStorageKey="laMusique_savedSongs" />
        </Suspense>
      )}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:gap-6 md:p-6">
        <div className="bg-card text-card-foreground rounded-xl shadow-xl flex flex-col">
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
          
          <ScrollArea className="flex-1 h-full">
            <div className="min-w-max p-4 md:p-6 space-y-8">
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
                  <ExportControls 
                    lyrics={lyrics} 
                    melody={melody} 
                    currentSongName={currentSongNameForExport} 
                    appName="La Musique"
                  />
                  <ShareControls />
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        <ScrollArea className="bg-card text-card-foreground rounded-xl shadow-xl">
          <div className="min-w-max p-4 md:p-6 space-y-6">
            <SongOutputDisplay lyrics={lyrics} melody={melody} />
            <Separator />
            <MusicVideoControls />
          </div>
        </ScrollArea>
      </main>
    </div>
  );
};

export default LaMusiquePage;
