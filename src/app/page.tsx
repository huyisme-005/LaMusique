
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
import { Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


import type { GenerateMelodyOutput } from '@/ai/flows/generate-melody';

const HarmonicAiPage: FC = () => {
  const [lyrics, setLyrics] = useState<string>("");
  const [melody, setMelody] = useState<GenerateMelodyOutput | null>(null);

  const handleLyricsGenerated = (newLyrics: string) => {
    setLyrics(newLyrics);
  };

  const handleMelodyGenerated = (newMelody: GenerateMelodyOutput) => {
    setMelody(newMelody);
  };

  // This function will be passed to SongCrafter for direct editing of lyrics
  const handleLyricsEdited = (editedLyrics: string) => {
    setLyrics(editedLyrics);
  };

  const handleSaveWorkspace = () => {
    // Placeholder for actual save logic
    alert("Save workspace functionality is in development. Your work would be saved here!");
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:gap-6 md:p-6">
        {/* Left Panel (Controls) */}
        <div className="bg-card text-card-foreground rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b rounded-t-xl bg-muted flex items-center justify-between">
            <h2 className="text-xl font-semibold text-primary-foreground">Song Creation & Tools</h2>
            <Button variant="outline" size="sm" onClick={handleSaveWorkspace} className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4 md:p-6 bg-background/30 rounded-b-xl">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Generate & Edit Lyrics / Compose Melody</h3>
                <div className="space-y-6">
                  <SongCrafter 
                    currentLyrics={lyrics}
                    onLyricsGenerated={handleLyricsGenerated} 
                    onLyricsChange={handleLyricsEdited} // For direct editing in SongCrafter's textarea
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
          <Tabs defaultValue="currentSong" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="currentSong">Current Song</TabsTrigger>
              <TabsTrigger value="savedProgress">Saved Progress</TabsTrigger>
            </TabsList>
            <TabsContent value="currentSong">
              <div className="space-y-6">
                <SongOutputDisplay lyrics={lyrics} melody={melody} />
                <Separator />
                <MusicVideoControls />
              </div>
            </TabsContent>
            <TabsContent value="savedProgress">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Work</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your saved song progress will appear here. 
                    <br />
                    (This feature is currently in development and requires further setup for persistence.)
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </main>
    </div>
  );
};

export default HarmonicAiPage;
