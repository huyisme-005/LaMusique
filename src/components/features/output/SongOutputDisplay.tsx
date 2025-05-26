
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, ListMusic, Disc3, UserRoundCheck } from 'lucide-react';
import type { GenerateMelodyOutput } from '@/ai/flows/generate-melody';

interface SongOutputDisplayProps {
  lyrics: string;
  melody: GenerateMelodyOutput | null;
}

const SongOutputDisplay: FC<SongOutputDisplayProps> = ({ lyrics, melody }) => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="text-primary" /> Generated Lyrics</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-[calc(50vh-180px)] md:h-[calc(100%-5rem)] w-full rounded-md border p-4 bg-muted/30">
            {lyrics ? (
              <pre className="whitespace-pre-wrap text-sm font-mono">{lyrics}</pre>
            ) : (
              <p className="text-muted-foreground italic">Your generated lyrics will appear here once crafted.</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ListMusic className="text-primary" /> Generated Melody</CardTitle>
          <CardDescription>Details about the composed melody, including how to sing it.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-[calc(50vh-220px)] md:h-[calc(100%-6rem)] w-full rounded-md border p-4 bg-muted/30">
            {melody ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-1"><UserRoundCheck size={16} className="text-accent"/> Melody & Singing Instructions:</h4>
                  <p className="text-sm whitespace-pre-wrap mt-1">{melody.description}</p>
                </div>
                <div className="pt-2">
                  <h4 className="font-semibold text-sm">Melody Structure (MusicXML Representation):</h4>
                  <p className="text-xs text-muted-foreground italic">(MusicXML data is generated for structural representation. Actual playback/visualization is a future feature.)</p>
                  <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-[100px] bg-background p-2 rounded mt-1">
                    {melody.melody.substring(0, 300) + (melody.melody.length > 300 ? "..." : "")}
                  </pre>
                </div>
                 <div className="flex items-center justify-center pt-4 text-muted-foreground">
                    <Disc3 size={32} className="mr-2 animate-spin [animation-duration:3s]" />
                    <p>Melody visualization & playback coming soon!</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground italic">Melody details and singing instructions will appear here once composed.</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SongOutputDisplay;
