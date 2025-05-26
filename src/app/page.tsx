
"use client";

import { useState, type FC, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from '@/components/ui/separator';

import LyricsGenerator from '@/components/features/song-crafting/LyricsGenerator';
import MelodyGenerator from '@/components/features/song-crafting/MelodyGenerator';
import CompletionSuggester from '@/components/features/refinement/CompletionSuggester';
import LyricsEditor from '@/components/features/editing/LyricsEditor';
import MelodyEditorPlaceholder from '@/components/features/editing/MelodyEditorPlaceholder';
import ExportControls from '@/components/features/export-share/ExportControls';
import ShareControls from '@/components/features/export-share/ShareControls';
import SongOutputDisplay from '@/components/features/output/SongOutputDisplay';
import MusicVideoControls from '@/components/features/output/MusicVideoControls';
import EmotionAnalyzer from '@/components/features/analysis/EmotionAnalyzer';
import AudioInputHandler from '@/components/features/audio-input/AudioInputHandler';

import type { GenerateMelodyOutput } from '@/ai/flows/generate-melody';

const HarmonicAiPage: FC = () => {
  const [lyrics, setLyrics] = useState<string>("");
  const [melody, setMelody] = useState<GenerateMelodyOutput | null>(null);
  const [audioForPlagiarismCheck, setAudioForPlagiarismCheck] = useState<{ audioDataUri: string; lyrics?: string } | null>(null);

  const handleLyricsGenerated = (newLyrics: string) => {
    setLyrics(newLyrics);
    // No longer need to switch tabs, user can scroll to the editor
  };

  const handleMelodyGenerated = (newMelody: GenerateMelodyOutput) => {
    setMelody(newMelody);
  };

  const handleLyricsChange = (newLyrics: string) => {
    setLyrics(newLyrics);
  };
  
  const handleSuggestionSelected = (suggestion: string) => {
    setLyrics(prevLyrics => prevLyrics ? prevLyrics + "\\n\\n" + suggestion : suggestion);
    // No longer need to switch tabs
  };

  const handleAudioPreparedForCheck = (audioDataUri: string, associatedLyrics?: string) => {
    setAudioForPlagiarismCheck({ audioDataUri, lyrics: associatedLyrics });
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
                <h3 className="text-lg font-semibold mb-4 text-primary">Song Crafting</h3>
                <div className="space-y-6">
                  <LyricsGenerator onLyricsGenerated={handleLyricsGenerated} currentLyrics={lyrics} />
                  <MelodyGenerator lyrics={lyrics} onMelodyGenerated={handleMelodyGenerated} />
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Input & Analysis</h3>
                <div className="space-y-6">
                  <AudioInputHandler onAudioPrepared={handleAudioPreparedForCheck} />
                  <EmotionAnalyzer />
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Refine & Edit</h3>
                <div className="space-y-6">
                  <CompletionSuggester currentLyrics={lyrics} onSuggestionSelected={handleSuggestionSelected} />
                  <LyricsEditor lyrics={lyrics} onLyricsChange={handleLyricsChange} />
                  <MelodyEditorPlaceholder />
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
