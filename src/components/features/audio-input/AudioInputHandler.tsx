
"use client";

import React, { type FC, useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Mic, UploadCloud, FileAudio, Sparkles, Trash2, Tags, Loader2, Search } from 'lucide-react'; // Added Search
import { ScrollArea } from '@/components/ui/scroll-area';
import { analyzeAudioGenre, type AnalyzeAudioGenreOutput } from '@/ai/flows/analyze-audio-genre';
import { Separator } from '@/components/ui/separator';

// A very short, silent WAV audio data URI to be used as a default
const DEFAULT_AUDIO_DATA_URI = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA";

interface AudioInputHandlerProps {
  onAudioPrepared: (audioDataUri: string) => void;
}

const AudioInputHandler: FC<AudioInputHandlerProps> = ({ onAudioPrepared }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [onlineSearchQuery, setOnlineSearchQuery] = useState<string>("");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainCardViewportRef = useRef<HTMLDivElement>(null);

  const [isIdentifyingGenre, setIsIdentifyingGenre] = useState(false);
  const [identifiedGenresDisplay, setIdentifiedGenresDisplay] = useState<string | null>(null);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setIdentifiedGenresDisplay(null); // Clear previous genre results
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a valid audio file.",
          variant: "destructive",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        setAudioFile(null);
        setAudioDataUri(null);
        onAudioPrepared(DEFAULT_AUDIO_DATA_URI);
        return;
      }
      setAudioFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAudioDataUri(result);
        onAudioPrepared(result);
      };
      reader.readAsDataURL(file);
    } else {
      setAudioFile(null);
      setAudioDataUri(null);
      onAudioPrepared(DEFAULT_AUDIO_DATA_URI);
    }
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
    setAudioDataUri(null);
    setIdentifiedGenresDisplay(null); // Clear previous genre results
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onAudioPrepared(DEFAULT_AUDIO_DATA_URI);
    toast({
      title: "Audio Cleared",
      description: "The uploaded audio file has been removed.",
    });
  };

  const handleRecordAudio = () => {
    toast({
      title: "Recording Not Implemented",
      description: "Microphone recording functionality will be available in a future update.",
      variant: "default",
    });
  };

  const handleGenerateAudio = () => {
    toast({
      title: "AI Audio Generation Not Implemented",
      description: "AI-powered audio generation will be available in a future update.",
      variant: "default",
    });
  };

  const handleIdentifyGenre = async () => {
    if (!audioDataUri || audioDataUri === DEFAULT_AUDIO_DATA_URI) {
      toast({
        title: "No Audio to Analyze",
        description: "Please upload or provide an audio file first.",
        variant: "default",
      });
      return;
    }

    setIsIdentifyingGenre(true);
    setIdentifiedGenresDisplay(null);
    try {
      const result: AnalyzeAudioGenreOutput = await analyzeAudioGenre({ audioDataUri });
      const genreText = result.genres.join(', ');
      setIdentifiedGenresDisplay(genreText); 
      toast({
        title: "Audio Genre Analysis Complete!",
        description: (
          <div className="text-sm">
            <p className="font-semibold">Identified Genre(s): {genreText}</p>
            {result.confidence && <p>Confidence: {(result.confidence * 100).toFixed(0)}%</p>}
            {result.reasoning && <p className="text-xs mt-1 italic text-muted-foreground">Reasoning: {result.reasoning}</p>}
          </div>
        ),
        duration: 10000, 
      });
    } catch (error) {
      console.error("Error identifying audio genre:", error);
      let errorMessage = "An unknown error occurred during genre analysis.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      if (errorMessage.includes("model is overloaded") || errorMessage.includes("503 Service Unavailable")) {
        errorMessage = "The AI model for genre analysis is currently busy or unavailable. Please try again later.";
      } else if (errorMessage.includes("API key") || errorMessage.includes("auth")) {
        errorMessage = "There's an issue with the AI service configuration for genre analysis. Please check API keys or permissions.";
      } else if (errorMessage.includes("Meaningful audio data URI is required") || errorMessage.includes("data seems too short")) {
        errorMessage = "The provided audio data is too short or invalid for genre analysis. Please upload a more substantial audio file.";
      }


      toast({
        title: "Genre Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsIdentifyingGenre(false);
    }
  };

  const handleOnlineSearch = () => {
    if (!onlineSearchQuery.trim()) {
      toast({
        title: "Empty Search Query",
        description: "Please enter a search term for online audio.",
        variant: "default"
      });
      return;
    }
    toast({
      title: "Online Search Not Implemented",
      description: `Searching for "${onlineSearchQuery}" is a future feature. For now, please upload audio directly.`,
      variant: "default",
    });
    // Here you would eventually call an API or service to search for audio
    // and then allow the user to select a result to use (onAudioPrepared).
  };

  return (
    <Card className="min-w-0 overflow-x-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><FileAudio className="text-primary" /> Audio Input</CardTitle>
        </div>
        <CardDescription>
          Upload local audio, use microphone/AI (future), or search online (future). Then, identify its genre.
          {identifiedGenresDisplay && <span className="block mt-1 text-xs">Previously identified genres: {identifiedGenresDisplay}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea viewportRef={mainCardViewportRef}>
          <div className="min-w-max p-6 pt-0">
             <div className="min-w-max space-y-4">
              <div>
                <Label htmlFor="audio-upload">Upload Audio File</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="flex-grow"
                  />
                  {audioFile && (
                    <Button variant="outline" size="icon" onClick={handleRemoveAudio} aria-label="Remove audio file">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                {audioFile && <p className="text-xs text-muted-foreground mt-1">Selected: {audioFile.name}</p>}
              </div>

              <Separator />

              <div>
                <Label htmlFor="online-audio-search">Search Online Audio (Future Feature)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="online-audio-search"
                    type="text"
                    placeholder="e.g., 'Acoustic guitar melody in C major'"
                    value={onlineSearchQuery}
                    onChange={(e) => setOnlineSearchQuery(e.target.value)}
                    className="flex-grow"
                  />
                  <Button variant="outline" onClick={handleOnlineSearch}>
                    <Search className="mr-2 h-4 w-4" /> Search
                  </Button>
                </div>
                 <p className="text-xs text-muted-foreground mt-1">
                    Search results will appear here.
                </p>
              </div>
              
              <Separator />

              <Button
                onClick={handleIdentifyGenre}
                variant="outline"
                className="w-full"
                disabled={isIdentifyingGenre || !audioDataUri || audioDataUri === DEFAULT_AUDIO_DATA_URI}
              >
                {isIdentifyingGenre ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Tags className="mr-2 h-4 w-4" />}
                Identify Genre from Current Audio
              </Button>

              <Button onClick={handleRecordAudio} variant="outline" className="w-full">
                <Mic className="mr-2" /> Record Audio (Future Feature)
              </Button>
              <Button onClick={handleGenerateAudio} variant="outline" className="w-full">
                <Sparkles className="mr-2" /> Generate Audio with AI (Future Feature)
              </Button>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Note: Scanning audio for plagiarism is planned. AI Genre identification is experimental. Online search is a future feature.
        </p>
      </CardFooter>
    </Card>
  );
};

export default AudioInputHandler;

