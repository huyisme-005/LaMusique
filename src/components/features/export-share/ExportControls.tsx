
import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, FileAudio } from 'lucide-react';

const ExportControls: FC = () => {
  // Placeholder function for export logic
  const handleExport = (format: string) => {
    alert(`Exporting as ${format} (functionality not implemented yet).`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Download className="text-primary" /> Export Your Song</CardTitle>
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
