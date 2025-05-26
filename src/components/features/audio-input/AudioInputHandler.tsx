
"use client";

import type { FC } from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Textarea removed as Associated Lyrics is gone
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mic, UploadCloud, FileAudio, ShieldAlert, ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import { checkAudioPlagiarism, type CheckAudioPlagiarismInput, type CheckAudioPlagiarismOutput } from '@/ai/flows/check-audio-plagiarism';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// A very short, silent WAV audio data URI to be used as a default
const DEFAULT_AUDIO_DATA_URI = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA";

interface AudioInputHandlerProps {
  onAudioPrepared: (audioDataUri: string) => void; // Lyrics parameter removed
}

const AudioInputHandler: FC<AudioInputHandlerProps> = ({ onAudioPrepared }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  // lyrics state removed
  const [plagiarismResult, setPlagiarismResult] = useState<CheckAudioPlagiarismOutput | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        return;
      }
      setAudioFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAudioDataUri(result);
        onAudioPrepared(result); // lyrics removed from call
      };
      reader.readAsDataURL(file);
      setPlagiarismResult(null); 
    }
  };

  const handleRecordAudio = () => {
    toast({
      title: "Recording Not Implemented",
      description: "Microphone recording functionality will be available in a future update.",
      variant: "default",
    });
  };
  
  const handlePlagiarismCheck = async () => {
    setIsLoading(true);
    setPlagiarismResult(null);

    const currentAudioDataUri = audioDataUri || DEFAULT_AUDIO_DATA_URI;
    let isDefaultAudioUsed = !audioDataUri;

    try {
      // Input only contains audioDataUri, lyrics are no longer sourced from this component.
      // The checkAudioPlagiarism flow itself has lyrics as optional.
      const input: CheckAudioPlagiarismInput = { audioDataUri: currentAudioDataUri };
      
      const result = await checkAudioPlagiarism(input);
      setPlagiarismResult(result);
      
      let toastDescription = result.isHighConcern ? "Potential concerns identified." : "Preliminary check found no major concerns.";
      if (isDefaultAudioUsed) {
        toastDescription += " (Used default silent audio as no input was provided).";
      }

      toast({
        title: "Plagiarism Check Complete",
        description: toastDescription,
      });

    } catch (error) {
      console.error("Error checking plagiarism:", error);
      toast({
        title: "Error Checking Plagiarism",
        description: (error as Error).message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><FileAudio className="text-primary" /> Audio Input</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">Upload audio or use the mic (future) to analyze. If no audio is provided, a silent default is used for scans. The scan is a basic check.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>Upload an audio file. If no audio is uploaded, a default silent placeholder will be used for analysis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="audio-upload">Upload Audio File</Label>
            <Input 
              id="audio-upload" 
              type="file" 
              accept="audio/*" 
              onChange={handleFileChange} 
              ref={fileInputRef}
              className="mt-1"
            />
            {audioFile && <p className="text-xs text-muted-foreground mt-1">Selected: {audioFile.name}</p>}
          </div>
          
          <Button onClick={handleRecordAudio} variant="outline" className="w-full">
            <Mic className="mr-2" /> Record Audio (Future Feature)
          </Button>

          {/* Associated Lyrics section removed */}
        </CardContent>
        <CardFooter>
          <Button onClick={handlePlagiarismCheck} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <ShieldAlert className="mr-2" />} 
            Scan for Potential Plagiarism
          </Button>
        </CardFooter>
      </Card>

      {plagiarismResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {plagiarismResult.isHighConcern ? <AlertTriangle className="text-destructive" /> : <ShieldCheck className="text-green-500" />}
              Plagiarism Scan Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant={plagiarismResult.isHighConcern ? "destructive" : "default"}>
              <AlertTitle>
                {plagiarismResult.isHighConcern ? "Potential Concerns Identified" : "Preliminary Check Completed"}
              </AlertTitle>
              <AlertDescription className="whitespace-pre-wrap">
                {plagiarismResult.potentialConcerns}
              </AlertDescription>
            </Alert>
            <p className="text-xs text-muted-foreground mt-3">
              <strong>Disclaimer:</strong> This is an automated, preliminary check with limitations in analyzing complex musical structures from raw audio. It should not be considered a definitive legal assessment.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AudioInputHandler;
