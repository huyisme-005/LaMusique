
"use client";

import { useState, type FC, useEffect, useRef } from 'react';
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
import { Save, Trash2, PlayCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";

import type { GenerateMelodyOutput } from '@/ai/flows/generate-melody';

interface SavedSong {
  id: string;
  name: string;
  lyrics: string;
  melody: GenerateMelodyOutput | null;
}

const HarmonicAiPage: FC = () => {
  const [lyrics, setLyrics] = useState<string>("");
  const [melody, setMelody] = useState<GenerateMelodyOutput | null>(null);
  const [savedSongs, setSavedSongs] = useState<SavedSong[]>([]);
  const [activeLeftTab, setActiveLeftTab] = useState<string>("create");
  const { toast } = useToast();

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
      setSavedSongs(prevSongs => [...prevSongs, newSong]);
      toast({
        title: "Song Saved!",
        description: `"${songName.trim()}" has been added to your saved progress.`,
      });
      setActiveLeftTab("saved"); // Switch to saved tab after saving
    } else if (songName !== null) { // User pressed OK but entered no name
      toast({
        title: "Save Cancelled",
        description: "Song name cannot be empty.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteSong = (songId: string) => {
    setSavedSongs(prevSongs => prevSongs.filter(song => song.id !== songId));
    toast({
      title: "Song Deleted",
      description: "The song has been removed from your saved progress.",
    });
  };

  const handleLoadSong = (song: SavedSong) => {
    // For now, just an alert. Full load is more complex.
    setLyrics(song.lyrics);
    setMelody(song.melody);
    setActiveLeftTab("create"); // Switch back to create tab
    toast({
      title: "Song Loaded (Basic)",
      description: `"${song.name}" lyrics and melody data have been loaded. Form inputs are not restored in this basic load.`,
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:gap-6 md:p-6">
        {/* Left Panel (Controls) */}
        <div className="bg-card text-card-foreground rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b rounded-t-xl bg-muted flex flex-col">
            <div className="flex items-center justify-end w-full mb-2">
              {/* Save button remains, "Save Progress" button is removed */}
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
          
          <Tabs value={activeLeftTab} onValueChange={setActiveLeftTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-auto sticky top-0 bg-card rounded-none border-b">
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="saved">Saved Progress</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="flex-1 overflow-y-auto">
              <ScrollArea className="h-full p-4 md:p-6 bg-background/30 rounded-b-xl">
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
            </TabsContent>

            <TabsContent value="saved" className="flex-1 overflow-y-auto">
              <ScrollArea className="h-full p-4 md:p-6 bg-background/30 rounded-b-xl">
                {savedSongs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">
                    <p className="text-lg">No songs saved yet.</p>
                    <p>Click the "Save Current Song" button in the header to save your work.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedSongs.map(song => (
                      <Card key={song.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{song.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground truncate">
                            Lyrics: {song.lyrics.substring(0, 50)}{song.lyrics.length > 50 ? "..." : ""}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Melody: {song.melody ? "Generated" : "Not generated"}
                          </p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                           <Button variant="outline" size="sm" onClick={() => handleLoadSong(song)}>
                            <PlayCircle className="mr-2 h-4 w-4" /> Load
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteSong(song.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
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

    