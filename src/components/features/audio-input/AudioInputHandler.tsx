/**
 * @fileOverview AudioInputHandler component for La Musique.
 * This component manages all audio input functionalities: uploading audio files,
 * recording audio via microphone, and managing a list of "Stored Audio" items.
 * Each stored item can be selected for genre analysis, played back, renamed, or deleted.
 * It also provides placeholders for future AI audio generation and online search.
 *
 * @exports AudioInputHandler - The React functional component for handling audio inputs.
 */
"use client";

import React, { type FC, useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Mic, UploadCloud, FileAudio, Sparkles, Trash2, Tags, Loader2, Search, MicOff, ListMusic, CheckCircle2, Play, Pause, Pencil } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { analyzeAudioGenre, type AnalyzeAudioGenreOutput } from '@/ai/flows/analyze-audio-genre';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const DEFAULT_AUDIO_DATA_URI = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA"; // Minimal valid WAV header

interface StoredAudioItem {
  id: string;
  name: string;
  type: 'upload' | 'recording' | 'ai';
  dataUri: string;
  fileObject?: File; 
  identifiedGenres?: string | null;
  analysisReasoning?: string | null;
  analysisConfidence?: number | null;
}

interface AudioInputHandlerProps {
  onAudioPrepared: (audioDataUri: string) => void; // Callback when an audio source is selected or prepared.
}

const AudioInputHandler: FC<AudioInputHandlerProps> = ({ onAudioPrepared }) => {
  const [storedAudios, setStoredAudios] = useState<StoredAudioItem[]>([]);
  const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  
  const [onlineSearchQuery, setOnlineSearchQuery] = useState<string>("");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  
  const [isIdentifyingGenre, setIsIdentifyingGenre] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const stopCurrentActivities = useCallback(() => {
    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop(); 
    } else if (mediaStreamRef.current) { // Ensure stream is stopped if recording didn't start but stream was acquired
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        if (isRecording) setIsRecording(false); // Reset recording state if it was prematurely true
    }
    
    // Stop playback
    if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.src = ''; 
      audioPlayerRef.current.load();    
    }
    if (playingAudioId) {
        setPlayingAudioId(null);
    }
  }, [playingAudioId, isRecording]); // Added isRecording

  // Initialize Audio Player and its event listeners
  useEffect(() => {
    if (!audioPlayerRef.current) { // Create player only once
      const player = new Audio();
      player.volume = 1;

      const handleEnded = () => setPlayingAudioId(null);
      const handleError = (e: Event) => {
        console.error('Audio player error event:', e);
        const errorTarget = e.target as HTMLAudioElement;
        const mediaError = errorTarget.error;
        let errorMessage = "The audio could not be played.";

        if (mediaError) {
            switch (mediaError.code) {
                case MediaError.MEDIA_ERR_ABORTED: errorMessage = 'Playback aborted by the user.'; break;
                case MediaError.MEDIA_ERR_NETWORK: errorMessage = 'A network error caused playback to fail.'; break;
                case MediaError.MEDIA_ERR_DECODE: errorMessage = 'The audio could not be decoded. The format might be corrupted or unsupported.'; break;
                case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED: errorMessage = 'The audio format is not supported, or the audio data is invalid/empty.'; break;
                default: errorMessage = `An unknown playback error occurred (Code: ${mediaError.code}).`;
            }
        } else if ((e as ErrorEvent).message) { 
          errorMessage = (e as ErrorEvent).message;
        }
        
        const currentPlayingItem = storedAudios.find(item => item.id === playingAudioId); // Access from component scope
        toast({
          title: "Playback Error",
          description: `Could not play "${currentPlayingItem?.name || 'selected audio'}". ${errorMessage}`,
          variant: "destructive",
          duration: 7000,
        });
        setPlayingAudioId(null); 
      };

      player.addEventListener('ended', handleEnded);
      player.addEventListener('error', handleError);
      audioPlayerRef.current = player;

      return () => { // Cleanup on component unmount
        if (audioPlayerRef.current) {
          audioPlayerRef.current.removeEventListener('ended', handleEnded);
          audioPlayerRef.current.removeEventListener('error', handleError);
          audioPlayerRef.current.pause();
          audioPlayerRef.current.removeAttribute('src'); 
          audioPlayerRef.current.load(); 
        }
      };
    }
  }, [toast, storedAudios, playingAudioId]); // Dependencies for accessing state within listeners.

  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    stopCurrentActivities();
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
        if (result && result.length > 200 && result !== DEFAULT_AUDIO_DATA_URI) { // Basic check for valid data URI
            const newAudioItem: StoredAudioItem = {
              id: crypto.randomUUID(),
              name: file.name,
              type: 'upload',
              dataUri: result,
              fileObject: file,
            };
            setStoredAudios(prev => [newAudioItem, ...prev]);
            setSelectedAudioId(newAudioItem.id);
            onAudioPrepared(result); 
            toast({ title: "Audio Uploaded", description: `"${file.name}" added to stored audio.` });
        } else {
            toast({ title: "File Read Error", description: "Could not read a valid audio data URI from the file.", variant: "destructive" });
        }
      };
      reader.onerror = () => {
        toast({ title: "File Read Error", description: "An error occurred while reading the file.", variant: "destructive" });
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  const startRecording = async () => {
    stopCurrentActivities();
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
      
      // Try to find a supported MIME type
      const mimeTypesToTry = [
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus',
        'audio/webm',
        'audio/ogg',
        // Add other types if needed, e.g., 'audio/mp4' if AAC is desired and supported
      ];
      let supportedMimeType: string | undefined = undefined;
      for (const mimeType of mimeTypesToTry) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          supportedMimeType = mimeType;
          break;
        }
      }
      console.log("Using MIME type for recording:", supportedMimeType || "browser default");

      const options = supportedMimeType ? { mimeType: supportedMimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = []; 

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const actualMimeType = mediaRecorderRef.current?.mimeType || audioChunksRef.current[0]?.type || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMimeType });
        
        console.log('Recorded Audio Blob size:', audioBlob.size, 'type:', audioBlob.type);

        if (audioBlob.size < 1000 && audioChunksRef.current.length === 0) { 
            toast({
                title: "Recording Issue: No Data Captured",
                description: "No significant audio data was captured. Please check microphone permissions, ensure your mic is not muted, is selected correctly in browser/OS settings, and try speaking louder or closer to the microphone.",
                variant: "destructive",
                duration: 10000,
            });
        } else if (audioBlob.size < 1000) {
             toast({
                title: "Recording Issue: Very Little Data",
                description: "Very little audio data was captured. The recording might be very short or mostly silent.",
                variant: "default",
                duration: 7000,
            });
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          console.log('Recorded base64Audio length:', base64Audio.length, 'starts with:', base64Audio.substring(0, 100));
          if (base64Audio && base64Audio.length > 200 && base64Audio !== DEFAULT_AUDIO_DATA_URI) { // Check if base64Audio is valid
              const recordingName = `Recording ${new Date().toLocaleString()}`;
              const newAudioItem: StoredAudioItem = {
                id: crypto.randomUUID(),
                name: recordingName,
                type: 'recording',
                dataUri: base64Audio,
              };
              setStoredAudios(prev => [newAudioItem, ...prev]);
              setSelectedAudioId(newAudioItem.id);
              onAudioPrepared(base64Audio); 
              toast({ title: "Recording Complete", description: `"${recordingName}" added to stored audio.` });
          } else {
              toast({ title: "Recording Processing Error", description: "Could not process the recorded audio data.", variant: "destructive"});
          }
        };
        reader.onerror = () => {
          toast({ title: "Recording Processing Error", description: "Error reading recorded audio data.", variant: "destructive"});
        };
        reader.readAsDataURL(audioBlob);
        
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }
        setIsRecording(false);
      };
      
      recorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        let errorName = (event as any)?.error?.name || "UnknownRecorderError";
        toast({
          title: "Recording Error",
          description: `An error occurred during recording: ${errorName}. Please try again.`,
          variant: "destructive",
        });
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        setIsRecording(false);
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
        } else if (err.name === "NotReadableError" || err.name === "OverconstrainedError") { 
            message = "Microphone is already in use, a hardware error occurred, or the requested settings (e.g. sample rate) are not supported.";
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
    }
  };
  
  const handleRecordButtonClick = () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop(); 
      }
    } else {
      startRecording();
    }
  };

  const handleGenerateAIAudio = () => {
    stopCurrentActivities();
    toast({
      title: "AI Audio Generation Not Implemented",
      description: "This feature will be available in a future update. Generated audio will appear in the 'Stored Audio' list.",
      variant: "default",
    });
    // Example of how to add an AI audio (placeholder):
    // const newAIAudio: StoredAudioItem = {
    //   id: crypto.randomUUID(),
    //   name: "AI Generated Sample",
    //   type: 'ai',
    //   dataUri: DEFAULT_AUDIO_DATA_URI, // Replace with actual AI audio data URI
    // };
    // setStoredAudios(prev => [newAIAudio, ...prev]);
    // setSelectedAudioId(newAIAudio.id);
    // onAudioPrepared(newAIAudio.dataUri);
  };

  const handleDeleteAudioItem = (idToDelete: string) => {
    const itemToDelete = storedAudios.find(item => item.id === idToDelete);
    if (itemToDelete && playingAudioId === idToDelete && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.src = ''; 
      setPlayingAudioId(null);
    }
    setStoredAudios(prev => prev.filter(item => item.id !== idToDelete));
    if (selectedAudioId === idToDelete) {
      setSelectedAudioId(null);
      onAudioPrepared(DEFAULT_AUDIO_DATA_URI); 
    }
    toast({ title: "Audio Item Deleted", description: `"${itemToDelete?.name || 'Item'}" has been removed.` });
  };

  const handleRenameAudioItem = (idToRename: string) => {
    const itemToRename = storedAudios.find(item => item.id === idToRename);
    if (!itemToRename) return;

    const newName = window.prompt("Enter new name for the audio item:", itemToRename.name);
    if (newName && newName.trim() !== "") {
      setStoredAudios(prev => 
        prev.map(item => 
          item.id === idToRename ? { ...item, name: newName.trim() } : item
        )
      );
      toast({ title: "Audio Renamed", description: `"${itemToRename.name}" renamed to "${newName.trim()}".` });
    } else if (newName !== null) { 
      toast({ title: "Rename Cancelled", description: "Audio name cannot be empty.", variant: "default" });
    }
  };

  const handleSelectAudioItem = (item: StoredAudioItem) => {
    setSelectedAudioId(item.id);
    onAudioPrepared(item.dataUri); 
  };

  const handlePlayPauseAudio = (item: StoredAudioItem) => {
    if (!audioPlayerRef.current) return;

    const currentItemVersion = storedAudios.find(i => i.id === item.id); // Get latest version from state
    if (!currentItemVersion || !currentItemVersion.dataUri || currentItemVersion.dataUri === DEFAULT_AUDIO_DATA_URI || currentItemVersion.dataUri.length < 200) {
      toast({
          title: "Cannot Play Audio",
          description: "This audio item is a placeholder, empty, or invalid and cannot be played.",
          variant: "default"
      });
      return;
    }
  
    if (playingAudioId === item.id) { 
      audioPlayerRef.current.pause();
      setPlayingAudioId(null);
    } else { 
      if (playingAudioId && audioPlayerRef.current && !audioPlayerRef.current.paused) { 
        audioPlayerRef.current.pause();
      }
      console.log(`Attempting to play: ${currentItemVersion.name}, URI starts with: ${currentItemVersion.dataUri.substring(0,100)}`);
      
      // Reset src and load before setting new source
      audioPlayerRef.current.src = '';
      audioPlayerRef.current.load();

      audioPlayerRef.current.src = currentItemVersion.dataUri;
      audioPlayerRef.current.load(); 
      const playPromise = audioPlayerRef.current.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
          setPlayingAudioId(item.id);
        })
        .catch(err => {
          console.error(`Error playing audio ${item.name}:`, err);
          setPlayingAudioId(null);
          let playErrorMessage = "Could not play the audio.";
          if (err instanceof Error) {
            if (err.name === "NotAllowedError") {
                playErrorMessage = "Playback was prevented. This might be due to browser autoplay policies. Try interacting with the page first.";
            } else if (err.name === "NotSupportedError") {
                playErrorMessage = "The audio format might not be supported by your browser, or the audio data is corrupted.";
            } else {
                playErrorMessage = err.message;
            }
          }
          toast({
            title: "Playback Error",
            description: `Could not play "${item.name}". ${playErrorMessage}`,
            variant: "destructive",
          });
        });
      }
    }
  };

  const handleIdentifyGenre = async () => {
    const audioToAnalyze = storedAudios.find(item => item.id === selectedAudioId);
    if (!audioToAnalyze || !audioToAnalyze.dataUri || audioToAnalyze.dataUri === DEFAULT_AUDIO_DATA_URI || audioToAnalyze.dataUri.length < 200) {
      toast({ title: "No Valid Audio Selected", description: "Please select a valid audio item from the list to analyze.", variant: "default" });
      return;
    }

    setIsIdentifyingGenre(true);
    try {
      const result: AnalyzeAudioGenreOutput = await analyzeAudioGenre({ audioDataUri: audioToAnalyze.dataUri });
      const genreText = result.genres.join(', ');
      
      setStoredAudios(prev => prev.map(item => 
        item.id === selectedAudioId ? { 
            ...item, 
            identifiedGenres: genreText,
            analysisReasoning: result.reasoning,
            analysisConfidence: result.confidence 
        } : item
      ));

      toast({
        title: "Audio Genre Analysis Complete!",
        description: (
          <div className="text-sm">
            <p className="font-semibold">Identified Genre(s) for "{audioToAnalyze.name}": {genreText}</p>
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
      else if (errorMessage.includes("Meaningful audio data") || errorMessage.includes("data seems too short")) errorMessage = "The audio data is too short or invalid for analysis. Try recording for a longer duration.";

      toast({ title: "Genre Analysis Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsIdentifyingGenre(false);
    }
  };

  const handleOnlineSearch = () => {
    stopCurrentActivities();
    if (!onlineSearchQuery.trim()) {
      toast({ title: "Empty Search Query", description: "Please enter a search term.", variant: "default" });
      return;
    }
    toast({
      title: "Online Search Not Implemented",
      description: `Searching for "${onlineSearchQuery}" is a future feature. Results would appear in 'Stored Audio'.`,
      variant: "default",
    });
  };

  // Main cleanup effect
  useEffect(() => {
    return () => {
      stopCurrentActivities(); 
       if (mediaStreamRef.current) { // Additional cleanup for mediaStream
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [stopCurrentActivities]);

  let micStatusMessage = "Recording requires microphone permission.";
  if (hasMicPermission === true) micStatusMessage = "Microphone access: Granted.";
  else if (hasMicPermission === false) micStatusMessage = "Microphone access: Denied. Check browser settings.";

  const currentSelectedAudio = storedAudios.find(item => item.id === selectedAudioId);

  return (
    <Card className="min-w-0 overflow-x-auto"> 
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileAudio className="text-primary" /> Audio Input</CardTitle>
        <CardDescription>
          Upload, record, or search for audio. Manage your audio sources below. Select an audio to enable genre identification or playback.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="audio-upload" className="flex items-center gap-1"><UploadCloud size={16} /> Upload Audio File</Label>
          <Input id="audio-upload" type="file" accept="audio/*" onChange={handleFileChange} ref={fileInputRef} disabled={isRecording} />
        </div>
        
        <div className="space-y-2">
          <Label className="flex items-center gap-1"><Mic size={16} /> Record Audio</Label>
          <Button onClick={handleRecordButtonClick} variant={isRecording ? "destructive" : "outline"} className="w-full" disabled={(hasMicPermission === false && !isRecording) || isIdentifyingGenre}>
            {isRecording ? <MicOff className="mr-2 h-4 w-4 text-white animate-pulse" /> : <Mic className="mr-2 h-4 w-4" />}
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
        </div>

        <div className="space-y-2">
           <Label htmlFor="online-audio-search" className="flex items-center gap-1"><Search size={16}/> Search Online Audio (Future)</Label>
           <div className="flex items-center gap-2">
            <Input id="online-audio-search" type="text" placeholder="e.g., 'Acoustic guitar melody'" value={onlineSearchQuery} onChange={(e) => setOnlineSearchQuery(e.target.value)} className="flex-grow" disabled={isRecording || isIdentifyingGenre}/>
            <Button variant="outline" onClick={handleOnlineSearch} disabled={isRecording || isIdentifyingGenre}>
                <Search className="mr-2 h-4 w-4" /> Search
            </Button>
           </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1"><Sparkles size={16} /> AI Generated Audio (Future)</Label>
          <Button onClick={handleGenerateAIAudio} variant="outline" className="w-full" disabled={isRecording || isIdentifyingGenre}>
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
                       <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePlayPauseAudio(item)}
                          className={`h-7 w-7 flex-shrink-0 ${playingAudioId === item.id ? 'text-red-500 hover:bg-red-500/10' : 'text-green-600 hover:bg-green-600/10'}`}
                          disabled={item.dataUri === DEFAULT_AUDIO_DATA_URI || item.dataUri.length < 200 || isRecording}
                          title={playingAudioId === item.id ? "Pause" : "Play"}
                        >
                          {playingAudioId === item.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
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
                        className="h-8 px-2 text-xs"
                        disabled={isRecording}
                      >
                         {selectedAudioId === item.id ? <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> : null}
                         Select
                      </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleRenameAudioItem(item.id)} className="h-8 w-8 text-blue-600 hover:bg-blue-600/10" title="Rename" disabled={isRecording}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAudioItem(item.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Delete" disabled={isRecording}>
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
            {currentSelectedAudio && currentSelectedAudio.dataUri !== DEFAULT_AUDIO_DATA_URI && currentSelectedAudio.dataUri.length > 200 && (
                 <div className="text-sm text-muted-foreground mb-2 space-y-1">
                    <p>Selected for analysis: <strong className="text-primary">{currentSelectedAudio.name}</strong></p>
                    {currentSelectedAudio.identifiedGenres && (
                        <div className="text-xs">Identified Genres: <Badge variant="outline">{currentSelectedAudio.identifiedGenres}</Badge></div>
                    )}
                     {currentSelectedAudio.analysisConfidence && (
                        <p className="text-xs">Confidence: {(currentSelectedAudio.analysisConfidence * 100).toFixed(0)}%</p>
                    )}
                    {currentSelectedAudio.analysisReasoning && (
                        <p className="text-xs italic">Reasoning: {currentSelectedAudio.analysisReasoning}</p>
                    )}
                </div>
            )}
          <Button
            onClick={handleIdentifyGenre}
            variant="secondary"
            className="w-full"
            disabled={isIdentifyingGenre || !selectedAudioId || storedAudios.find(item => item.id === selectedAudioId)?.dataUri === DEFAULT_AUDIO_DATA_URI || (storedAudios.find(item => item.id === selectedAudioId)?.dataUri.length || 0) < 200 || isRecording}
          >
            {isIdentifyingGenre ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Tags className="mr-2 h-4 w-4" />}
            Identify Genre from Selected Audio
          </Button>
        </div>

      </CardContent>
      <CardFooter className="pt-4 border-t flex-col items-start text-xs text-muted-foreground space-y-1">
        <p>{micStatusMessage}</p>
        <p>Note: AI Genre identification is experimental. Online search & AI generation are future features.</p>
        <p>Playback uses your browser's built-in audio capabilities. Ensure your device volume is up and the correct audio output is selected in your OS.</p>
      </CardFooter>
    </Card>
  );
};

export default AudioInputHandler;
    
