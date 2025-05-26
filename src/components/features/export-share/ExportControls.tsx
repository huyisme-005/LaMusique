
import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, FileAudio, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ExportControls: FC = () => {
  // Placeholder function for export logic
  const handleExport = (format: string) => {
    alert(`Exporting as ${format} (functionality not implemented yet).`);
  };

  return (
    <Card>
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
                <p className="text-sm">This section will allow you to download your song in formats like MP3, WAV, or MIDI. Full export functionality is currently under development.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Download your creation in various audio formats.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={() => handleExport('MP3')} className="w-full" variant="outline">
          <FileAudio className="mr-2 h-4 w-4" /> Export as MP3
        </Button>
        <Button onClick={() => handleExport('WAV')} className="w-full" variant="outline">
          <FileAudio className="mr-2 h-4 w-4" /> Export as WAV
        </Button>
        <Button onClick={() => handleExport('MIDI')} className="w-full" variant="outline">
          <FileAudio className="mr-2 h-4 w-4" /> Export as MIDI
        </Button>
         <p className="text-xs text-muted-foreground text-center pt-2">
            Full export functionality is under development.
          </p>
      </CardContent>
    </Card>
  );
};

export default ExportControls;
