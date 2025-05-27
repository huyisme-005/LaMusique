
"use client";
import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Download, FileAudio, FileText, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { GenerateMelodyOutput } from '@/ai/flows/generate-melody';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useRef, useState, useEffect, useCallback } from 'react';

interface ExportControlsProps {
  lyrics: string;
  melody: GenerateMelodyOutput | null;
  currentSongName: string | null; // Added prop
}

const ExportControls: FC<ExportControlsProps> = ({ lyrics, melody, currentSongName }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const SCROLL_AMOUNT = 200; 

  const checkScrollability = useCallback(() => {
    const current = viewportRef.current;
    const content = contentRef.current;
    if (current && content) {
      setCanScrollLeft(current.scrollLeft > 0);
      setCanScrollRight(current.scrollLeft < content.scrollWidth - current.clientWidth -1); 
    } else {
      setCanScrollLeft(false);
      setCanScrollRight(false);
    }
  }, []);

  useEffect(() => {
    const current = viewportRef.current;
    const content = contentRef.current;
    if (current && content) {
      checkScrollability(); 
      window.addEventListener('resize', checkScrollability);
      const observer = new MutationObserver(checkScrollability);
      observer.observe(content, { childList: true, subtree: true, attributes: true, characterData: true });
      
      return () => {
        window.removeEventListener('resize', checkScrollability);
        observer.disconnect();
      };
    }
  }, [checkScrollability]); 


  const handleScroll = (direction: 'left' | 'right') => {
    const current = viewportRef.current;
    if (current) {
      current.scrollBy({
        left: direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
        behavior: 'smooth',
      });
      setTimeout(checkScrollability, 300);
    }
  };


  const handleExport = (format: string) => {
    if (format === 'Lyrics PDF') {
      if (!lyrics && !melody?.description && !melody?.lyricFeedback) {
        alert("No content available to export.");
        return;
      }

      let songNameToUse = currentSongName;
      if (!songNameToUse || songNameToUse.trim() === "") {
        songNameToUse = window.prompt("Please enter a name for your song to export:");
        if (!songNameToUse || songNameToUse.trim() === "") {
          alert("Export cancelled: A song name is required for PDF export.");
          return;
        }
      }
      
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        let htmlContent = `
          <html>
            <head>
              <title>HarmonicAI Export - ${songNameToUse.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</title>
              <style>
                body { font-family: sans-serif; line-height: 1.6; padding: 20px; color: #333; }
                h1 { color: #A020F0; border-bottom: 2px solid #A020F0; padding-bottom: 10px; margin-bottom: 20px; }
                h2 { color: #7D4B96; margin-top: 30px; border-bottom: 1px solid #E6E6FA; padding-bottom: 5px;}
                pre { background-color: #f9f9f9; padding: 15px; border: 1px solid #E6E6FA; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; font-size: 0.9em; }
                .section { margin-bottom: 25px; }
                .footer-note { font-size: 0.8em; color: #777; margin-top: 40px; text-align: center; }
              </style>
            </head>
            <body>
              <h1>${songNameToUse.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</h1>
        `;

        if (lyrics) {
          htmlContent += `
            <div class="section">
              <h2>Lyrics</h2>
              <pre>${lyrics.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
            </div>
          `;
        }

        if (melody?.description) {
          htmlContent += `
            <div class="section">
              <h2>Melody Description & Singing Instructions</h2>
              <pre>${melody.description.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
            </div>
          `;
        }
        
        if (melody?.lyricFeedback) {
          htmlContent += `
            <div class="section">
              <h2>AI Lyric Feedback</h2>
              <pre>${melody.lyricFeedback.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
            </div>
          `;
        }

        htmlContent += `
              <div class="footer-note">
                Exported from HarmonicAI
              </div>
            </body>
          </html>
        `;
        
        newWindow.document.write(htmlContent);
        newWindow.document.close(); 
        alert("Content prepared in a new window. Please use your browser's Print function (Ctrl+P or Cmd+P) and select 'Save as PDF' as the destination.");
      } else {
        alert("Could not open a new window. Please check your browser's pop-up blocker settings.");
      }
      return;
    }
    alert(`Exporting as ${format} (functionality not implemented yet).`);
  };

  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Download className="text-primary" /> Export Your Song</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">This section will allow you to download your song. For "Lyrics as PDF", content opens in a new window for browser-based PDF saving. Full export functionality is under development.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Download your creation in various audio or document formats.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea orientation="horizontal" type="scroll" className="w-full" viewportRef={viewportRef} onViewportScroll={checkScrollability}>
          <div ref={contentRef} className="min-w-max p-6 pt-4">
            <div className="space-y-3">
              <Button onClick={() => handleExport('MP3')} className="w-full" variant="outline">
                <FileAudio className="mr-2 h-4 w-4" /> Export as MP3
              </Button>
              <Button onClick={() => handleExport('WAV')} className="w-full" variant="outline">
                <FileAudio className="mr-2 h-4 w-4" /> Export as WAV
              </Button>
              <Button onClick={() => handleExport('MIDI')} className="w-full" variant="outline">
                <FileAudio className="mr-2 h-4 w-4" /> Export as MIDI
              </Button>
              <Button onClick={() => handleExport('Lyrics PDF')} className="w-full" variant="outline">
                <FileText className="mr-2 h-4 w-4" /> Export Lyrics as PDF
              </Button>
              <p className="text-xs text-muted-foreground text-center pt-2">
                  Full export functionality is under development.
              </p>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4 border-t">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-xs text-muted-foreground">Scroll options</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExportControls;
    
