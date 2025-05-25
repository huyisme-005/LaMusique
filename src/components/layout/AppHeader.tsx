
import { Music } from 'lucide-react';
import type { FC } from 'react';

const AppHeader: FC = () => {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex items-center gap-3">
        <Music size={32} />
        <h1 className="text-2xl font-bold tracking-tight">HarmonicAI</h1>
      </div>
    </header>
  );
};

export default AppHeader;
