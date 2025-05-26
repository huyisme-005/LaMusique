
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
import { Save } from 'lucide-react'; // Removed FolderOpen as we'll use Save icon for both
// Removed Tabs related imports as they are no longer used in the right panel
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


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

  const handleLyricsEdited = (editedLyrics: string) => {
    setLyrics(editedLyrics);
  };

  const handleSaveWorkspace = () => {
    alert("Save workspace functionality is in development. Your work would be saved here!");
  };

  const handleSaveProgress = () => {
    alert("Save Progress to persistent storage is in development. This would allow you to access your work later.");
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
                onClick={handleSaveProgress}
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground mr-2"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Progress
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveWorkspace} 
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
            <h2 className="text-xl font-semibold text-foreground self-start">Song Creation & Tools</h2>
          </div>
          <ScrollArea className="flex-1 p-4 md:p-6 bg-background/30 rounded-b-xl">
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
          {/* Removed Tabs, TabsList, TabsTrigger, TabsContent */}
          <div className="space-y-6">
            <SongOutputDisplay lyrics={lyrics} melody={melody} />
            <Separator />
            <MusicVideoControls />
          </div>
          {/* Removed Card placeholder for Saved Work */}
        </ScrollArea>
      </main>
    </div>
  );
};

export default HarmonicAiPage;
