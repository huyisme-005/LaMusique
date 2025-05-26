
import { Music, ListChecks } from 'lucide-react';
import type { FC } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const AppHeader: FC = () => {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <Music size={32} />
          <h1 className="text-2xl font-bold tracking-tight">HarmonicAI</h1>
        </Link>
        <Link href="/saved" passHref>
          <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
            <ListChecks className="mr-2 h-5 w-5" />
            Saved Songs
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default AppHeader;
