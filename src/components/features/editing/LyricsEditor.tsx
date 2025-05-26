
// This file is no longer used and can be deleted.
// The functionality has been integrated into the SongCrafter.tsx component
// at src/components/features/song-crafting/SongCrafter.tsx.

/*
"use client";

import type { FC } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Added CardDescription
import { FileEdit, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';


interface LyricsEditorProps {
  lyrics: string;
  onLyricsChange: (newLyrics: string) => void;
}

const LyricsEditor: FC<LyricsEditorProps> = ({ lyrics, onLyricsChange }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><FileEdit className="text-primary" /> Manual Lyrics Editor</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">Directly edit your generated or existing lyrics here. Changes are reflected in real-time in other parts of the app.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Refine your song's lyrics. Changes are saved as you type.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full gap-1.5">
          <Label htmlFor="lyrics-manual-editor">Edit your lyrics below:</Label>
          <Textarea
            id="lyrics-manual-editor"
            value={lyrics}
            onChange={(e) => onLyricsChange(e.target.value)}
            placeholder="Start typing or paste your lyrics here..."
            className="min-h-[250px] focus:ring-accent focus:border-accent"
          />
           <p className="text-xs text-muted-foreground">
            Changes are saved as you type.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LyricsEditor;
*/
