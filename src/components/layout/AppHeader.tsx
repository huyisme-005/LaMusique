
import { Music, ListChecks, MessageSquareText, Home } from 'lucide-react'; // Added Home
import type { FC } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const AppHeader: FC = () => {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <Music size={32} />
          <h1 className="text-2xl font-bold tracking-tight">La Musique</h1>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/" passHref>
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
              <Home className="mr-2 h-5 w-5" />
              Home
            </Button>
          </Link>
          <Link href="/saved" passHref>
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
              <ListChecks className="mr-2 h-5 w-5" />
              Saved Songs
            </Button>
          </Link>
          <a
            href="https://docs.google.com/forms/d/1jMoKGx0hsz-1JHXecxFxZKWqgh4Cly72A-3jWO2Q2nk/viewform?edit_requested=true&fbzx=6822839218551018755"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
          >
            <MessageSquareText className="mr-2 h-5 w-5" />
            Feedback
          </a>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
