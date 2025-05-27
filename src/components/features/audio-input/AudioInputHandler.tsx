
"use client";

import type { FC } from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mic, UploadCloud, FileAudio, ShieldAlert, ShieldCheck, AlertTriangle, Info, Sparkles, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { checkAudioPlagiarism, type CheckAudioPlagiarismInput, type CheckAudioPlagiarismOutput } from '@/ai/flows/check-audio-plagiarism';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

// A very short, silent WAV audio data URI to be used as a default
const DEFAULT_AUDIO_DATA_URI = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA";

const SCROLL_AMOUNT = 200;

interface AudioInputHandlerProps {
  onAudioPrepared: (audioDataUri: string) => void;
}

const AudioInputHandler: FC<AudioInputHandlerProps> = ({ onAudioPrepared }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [plagiarismResult, setPlagiarismResult] = useState<CheckAudioPlagiarismOutput | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mainCardViewportRef = useRef<HTMLDivElement>(null);
  const [canScrollMainLeft, setCanScrollMainLeft] = useState(false);
  const [canScrollMainRight, setCanScrollMainRight] = useState(false);

  const resultCardViewportRef = useRef<HTMLDivElement>(null);
  const [canScrollResultLeft, setCanScrollResultLeft] = useState(false);
  const [canScrollResultRight, setCanScrollResultRight] = useState(false);

  const createScrollHandler = useCallback((
    viewportRef: React.RefObject<HTMLDivElement>, 
    setCanScrollLeft: React.Dispatch<React.SetStateAction<boolean>>, 
    setCanScrollRight: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    return () => {
      const current = viewportRef.current;
      if (current) {
        setCanScrollLeft(current.scrollLeft > 0);
        setCanScrollRight(current.scrollLeft < current.scrollWidth - current.clientWidth - 1); // -1 to account for potential subpixel rendering issues
      } else {
        setCanScrollLeft(false);
        setCanScrollRight(false);
      }
    };
  }, []);

  const mainCheckScrollability = useCallback(createScrollHandler(mainCardViewportRef, setCanScrollMainLeft, setCanScrollMainRight), [createScrollHandler]);
  const resultCheckScrollability = useCallback(createScrollHandler(resultCardViewportRef, setCanScrollResultLeft, setCanScrollResultRight), [createScrollHandler]);
  

  useEffect(() => {
    mainCheckScrollability();
    const mainCurrent = mainCardViewportRef.current;
    if (mainCurrent) {
      const handleResize = () => mainCheckScrollability();
      window.addEventListener('resize', handleResize);
      const observer = new MutationObserver(mainCheckScrollability);
      observer.observe(mainCurrent, { childList: true, subtree: true, attributes: true, characterData: true });
      return () => {
        window.removeEventListener('resize', handleResize);
        observer.disconnect();
      };
    }
  }, [mainCheckScrollability]);

  useEffect(() => {
    resultCheckScrollability();
    const resultCurrent = resultCardViewportRef.current;
    if (resultCurrent) {
      const handleResize = () => resultCheckScrollability();
      window.addEventListener('resize', handleResize);
      const observer = new MutationObserver(resultCheckScrollability);
      observer.observe(resultCurrent, { childList: true, subtree: true, attributes: true, characterData: true });
      return () => {
        window.removeEventListener('resize', handleResize);
        observer.disconnect();
      };
    }
  }, [resultCheckScrollability, plagiarismResult]);


  const handleScroll = (direction: 'left' | 'right', viewportRef: React.RefObject<HTMLDivElement>) => {
    const current = viewportRef.current;
    if (current) {
      const checkScrollabilityFn = viewportRef === mainCardViewportRef ? mainCheckScrollability : resultCheckScrollability;
      current.scrollBy({
        left: direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
        behavior: 'smooth',
      });
      // Check scrollability after scroll animation (give it time to complete)
      setTimeout(checkScrollabilityFn, 300); 
    }
  };

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
      setPlagiarismResult(null); 
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
      fileInputRef.current.value = ""; // Reset the file input
    }
    onAudioPrepared(DEFAULT_AUDIO_DATA_URI);
    setPlagiarismResult(null); // Clear any previous plagiarism result
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
  
  const handlePlagiarismCheck = async () => {
    setIsLoading(true);
    setPlagiarismResult(null);

    const currentAudioDataForScan = audioDataUri || DEFAULT_AUDIO_DATA_URI; 
    
    try {
      const input: CheckAudioPlagiarismInput = { audioDataUri: currentAudioDataForScan };
      const result = await checkAudioPlagiarism(input);
      setPlagiarismResult(result);
      
      let toastDescription = result.isHighConcern ? "Potential concerns identified." : "Preliminary check found no major concerns.";
       if (currentAudioDataForScan === DEFAULT_AUDIO_DATA_URI && !audioFile) {
        toastDescription += " (Scan was run with default silent audio as no specific audio was provided).";
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
  
  const isAudioAvailableForScan = (audioFile !== null) || (audioDataUri !== null && audioDataUri !== DEFAULT_AUDIO_DATA_URI);


  return (
    <div className="space-y-6">
      <Card className="min-w-0">
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
                  <p className="text-sm">Optionally, upload an audio file. Microphone recording and AI audio generation are future features. An audio source is required to enable the plagiarism scan. The scan itself is a basic preliminary check.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>
            Optionally, upload an audio file. Microphone recording and AI audio generation are future features.
            Audio input is required to enable the plagiarism scan.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea orientation="horizontal" type="scroll" viewportRef={mainCardViewportRef} onViewportScroll={mainCheckScrollability} className="w-full">
            <div className="min-w-max p-6 pt-4">
               <div className="space-y-4 min-w-max">
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
                  <Sparkles className="mr-2" /> Generate Audio with AI (Future)
                </Button>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t gap-2">
           <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleScroll('left', mainCardViewportRef)}
            disabled={!canScrollMainLeft}
            aria-label="Scroll left"
            className="hidden sm:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button onClick={handlePlagiarismCheck} disabled={isLoading || !isAudioAvailableForScan} className="w-full sm:w-auto flex-grow">
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <ShieldAlert className="mr-2" />} 
            Scan for Potential Plagiarism
          </Button>
           <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleScroll('right', mainCardViewportRef)}
            disabled={!canScrollMainRight}
            aria-label="Scroll right"
            className="hidden sm:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>

      {plagiarismResult && (
        <Card className="min-w-0 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {plagiarismResult.isHighConcern ? <AlertTriangle className="text-destructive" /> : <ShieldCheck className="text-green-500" />}
              Plagiarism Scan Result
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea orientation="horizontal" type="scroll" viewportRef={resultCardViewportRef} onViewportScroll={resultCheckScrollability} className="w-full">
              <div className="min-w-max p-6">
                <div className="space-y-2 min-w-max">
                  <Alert variant={plagiarismResult.isHighConcern ? "destructive" : "default"}>
                    <AlertTitle>
                      {plagiarismResult.isHighConcern ? "Potential Concerns Identified" : "Preliminary Check Completed"}
                    </AlertTitle>
                    <AlertDescription className="whitespace-pre-wrap">
                      {plagiarismResult.potentialConcerns}
                    </AlertDescription>
                  </Alert>
                  <p className="text-xs text-muted-foreground pt-1">
                    <strong>Disclaimer:</strong> This is an automated, preliminary check with limitations in analyzing complex musical structures from raw audio. It should not be considered a definitive legal assessment.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-4 border-t">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleScroll('left', resultCardViewportRef)}
              disabled={!canScrollResultLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-xs text-muted-foreground">Scroll for details</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleScroll('right', resultCardViewportRef)}
              disabled={!canScrollResultRight}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default AudioInputHandler;
    
