
"use client";

import { useState, type FC, useRef, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
import { Separator } from '@/components/ui/separator';

const SCROLL_AMOUNT = 200; // Pixels to scroll with each button click

const HarmonicAiPage: FC = () => {
  const [activeTab, setActiveTab] = useState<string>("lyrics");
  const [lyrics, setLyrics] = useState<string>("");
  const [melody, setMelody] = useState<GenerateMelodyOutput | null>(null);
  const [audioForPlagiarismCheck, setAudioForPlagiarismCheck] = useState<{ audioDataUri: string; lyrics?: string } | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const tabsListRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleLyricsGenerated = (newLyrics: string) => {
    setLyrics(newLyrics);
    setActiveTab("edit");
  };

  const handleMelodyGenerated = (newMelody: GenerateMelodyOutput) => {
    setMelody(newMelody);
  };

  const handleLyricsChange = (newLyrics: string) => {
    setLyrics(newLyrics);
  };
  
  const handleSuggestionSelected = (suggestion: string) => {
    setLyrics(prevLyrics => prevLyrics ? prevLyrics + "\\n\\n" + suggestion : suggestion);
    setActiveTab("edit");
  };

  const handleAudioPreparedForCheck = (audioDataUri: string, associatedLyrics?: string) => {
    setAudioForPlagiarismCheck({ audioDataUri, lyrics: associatedLyrics });
  };

  useEffect(() => {
    const viewport = scrollAreaRef.current?.firstElementChild as HTMLDivElement | null;
    const list = tabsListRef.current;

    if (!viewport || !list) return;

    const checkScrollability = () => {
      const { scrollLeft, clientWidth: viewportClientWidth } = viewport;
      const listScrollWidth = list.scrollWidth;

      setCanScrollLeft(scrollLeft > 1);
      setCanScrollRight(Math.round(scrollLeft) < Math.round(listScrollWidth - viewportClientWidth) - 1);
    };

    checkScrollability(); // Initial check

    viewport.addEventListener('scroll', checkScrollability, { passive: true });
    const resizeObserver = new ResizeObserver(checkScrollability);
    resizeObserver.observe(viewport);
    resizeObserver.observe(list);

    return () => {
      viewport.removeEventListener('scroll', checkScrollability);
      resizeObserver.disconnect();
    };
  }, []);

  const handleScrollLeft = () => {
    const viewport = scrollAreaRef.current?.firstElementChild as HTMLDivElement | null;
    viewport?.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    const viewport = scrollAreaRef.current?.firstElementChild as HTMLDivElement | null;
    viewport?.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:gap-6 md:p-6">
        {/* Left Panel (Controls) */}
        <div className="bg-card text-card-foreground rounded-xl shadow-xl flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="flex items-center w-full overflow-hidden border-b rounded-t-xl bg-muted">
              <Button
                variant="ghost"
                size="icon"
                className="h-full rounded-none px-2 hover:bg-muted/80"
                onClick={handleScrollLeft}
                disabled={!canScrollLeft}
                aria-label="Scroll tabs left"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <ScrollArea
                ref={scrollAreaRef}
                orientation="horizontal"
                className="flex-1 [&>[data-radix-scroll-area-scrollbar][data-orientation='horizontal']]:hidden"
              >
                <TabsList ref={tabsListRef} className="rounded-none whitespace-nowrap justify-start bg-muted px-1">
                  <TabsTrigger value="lyrics">Lyrics</TabsTrigger>
                  <TabsTrigger value="melody">Melody</TabsTrigger>
                  <TabsTrigger value="audio">Audio Input</TabsTrigger>
                  <TabsTrigger value="emotion">Emotion</TabsTrigger>
                  <TabsTrigger value="refine">Refine</TabsTrigger>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="export">Export</TabsTrigger>
                </TabsList>
              </ScrollArea>
              <Button
                variant="ghost"
                size="icon"
                className="h-full rounded-none px-2 hover:bg-muted/80"
                onClick={handleScrollRight}
                disabled={!canScrollRight}
                aria-label="Scroll tabs right"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4 md:p-6 bg-background/30 rounded-b-xl">
              <TabsContent value="lyrics">
                <LyricsGenerator onLyricsGenerated={handleLyricsGenerated} currentLyrics={lyrics} />
              </TabsContent>
              <TabsContent value="melody">
                <MelodyGenerator lyrics={lyrics} onMelodyGenerated={handleMelodyGenerated} />
              </TabsContent>
              <TabsContent value="audio">
                <AudioInputHandler onAudioPrepared={handleAudioPreparedForCheck} />
              </TabsContent>
              <TabsContent value="emotion">
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
