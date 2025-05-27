
"use client";

import type { FC } from 'react';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import type { SavedSong } from '@/app/page'; // Assuming SavedSong is exported from page.tsx or a types file
import type { GenerateMelodyOutput } from '@/ai/flows/generate-melody';

interface SongLoaderProps {
  onSongLoaded: (lyrics: string, melody: GenerateMelodyOutput | null, songName: string) => void;
  isClient: boolean; // Pass isClient from parent to avoid re-checking
}

const SongLoader: FC<SongLoaderProps> = ({ onSongLoaded, isClient }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isClient) {
      return;
    }

    const songIdToLoad = searchParams.get('loadSongId');
    if (songIdToLoad) {
      const storedSongs = localStorage.getItem('harmonicAI_savedSongs');
      if (storedSongs) {
        try {
          const songs: SavedSong[] = JSON.parse(storedSongs);
          const songToLoad = songs.find(s => s.id === songIdToLoad);
          if (songToLoad) {
            onSongLoaded(songToLoad.lyrics, songToLoad.melody, songToLoad.name);
            toast({ title: "Song Loaded", description: `"${songToLoad.name}" lyrics and melody have been loaded.` });
          } else {
            toast({ title: "Error Loading Song", description: "Could not find the song to load.", variant: "destructive" });
          }
        } catch (e) {
          console.error("Error parsing saved songs from localStorage", e);
          toast({ title: "Error Loading Song", description: "Could not parse saved songs data.", variant: "destructive" });
        }
      } else {
        toast({ title: "No Saved Songs", description: "Could not find any saved songs to load.", variant: "default" });
      }
      
      // Clear the query parameter to prevent reloading on refresh/navigation
      // This part needs to be careful as router.replace can cause re-renders.
      // Ensure it's done in a way that doesn't trigger infinite loops or unnecessary suspense.
      const currentPathname = window.location.pathname; 
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('loadSongId');
      const newUrl = `${currentPathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [isClient, searchParams, router, toast, onSongLoaded]);

  return null; // This component only handles logic, doesn't render anything itself
};

export default SongLoader;
