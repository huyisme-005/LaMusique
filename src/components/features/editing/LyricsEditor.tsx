
"use client";

import type { FC } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileEdit } from 'lucide-react';

interface LyricsEditorProps {
  lyrics: string;
  onLyricsChange: (newLyrics: string) => void;
}

const LyricsEditor: FC<LyricsEditorProps> = ({ lyrics, onLyricsChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileEdit className="text-primary" /> Manual Lyrics Editor</CardTitle>
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
