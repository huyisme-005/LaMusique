
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
}

const ExportControls: FC<ExportControlsProps> = ({ lyrics, melody }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const SCROLL_AMOUNT = 200; // Amount to scroll on arrow click

  const checkScrollability = useCallback(() => {
    const current = viewportRef.current;
    if (current) {
      setCanScrollLeft(current.scrollLeft > 0);
      setCanScrollRight(current.scrollLeft < current.scrollWidth - current.clientWidth -1); // -1 for potential subpixel issues
    }
  }, []);

  useEffect(() => {
    const current = viewportRef.current;
    if (current) {
      checkScrollability(); // Initial check
      // Check on window resize
      window.addEventListener('resize', checkScrollability);
      // Check if content inside changes (this is a bit tricky without specific MutationObserver setup)
      // For now, we'll rely on initial check and resize.
      return () => {
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [checkScrollability]); // Rerun if checkScrollability changes (it won't due to useCallback, but good practice)


  const handleScroll = (direction: 'left' | 'right') => {
    const current = viewportRef.current;
    if (current) {
      current.scrollBy({
        left: direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
        behavior: 'smooth',
      });
      // Check scrollability again after a short delay to allow scroll to complete
      setTimeout(checkScrollability, 300);
    }
  };


  // Placeholder function for export logic
  const handleExport = (format: string) => {
    if (format === 'Lyrics PDF') {
      if (!lyrics && !melody) {
        alert("No lyrics or melody data to export.");
        return;
      }
      
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        let htmlContent = `
          <html>
            <head>
              <title>HarmonicAI Song Export</title>
              <style>
                body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
                h1 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                h2 { color: #555; margin-top: 30px; }
                pre { background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; }
                .section { margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <h1>HarmonicAI Song Export</h1>
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
            </body>
          </html>
        `;
        
        newWindow.document.write(htmlContent);
        newWindow.document.close(); // Important for some browsers
        alert("Content opened in a new window. Please use your browser's Print to PDF (Ctrl+P or Cmd+P) functionality to save as PDF.");
      } else {
        alert("Could not open a new window. Please check your browser's pop-up blocker settings.");
      }
      return;
    }
    // For other formats
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
      <ScrollArea orientation="horizontal" type="scroll" className="w-full" viewportRef={viewportRef} onViewportScroll={checkScrollability}>
        <div className="min-w-max p-6 pt-0"> {/* Content wrapper for min-w-max and padding */}
          <div className="space-y-3"> {/* Actual content */}
            <Button onClick={() => handleExport('MP3')} className="w-full sm:w-auto" variant="outline">
              <FileAudio className="mr-2 h-4 w-4" /> Export as MP3
            </Button>
            <Button onClick={() => handleExport('WAV')} className="w-full sm:w-auto" variant="outline">
              <FileAudio className="mr-2 h-4 w-4" /> Export as WAV
            </Button>
            <Button onClick={() => handleExport('MIDI')} className="w-full sm:w-auto" variant="outline">
              <FileAudio className="mr-2 h-4 w-4" /> Export as MIDI
            </Button>
            <Button onClick={() => handleExport('Lyrics PDF')} className="w-full sm:w-auto" variant="outline">
              <FileText className="mr-2 h-4 w-4" /> Export Lyrics as PDF
            </Button>
            <p className="text-xs text-muted-foreground text-center pt-2 sm:w-full">
                Full export functionality is under development.
            </p>
          </div>
        </div>
      </ScrollArea>
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
