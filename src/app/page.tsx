
"use client";

import { useState, type FC, useEffect, useRef } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from '@/components/ui/separator';
// Button, ChevronLeft, ChevronRight imports removed as tabs are gone
import SongCrafter from '@/components/features/song-crafting/SongCrafter'; // New combined component
import LyricsEditor from '@/components/features/editing/LyricsEditor';
import ExportControls from '@/components/features/export-share/ExportControls';
import ShareControls from '@/components/features/export-share/ShareControls';
import SongOutputDisplay from '@/components/features/output/SongOutputDisplay';
import MusicVideoControls from '@/components/features/output/MusicVideoControls';
// EmotionAnalyzer import removed
import AudioInputHandler from '@/components/features/audio-input/AudioInputHandler';

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

  const handleLyricsChange = (newLyrics: string) => {
    setLyrics(newLyrics);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:gap-6 md:p-6">
        {/* Left Panel (Controls) */}
        <div className="bg-card text-card-foreground rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b rounded-t-xl bg-muted">
            <h2 className="text-xl font-semibold text-primary-foreground">Song Creation & Tools</h2>
          </div>
          <ScrollArea className="flex-1 p-4 md:p-6 bg-background/30 rounded-b-xl">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Generate Lyrics & Melody</h3>
                <div className="space-y-6">
                  <SongCrafter 
                    currentLyrics={lyrics}
                    onLyricsGenerated={handleLyricsGenerated}
                    onMelodyGenerated={handleMelodyGenerated}
                  />
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Audio Input</h3>
                <div className="space-y-6">
                  <AudioInputHandler onAudioPrepared={() => { /* No longer needs to update page state directly or handle lyrics from here */ }} />
                  {/* EmotionAnalyzer component removed from here */}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Editing & Refinement</h3>
                <div className="space-y-6">
                  <LyricsEditor lyrics={lyrics} onLyricsChange={handleLyricsChange} />
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
