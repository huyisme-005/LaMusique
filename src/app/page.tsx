
"use client";

import { useState, type FC } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

import LyricsGenerator from '@/components/features/song-crafting/LyricsGenerator';
import MelodyGenerator from '@/components/features/song-crafting/MelodyGenerator';
import CompletionSuggester from '@/components/features/refinement/CompletionSuggester';
import LyricsEditor from '@/components/features/editing/LyricsEditor';
import MelodyEditorPlaceholder from '@/components/features/editing/MelodyEditorPlaceholder';
import ExportControls from '@/components/features/export-share/ExportControls';
import ShareControls from '@/components/features/export-share/ShareControls';
import SongOutputDisplay from '@/components/features/output/SongOutputDisplay';
import MusicVideoControls from '@/components/features/output/MusicVideoControls';
import EmotionAnalyzer from '@/components/features/analysis/EmotionAnalyzer'; // New import

import type { GenerateMelodyOutput } from '@/ai/flows/generate-melody';
import { Separator } from '@/components/ui/separator';

const HarmonicAiPage: FC = () => {
  const [activeTab, setActiveTab] = useState<string>("lyrics");
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
  
  const handleSuggestionSelected = (suggestion: string) => {
    setLyrics(prevLyrics => prevLyrics ? prevLyrics + "\\n\\n" + suggestion : suggestion);
    setActiveTab("edit"); // Switch to edit tab to see the appended suggestion
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:gap-6 md:p-6">
        {/* Left Panel (Controls) */}
        <div className="bg-card text-card-foreground rounded-xl shadow-xl flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 rounded-none rounded-t-xl border-b"> {/* Changed grid-cols-5 to grid-cols-6 */}
              <TabsTrigger value="lyrics">Lyrics</TabsTrigger>
              <TabsTrigger value="melody">Melody</TabsTrigger>
              <TabsTrigger value="emotion">Emotion</TabsTrigger> {/* New Tab */}
              <TabsTrigger value="refine">Refine</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>
            <ScrollArea className="flex-1 p-4 md:p-6 bg-background/30 rounded-b-xl">
              <TabsContent value="lyrics">
                <LyricsGenerator onLyricsGenerated={handleLyricsGenerated} currentLyrics={lyrics} />
              </TabsContent>
              <TabsContent value="melody">
                <MelodyGenerator lyrics={lyrics} onMelodyGenerated={handleMelodyGenerated} />
              </TabsContent>
              <TabsContent value="emotion"> {/* New Tab Content */}
                <EmotionAnalyzer />
              </TabsContent>
              <TabsContent value="refine">
                <CompletionSuggester currentLyrics={lyrics} onSuggestionSelected={handleSuggestionSelected} />
              </TabsContent>
              <TabsContent value="edit" className="space-y-6">
                <LyricsEditor lyrics={lyrics} onLyricsChange={handleLyricsChange} />
                <MelodyEditorPlaceholder />
              </TabsContent>
              <TabsContent value="export" className="space-y-6">
                <ExportControls />
                <ShareControls />
              </TabsContent>
            </ScrollArea>
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
