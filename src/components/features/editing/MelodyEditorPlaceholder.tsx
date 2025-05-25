
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music4, Construction } from 'lucide-react';

const MelodyEditorPlaceholder: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Music4 className="text-primary" /> Melody Editor</CardTitle>
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
