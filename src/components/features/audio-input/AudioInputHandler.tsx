
"use client";

import React, { type FC, useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Mic, UploadCloud, FileAudio, Sparkles, Trash2, Tags, Loader2, Search, MicOff, ListMusic, CheckCircle2, PlayCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { analyzeAudioGenre, type AnalyzeAudioGenreOutput } from '@/ai/flows/analyze-audio-genre';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const DEFAULT_AUDIO_DATA_URI = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA";

interface StoredAudioItem {
  id: string;
  name: string;
  type: 'upload' | 'recording' | 'ai';
  dataUri: string;
  fileObject?: File; // For uploaded files, to potentially re-access original
  identifiedGenres?: string | null; // Store identified genres per item
}

interface AudioInputHandlerProps {
  onAudioPrepared: (audioDataUri: string) => void; // This prop might need re-evaluation or be used to set the initially selected audio.
}

const AudioInputHandler: FC<AudioInputHandlerProps> = ({ onAudioPrepared }) => {
  const [storedAudios, setStoredAudios] = useState<StoredAudioItem[]>([]);
  const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null);
  
  const [onlineSearchQuery, setOnlineSearchQuery] = useState<string>("");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isIdentifyingGenre, setIsIdentifyingGenre] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
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
    if (isRecording) stopCurrentRecording();

    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast({ title: "Invalid File Type", description: "Please upload a valid audio file.", variant: "destructive" });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const newAudioItem: StoredAudioItem = {
          id: crypto.randomUUID(),
          name: file.name,
          type: 'upload',
          dataUri: result,
          fileObject: file,
        };
        setStoredAudios(prev => [...prev, newAudioItem]);
        setSelectedAudioId(newAudioItem.id); // Auto-select new upload
        onAudioPrepared(result); // Notify parent about the new active audio
        toast({ title: "Audio Uploaded", description: `"${file.name}" added to stored audio.` });
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Clear input after processing
    }
  };

  const startRecording = async () => {
    if (isRecording) stopCurrentRecording(); // Stop any existing recording
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
      
      const options = { mimeType: 'audio/webm' }; // Try webm first
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        console.warn("mimeType audio/webm not supported, trying default");
        recorder = new MediaRecorder(stream); // Fallback to default mimeType
      }
      
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const recordingName = `Recording ${new Date().toLocaleString()}`;
          const newAudioItem: StoredAudioItem = {
            id: crypto.randomUUID(),
            name: recordingName,
            type: 'recording',
            dataUri: base64Audio,
          };
          setStoredAudios(prev => [...prev, newAudioItem]);
          setSelectedAudioId(newAudioItem.id); // Auto-select new recording
          onAudioPrepared(base64Audio); // Notify parent
          toast({ title: "Recording Complete", description: `"${recordingName}" added to stored audio.` });
        };
        reader.readAsDataURL(audioBlob);
        
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }
        setIsRecording(false);
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
  
  const handleRecordButtonClick = () => {
    if (isRecording) {
      stopCurrentRecording();
    } else {
      startRecording();
    }
  };

  const handleGenerateAIAudio = () => {
    toast({
      title: "AI Audio Generation Not Implemented",
      description: "This feature will be available in a future update. Generated audio will appear in the 'Stored Audio' list.",
      variant: "default",
    });
    // Future: const newAudioItem: StoredAudioItem = { id: crypto.randomUUID(), name: "AI Generated Audio 1", type: 'ai', dataUri: aiGeneratedDataUri };
    // setStoredAudios(prev => [...prev, newAudioItem]);
    // setSelectedAudioId(newAudioItem.id);
  };

  const handleDeleteAudioItem = (idToDelete: string) => {
    setStoredAudios(prev => prev.filter(item => item.id !== idToDelete));
    if (selectedAudioId === idToDelete) {
      setSelectedAudioId(null); // Clear selection if deleted item was selected
      onAudioPrepared(DEFAULT_AUDIO_DATA_URI); // Notify parent that no audio is selected
    }
    toast({ title: "Audio Item Deleted", description: "The audio item has been removed from the list." });
  };

  const handleSelectAudioItem = (item: StoredAudioItem) => {
    setSelectedAudioId(item.id);
    onAudioPrepared(item.dataUri); // Notify parent about the new active audio
  };

  const handleIdentifyGenre = async () => {
    const currentAudio = storedAudios.find(item => item.id === selectedAudioId);
    if (!currentAudio || currentAudio.dataUri === DEFAULT_AUDIO_DATA_URI) {
      toast({ title: "No Audio Selected", description: "Please select an audio item from the list to analyze.", variant: "default" });
      return;
    }

    setIsIdentifyingGenre(true);
    try {
      const result: AnalyzeAudioGenreOutput = await analyzeAudioGenre({ audioDataUri: currentAudio.dataUri });
      const genreText = result.genres.join(', ');
      
      // Update the identifiedGenres for the specific stored audio item
      setStoredAudios(prev => prev.map(item => 
        item.id === selectedAudioId ? { ...item, identifiedGenres: genreText } : item
      ));

      toast({
        title: "Audio Genre Analysis Complete!",
        description: (
          <div className="text-sm">
            <p className="font-semibold">Identified Genre(s) for "{currentAudio.name}": {genreText}</p>
            {result.confidence && <p>Confidence: {(result.confidence * 100).toFixed(0)}%</p>}
            {result.reasoning && <p className="text-xs mt-1 italic text-muted-foreground">Reasoning: {result.reasoning}</p>}
          </div>
        ),
        duration: 10000, 
      });
    } catch (error) {
      console.error("Error identifying audio genre:", error);
      let errorMessage = "An unknown error occurred during genre analysis.";
      if (error instanceof Error) errorMessage = error.message;
      else if (typeof error === 'string') errorMessage = error;
      
      if (errorMessage.includes("model is overloaded") || errorMessage.includes("503")) errorMessage = "The AI model for genre analysis is currently busy. Please try again later.";
      else if (errorMessage.includes("API key") || errorMessage.includes("auth")) errorMessage = "AI service configuration error for genre analysis.";
      else if (errorMessage.includes("Meaningful audio data") || errorMessage.includes("data seems too short")) errorMessage = "The audio data is too short or invalid for analysis.";

      toast({ title: "Genre Analysis Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsIdentifyingGenre(false);
    }
  };

  const handleOnlineSearch = () => {
    if (!onlineSearchQuery.trim()) {
      toast({ title: "Empty Search Query", description: "Please enter a search term.", variant: "default" });
      return;
    }
    toast({
      title: "Online Search Not Implemented",
      description: `Searching for "${onlineSearchQuery}" is a future feature.`,
      variant: "default",
    });
  };

  useEffect(() => {
    return () => {
      stopCurrentRecording(); // Cleanup on unmount
    };
  }, [stopCurrentRecording]);

  let micStatusMessage = "Recording requires microphone permission.";
  if (hasMicPermission === true) micStatusMessage = "Microphone access: Granted.";
  else if (hasMicPermission === false) micStatusMessage = "Microphone access: Denied. Check browser settings.";

  const currentSelectedAudio = storedAudios.find(item => item.id === selectedAudioId);

  return (
    <Card className="min-w-0 overflow-x-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileAudio className="text-primary" /> Audio Input</CardTitle>
        <CardDescription>
          Upload, record, or search for audio. Manage your audio sources below and select one for genre analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="audio-upload" className="flex items-center gap-1"><UploadCloud size={16} /> Upload Audio File</Label>
          <Input id="audio-upload" type="file" accept="audio/*" onChange={handleFileChange} ref={fileInputRef} disabled={isRecording} />
        </div>
        
        <div className="space-y-2">
          <Label className="flex items-center gap-1"><Mic size={16} /> Record Audio</Label>
          <Button onClick={handleRecordButtonClick} variant={isRecording ? "destructive" : "outline"} className="w-full" disabled={hasMicPermission === false && !isRecording}>
            {isRecording ? <MicOff className="mr-2 h-4 w-4 text-white animate-pulse" /> : <Mic className="mr-2 h-4 w-4" />}
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
        </div>

        <div className="space-y-2">
           <Label htmlFor="online-audio-search" className="flex items-center gap-1"><Search size={16}/> Search Online Audio (Future)</Label>
           <div className="flex items-center gap-2">
            <Input id="online-audio-search" type="text" placeholder="e.g., 'Acoustic guitar melody'" value={onlineSearchQuery} onChange={(e) => setOnlineSearchQuery(e.target.value)} className="flex-grow" disabled={isRecording}/>
            <Button variant="outline" onClick={handleOnlineSearch} disabled={isRecording}>
                <Search className="mr-2 h-4 w-4" /> Search
            </Button>
           </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1"><Sparkles size={16} /> AI Generated Audio (Future)</Label>
          <Button onClick={handleGenerateAIAudio} variant="outline" className="w-full" disabled={isRecording}>
            <Sparkles className="mr-2" /> Generate with AI
          </Button>
        </div>

        <Separator />

        <div>
          <h3 className="text-md font-semibold mb-2 flex items-center gap-1"><ListMusic size={18} /> Stored Audio</h3>
          {storedAudios.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No audio items stored yet. Upload or record audio to add to this list.</p>
          ) : (
            <ScrollArea className="h-[200px] w-full rounded-md border p-3 bg-muted/20">
              <div className="space-y-2">
                {storedAudios.map(item => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-2 rounded-md transition-colors ${selectedAudioId === item.id ? 'bg-primary/20 border border-primary' : 'hover:bg-primary/10'}`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                      {selectedAudioId === item.id ? <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" /> : <PlayCircle className="h-5 w-5 text-muted-foreground flex-shrink-0"/>}
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate" title={item.name}>{item.name}</span>
                        <Badge variant={selectedAudioId === item.id ? "default" : "secondary"} className="text-xs capitalize w-fit h-fit px-1.5 py-0.5">{item.type}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0 ml-2">
                      <Button 
                        variant={selectedAudioId === item.id ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => handleSelectAudioItem(item)}
                        className="h-8 px-2"
                      >
                         Select
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAudioItem(item.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        
        <Separator />
        
        <div>
            {currentSelectedAudio && (
                 <p className="text-sm text-muted-foreground mb-2">
                    Selected for analysis: <strong className="text-primary">{currentSelectedAudio.name}</strong>
                    {currentSelectedAudio.identifiedGenres && ` (Identified Genres: ${currentSelectedAudio.identifiedGenres})`}
                </p>
            )}
          <Button
            onClick={handleIdentifyGenre}
            variant="secondary"
            className="w-full"
            disabled={isIdentifyingGenre || !selectedAudioId}
          >
            {isIdentifyingGenre ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Tags className="mr-2 h-4 w-4" />}
            Identify Genre from Selected Audio
          </Button>
        </div>

      </CardContent>
      <CardFooter className="pt-4 border-t flex-col items-start text-xs text-muted-foreground space-y-1">
        <p>{micStatusMessage}</p>
        <p>Note: AI Genre identification is experimental. Online search & AI generation are future features.</p>
      </CardFooter>
    </Card>
  );
};

export default AudioInputHandler;

    