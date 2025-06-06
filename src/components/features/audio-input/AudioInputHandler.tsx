
"use client";

import React, { type FC, useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Mic, UploadCloud, FileAudio, Sparkles, Trash2, Tags, Loader2, Search, MicOff } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { analyzeAudioGenre, type AnalyzeAudioGenreOutput } from '@/ai/flows/analyze-audio-genre';
import { Separator } from '@/components/ui/separator';

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

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null); // null: unknown, true: granted, false: denied
  const mediaStreamRef = useRef<MediaStream | null>(null);


  const stopCurrentRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
    setMediaRecorder(null);
  };
  
  const setMediaRecorder = (recorder: MediaRecorder | null) => {
    mediaRecorderRef.current = recorder;
  }


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isRecording) {
      stopCurrentRecording();
    }
    setIdentifiedGenresDisplay(null);
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
    if (isRecording) {
      stopCurrentRecording();
    }
    setAudioFile(null);
    setAudioDataUri(null);
    setIdentifiedGenresDisplay(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onAudioPrepared(DEFAULT_AUDIO_DATA_URI);
    toast({
      title: "Audio Cleared",
      description: "The uploaded audio file has been removed.",
    });
  };

  const startRecording = async () => {
    handleRemoveAudio(); // Clear any existing audio first
    setHasMicPermission(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({ title: "Recording Error", description: "Audio recording is not supported by your browser.", variant: "destructive" });
      setHasMicPermission(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setHasMicPermission(true);
      
      const options = { mimeType: 'audio/webm' }; // Specify a common mimeType
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        // Fallback if specified mimeType is not supported (though webm is widely supported)
        console.warn("mimeType audio/webm not supported, trying default");
        recorder = new MediaRecorder(stream);
      }

      setMediaRecorder(recorder);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setAudioDataUri(base64Audio);
          onAudioPrepared(base64Audio);
          toast({ title: "Recording Complete", description: "Audio recorded successfully." });
        };
        reader.readAsDataURL(audioBlob);
        
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }
        setIsRecording(false); // Ensure isRecording is false after stop
      };

      recorder.start();
      setIsRecording(true);
      toast({ title: "Recording Started", description: "Speak into your microphone." });
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setHasMicPermission(false);
      let message = "Could not access microphone. Please ensure permission is granted.";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          message = "Microphone permission denied. Please enable it in your browser settings and refresh.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          message = "No microphone found. Please connect a microphone and try again.";
        } else if (err.name === "NotReadableError") {
            message = "Microphone is already in use or a hardware error occurred.";
        } else {
          message = `Microphone access error: ${err.message}`;
        }
      }
      toast({ title: "Microphone Error", description: message, variant: "destructive", duration: 7000 });
      setIsRecording(false); // Ensure isRecording is false on error
    }
  };

  const stopRecordingAndProcess = () => { // Renamed for clarity
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop(); // This will trigger 'onstop' which handles cleanup and processing
    } else {
      // If somehow stop is called when not actively recording but mediaRecorder exists
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      setIsRecording(false);
    }
    // Note: setIsRecording(false) is now primarily handled in onstop or error paths of startRecording
  };
  
  const handleRecordButtonClick = () => {
    if (isRecording) {
      stopRecordingAndProcess();
    } else {
      startRecording();
    }
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
        description: "Please upload or record an audio file first.",
        variant: "default",
      });
      return;
    }

    setIsIdentifyingGenre(true);
    // Keep existing identifiedGenresDisplay until new result or error
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
        errorMessage = "The provided audio data is too short or invalid for genre analysis. Please upload/record a more substantial audio file.";
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
      description: `Searching for "${onlineSearchQuery}" is a future feature. For now, please upload or record audio directly.`,
      variant: "default",
    });
  };

  // Cleanup effect for active recording when component unmounts
  useEffect(() => {
    return () => {
      stopCurrentRecording();
    };
  }, []);


  let micStatusMessage = "Recording requires microphone permission.";
  if (hasMicPermission === true) micStatusMessage = "Microphone access: Granted.";
  else if (hasMicPermission === false) micStatusMessage = "Microphone access: Denied. Please check browser settings and refresh.";


  return (
    <Card className="min-w-0 overflow-x-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><FileAudio className="text-primary" /> Audio Input</CardTitle>
        </div>
        <CardDescription>
          Upload, record, or search (future). Then, identify its genre.
          {identifiedGenresDisplay && <span className="block mt-1 text-xs">Previously identified genres for current audio: {identifiedGenresDisplay}</span>}
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
                    disabled={isRecording}
                  />
                  {audioFile && (
                    <Button variant="outline" size="icon" onClick={handleRemoveAudio} aria-label="Remove audio file" disabled={isRecording}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                {audioFile && <p className="text-xs text-muted-foreground mt-1">Selected: {audioFile.name}</p>}
              </div>

              <Separator />
              
              <Button
                onClick={handleRecordButtonClick}
                variant="outline"
                className="w-full"
                disabled={hasMicPermission === false}
              >
                {isRecording ? <MicOff className="mr-2 h-4 w-4 text-destructive animate-pulse" /> : <Mic className="mr-2 h-4 w-4" />}
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>

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
                    disabled={isRecording}
                  />
                  <Button variant="outline" onClick={handleOnlineSearch} disabled={isRecording}>
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
                disabled={isIdentifyingGenre || !audioDataUri || audioDataUri === DEFAULT_AUDIO_DATA_URI || isRecording}
              >
                {isIdentifyingGenre ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Tags className="mr-2 h-4 w-4" />}
                Identify Genre from Current Audio
              </Button>

              <Button onClick={handleGenerateAudio} variant="outline" className="w-full" disabled={isRecording}>
                <Sparkles className="mr-2" /> Generate Audio with AI (Future Feature)
              </Button>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-4 border-t flex-col items-start text-xs text-muted-foreground space-y-1">
        <p>{micStatusMessage}</p>
        <p>
          Note: AI Genre identification is experimental. Online search & AI generation are future features.
        </p>
      </CardFooter>
    </Card>
  );
};

export default AudioInputHandler;
