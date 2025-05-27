
"use client";

import React, { type FC, useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area'; 
import { Button } from '@/components/ui/button';
import { FileText, ListMusic, Disc3, UserRoundCheck, MessageSquareQuote, ShieldAlert, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { GenerateMelodyOutput } from '@/ai/flows/generate-melody';
import { checkAudioPlagiarism, type CheckAudioPlagiarismOutput } from '@/ai/flows/check-audio-plagiarism';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";

const DEFAULT_AUDIO_DATA_URI = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA";

interface SongSectionCardProps {
  title: string;
  icon: React.ElementType;
  description?: string;
  children: React.ReactNode;
  contentClassName?: string;
  footerContent?: React.ReactNode; 
}

const SongSectionCard: FC<SongSectionCardProps> = ({ title, icon: Icon, description, children, contentClassName, footerContent }) => {
  const viewportRef = useRef<HTMLDivElement>(null);

  return (
    <Card className="flex-1 flex flex-col min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Icon className="text-primary" /> {title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea 
          orientation="horizontal" 
          type="scroll" 
          className="w-full flex-grow"
          viewportRef={viewportRef}
        >
          <div className={`min-w-max p-4 ${contentClassName || ''}`}>
            {children}
          </div>
        </ScrollArea>
      </CardContent>
      {footerContent && (
        <CardFooter className="pt-4 border-t">
          {footerContent}
        </CardFooter>
      )}
    </Card>
  );
};


interface SongOutputDisplayProps {
  lyrics: string;
  melody: GenerateMelodyOutput | null;
}

const SongOutputDisplay: FC<SongOutputDisplayProps> = ({ lyrics, melody }) => {
  const [lyricsPlagiarismResult, setLyricsPlagiarismResult] = useState<CheckAudioPlagiarismOutput | null>(null);
  const [isScanningLyrics, setIsScanningLyrics] = useState(false);
  const { toast } = useToast();

  const handleScanLyrics = async () => {
    if (!lyrics || lyrics.trim() === "") {
      toast({
        title: "No Lyrics to Scan",
        description: "Please generate or enter lyrics before scanning.",
        variant: "default",
      });
      return;
    }

    setIsScanningLyrics(true);
    setLyricsPlagiarismResult(null);
    try {
      const result = await checkAudioPlagiarism({ 
        lyrics: lyrics, 
        audioDataUri: DEFAULT_AUDIO_DATA_URI 
      });
      setLyricsPlagiarismResult(result);
      toast({
        title: "Lyrics Scan Complete",
        description: result.isHighConcern ? "Potential concerns identified in lyrics." : "Preliminary lyrics scan found no major concerns.",
      });
    } catch (error) {
      console.error("Error scanning lyrics:", error);
      toast({
        title: "Error Scanning Lyrics",
        description: (error as Error).message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsScanningLyrics(false);
    }
  };


  return (
    <div className="space-y-6 h-full flex flex-col">
      <SongSectionCard 
        title="Generated Lyrics" 
        icon={FileText} 
        contentClassName="h-[calc(33vh-120px)] md:h-auto" 
        footerContent={
            <div className="w-full">
                <Button onClick={handleScanLyrics} disabled={isScanningLyrics || !lyrics} className="w-full sm:w-auto">
                    {isScanningLyrics ? <Loader2 className="animate-spin mr-2" /> : <ShieldAlert className="mr-2" />}
                    Scan Lyrics for Plagiarism (Experimental)
                </Button>
                {lyricsPlagiarismResult && (
                    <Alert variant={lyricsPlagiarismResult.isHighConcern ? "destructive" : "default"} className="mt-4">
                    <AlertTitle className="flex items-center gap-1">
                        {lyricsPlagiarismResult.isHighConcern ? <AlertTriangle className="text-destructive" /> : <ShieldCheck className="text-green-500" />}
                        Lyrics Scan Result
                    </AlertTitle>
                    <AlertDescription className="whitespace-pre-wrap text-xs">
                        {lyricsPlagiarismResult.potentialConcerns}
                    </AlertDescription>
                    </Alert>
                )}
            </div>
        }
      >
        <ScrollArea className="h-full w-full rounded-md border p-4 bg-muted/30">
          {lyrics ? (
            <pre className="whitespace-pre-wrap text-sm font-mono">{lyrics}</pre>
          ) : (
            <p className="text-muted-foreground italic">Your generated lyrics will appear here once crafted.</p>
          )}
        </ScrollArea>
      </SongSectionCard>

      <SongSectionCard 
        title="Generated Melody" 
        icon={ListMusic} 
        description="Details about the composed melody, including how to sing it."
        contentClassName="h-[calc(33vh-140px)] md:h-auto" 
      >
        <ScrollArea className="h-full w-full rounded-md border p-4 bg-muted/30">
          {melody ? (
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-1"><UserRoundCheck size={16} className="text-accent"/> Melody & Singing Instructions:</h4>
                <p className="text-sm whitespace-pre-wrap mt-1">{melody.description}</p>
              </div>
              <div className="pt-2">
                <h4 className="font-semibold text-sm">Melody Structure (MusicXML Representation):</h4>
                <p className="text-xs text-muted-foreground italic">(MusicXML data is generated for structural representation. Actual playback/visualization is a future feature.)</p>
                <ScrollArea className="max-h-[100px] bg-background p-2 rounded mt-1" orientation="horizontal" type="auto">
                   <pre className="whitespace-pre text-xs"> 
                    {melody.melody}
                  </pre>
                </ScrollArea>
              </div>
               <div className="flex items-center justify-center pt-4 text-muted-foreground">
                  <Disc3 size={32} className="mr-2 animate-spin [animation-duration:3s]" />
                  <p>Melody visualization & playback coming soon!</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground italic">Melody details and singing instructions will appear here once composed.</p>
          )}
        </ScrollArea>
      </SongSectionCard>

      {melody?.lyricFeedback && (
        <SongSectionCard 
          title="AI Lyric Feedback" 
          icon={MessageSquareQuote} 
          description="Suggestions and analysis for the lyrics used to generate the melody."
          contentClassName="h-[calc(33vh-140px)] md:h-auto" 
        >
          <ScrollArea className="h-full w-full rounded-md border p-4 bg-muted/30">
            <p className="text-sm whitespace-pre-wrap">{melody.lyricFeedback}</p>
          </ScrollArea>
        </SongSectionCard>
      )}
    </div>
  );
};

export default SongOutputDisplay;
