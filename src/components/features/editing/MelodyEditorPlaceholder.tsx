
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music4, Construction, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

const MelodyEditorPlaceholder: FC = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Music4 className="text-primary" /> Melody Editor</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">Advanced melody editing (e.g., note manipulation, rhythm adjustments) is planned for a future update. For now, you can regenerate melodies.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Advanced melody editing tools are under construction.</CardDescription>
      </CardHeader>
      <CardContent className="text-center text-muted-foreground">
        <Construction size={48} className="mx-auto mb-4 text-accent" />
        <p className="text-lg font-semibold">Advanced Melody Editing Coming Soon!</p>
        <p className="text-sm">For now, you can regenerate melodies or use AI suggestions.</p>
      </CardContent>
    </Card>
  );
};

export default MelodyEditorPlaceholder;
