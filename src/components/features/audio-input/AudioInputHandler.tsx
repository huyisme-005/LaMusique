
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
  const [audioDataUri, setAudioDataUri] = useState<string>(DEFAULT_AUDIO_DATA_URI);
  const [onlineSearchQuery, setOnlineSearchQuery] = useState<string>("");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainCardViewportRef = useRef<HTMLDivElement>(null);

  const [isIdentifyingGenre, setIsIdentifyingGenre] = useState(false);
  const [identifiedGenresDisplay, setIdentifiedGenresDisplay] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [hasRecordedAudio, setHasRecordedAudio] = useState<boolean>(false); // New state for recorded audio
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const stopCurrentRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
    mediaRecorderRef.current = null;
  }, []);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isRecording) {
      stopCurrentRecording();
    }
    setHasRecordedAudio(false); // New upload clears any "recorded audio" state
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
        setAudioDataUri(DEFAULT_AUDIO_DATA_URI);
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
      setAudioDataUri(DEFAULT_AUDIO_DATA_URI);
      onAudioPrepared(DEFAULT_AUDIO_DATA_URI);
    }
  };

  const handleRemoveUploadedAudio = useCallback(() => {
    if (isRecording) { // Should not happen if UI logic is correct, but as a safeguard
      stopCurrentRecording();
    }
    setAudioFile(null);
    setAudioDataUri(DEFAULT_AUDIO_DATA_URI); // Reset to default, assumes uploaded file was the source
    setIdentifiedGenresDisplay(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onAudioPrepared(DEFAULT_AUDIO_DATA_URI);
    setHasRecordedAudio(false); // If removing an upload, ensure recorded state is also false.
    toast({
      title: "Uploaded Audio Cleared",
      description: "The uploaded audio file has been cleared.",
    });
  }, [isRecording, stopCurrentRecording, onAudioPrepared, toast]);

  const startRecording = async () => {
    // Clear any existing uploaded file and recorded audio state before starting a new recording
    if (fileInputRef.current) fileInputRef.current.value = "";
    setAudioFile(null);
    setAudioDataUri(DEFAULT_AUDIO_DATA_URI); // Temporarily set to default
    onAudioPrepared(DEFAULT_AUDIO_DATA_URI); // Notify parent
    setHasRecordedAudio(false);
    setIdentifiedGenresDisplay(null);
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
      
      const options = { mimeType: 'audio/webm' };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        console.warn("mimeType audio/webm not supported, trying default");
        recorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setAudioDataUri(base64Audio);
          onAudioPrepared(base64Audio);
          setAudioFile(null); 
          setHasRecordedAudio(true); // Mark that recorded audio is now active
          toast({ title: "Recording Complete", description: "Audio recorded successfully." });
        };
        reader.readAsDataURL(audioBlob);
        
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }
        setIsRecording(false); // setIsRecording should be before nullifying mediaRecorderRef
        mediaRecorderRef.current = null;
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
      setIsRecording(false);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      mediaRecorderRef.current = null;
    }
  };
  
  const stopRecordingAndProcess = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop(); 
    } else { // Fallback cleanup if recorder is not in 'recording' state but might still hold resources
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      setIsRecording(false);
      mediaRecorderRef.current = null;
    }
  }, []);
  
  const handleRecordButtonClick = () => {
    if (isRecording) {
      stopRecordingAndProcess();
    } else {
      startRecording();
    }
  };

  const handleDeleteRecordedAudio = useCallback(() => {
    stopCurrentRecording(); // Just in case
    setAudioDataUri(DEFAULT_AUDIO_DATA_URI);
    onAudioPrepared(DEFAULT_AUDIO_DATA_URI);
    setHasRecordedAudio(false);
    setIdentifiedGenresDisplay(null);
    toast({
      title: "Recorded Audio Cleared",
      description: "The recorded audio has been cleared.",
    });
  }, [onAudioPrepared, toast, stopCurrentRecording]);


  const handleGenerateAudio = () => {
    toast({
      title: "AI Audio Generation Not Implemented",
      description: "AI-powered audio generation will be available in a future update.",
      variant: "default",
    });
  };

  const handleIdentifyGenre = async () => {
    if (audioDataUri === DEFAULT_AUDIO_DATA_URI && !audioFile) { // More precise check
      toast({
        title: "No Audio to Analyze",
        description: "Please upload or record an audio file first.",
        variant: "default",
      });
      return;
    }

    setIsIdentifyingGenre(true);
    try {
      // Use audioDataUri if it's not default OR if there's no audioFile (implies recorded audio is the source)
      // Or if audioFile exists, it would have populated audioDataUri.
      const activeAudioUri = (audioDataUri !== DEFAULT_AUDIO_DATA_URI) ? audioDataUri : (audioFile ? audioDataUri : DEFAULT_AUDIO_DATA_URI);

      if (activeAudioUri === DEFAULT_AUDIO_DATA_URI) {
          toast({title:"Error", description: "Cannot identify genre from default audio.", variant: "destructive"});
          setIsIdentifyingGenre(false);
          return;
      }

      const result: AnalyzeAudioGenreOutput = await analyzeAudioGenre({ audioDataUri: activeAudioUri });
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

  useEffect(() => {
    return () => {
      stopCurrentRecording();
    };
  }, [stopCurrentRecording]);

  let micStatusMessage = "Recording requires microphone permission.";
  if (hasMicPermission === true) micStatusMessage = "Microphone access: Granted.";
  else if (hasMicPermission === false) micStatusMessage = "Microphone access: Denied. Please check browser settings and refresh.";

  const canIdentifyGenre = (audioFile || hasRecordedAudio) && audioDataUri !== DEFAULT_AUDIO_DATA_URI;

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
                    disabled={isRecording} // Disable if currently recording
                  />
                  {audioFile && ( // Only show remove for uploaded files
                    <Button variant="outline" size="icon" onClick={handleRemoveUploadedAudio} aria-label="Remove uploaded audio" disabled={isRecording}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                {audioFile && <p className="text-xs text-muted-foreground mt-1">Selected: {audioFile.name}</p>}
              </div>

              <Separator />
              
              <div className="space-y-2">
                {!isRecording && hasRecordedAudio ? (
                  <div className="flex items-center justify-between gap-2 p-2 border rounded-md bg-muted/50 h-10">
                    <div className="flex items-center gap-2">
                      <Mic className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Recorded Audio</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleDeleteRecordedAudio} aria-label="Delete recorded audio" className="h-7 w-7">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                   <Button
                    onClick={handleRecordButtonClick}
                    variant={isRecording ? "destructive" : "outline"}
                    className="w-full"
                    // Allow stopping even if permission was revoked mid-way, but not starting without initial check.
                    disabled={(hasMicPermission === false && !isRecording) || (audioFile !== null && !isRecording) } 
                  >
                    {isRecording ? <MicOff className="mr-2 h-4 w-4 text-white animate-pulse" /> : <Mic className="mr-2 h-4 w-4" />}
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </Button>
                )}
                 {audioFile !== null && !isRecording && !hasRecordedAudio && (
                    <p className="text-xs text-muted-foreground">Clear uploaded file to enable recording.</p>
                 )}
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
                disabled={isIdentifyingGenre || !canIdentifyGenre || isRecording}
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
