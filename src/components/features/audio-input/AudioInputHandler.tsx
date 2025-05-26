
"use client";

import type { FC } from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mic, UploadCloud, FileAudio, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { checkAudioPlagiarism, type CheckAudioPlagiarismInput, type CheckAudioPlagiarismOutput } from '@/ai/flows/check-audio-plagiarism';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


interface AudioInputHandlerProps {
  onAudioPrepared: (audioDataUri: string, lyrics?: string) => void;
}

const AudioInputHandler: FC<AudioInputHandlerProps> = ({ onAudioPrepared }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState<string>("");
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
        return;
      }
      setAudioFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAudioDataUri(result);
        onAudioPrepared(result, lyrics || undefined);
      };
      reader.readAsDataURL(file);
      setPlagiarismResult(null); // Reset plagiarism result when new file is uploaded
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
    if (!audioDataUri) {
      toast({
        title: "No Audio Uploaded",
        description: "Please upload an audio file before checking for plagiarism.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setPlagiarismResult(null);
    try {
      const input: CheckAudioPlagiarismInput = { audioDataUri };
      if (lyrics.trim()) {
        input.lyrics = lyrics.trim();
      }
      const result = await checkAudioPlagiarism(input);
      setPlagiarismResult(result);
      toast({
        title: "Plagiarism Check Complete",
        description: result.isHighConcern ? "Potential concerns identified." : "Preliminary check found no major concerns.",
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
          <CardTitle className="flex items-center gap-2"><FileAudio className="text-primary" /> Audio Input & Analysis</CardTitle>
          <CardDescription>Upload or record audio, provide optional lyrics, and perform a preliminary plagiarism scan.</CardDescription>
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

          <div>
            <Label htmlFor="associated-lyrics">Associated Lyrics (Optional)</Label>
            <Textarea 
              id="associated-lyrics"
              value={lyrics}
              onChange={(e) => {
                setLyrics(e.target.value);
                if(audioDataUri) onAudioPrepared(audioDataUri, e.target.value || undefined);
              }}
              placeholder="If your audio contains lyrics, or if you want to check specific lyrics with this audio, paste them here..."
              className="min-h-[100px] mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Providing lyrics can improve the plagiarism scan accuracy.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handlePlagiarismCheck} disabled={isLoading || !audioDataUri} className="w-full">
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
