
"use client";

import React, { type FC, useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Mic, UploadCloud, FileAudio, Sparkles, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// A very short, silent WAV audio data URI to be used as a default
const DEFAULT_AUDIO_DATA_URI = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA";

interface AudioInputHandlerProps {
  onAudioPrepared: (audioDataUri: string) => void;
}

const AudioInputHandler: FC<AudioInputHandlerProps> = ({ onAudioPrepared }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainCardViewportRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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

  return (
    <Card className="min-w-0 overflow-x-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><FileAudio className="text-primary" /> Audio Input</CardTitle>
        </div>
        <CardDescription>
          Optionally, upload an audio file. Audio recording and AI generation are future features.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea orientation="horizontal" type="scroll" viewportRef={mainCardViewportRef}>
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
          Note: Scanning audio for plagiarism is a planned future feature.
        </p>
      </CardFooter>
    </Card>
  );
};

export default AudioInputHandler;
