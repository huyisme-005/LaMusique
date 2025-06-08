/**
 * @fileOverview SongLoader component for La Musique.
 * This client-side component is responsible for checking URL search parameters
 * for a 'loadSongId'. If found, it attempts to load the corresponding saved song
 * from localStorage and updates the main application state via the `onSongLoaded` callback.
 * It then removes the 'loadSongId' from the URL.
 *
 * @exports SongLoader - The React functional component for loading songs.
 */
"use client";

import type { FC } from 'react';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import type { SavedSong } from '@/app/page';
import type { GenerateMelodyOutput } from '@/ai/flows/generate-melody';

interface SongLoaderProps {
  onSongLoaded: (lyrics: string, melody: GenerateMelodyOutput | null, songName: string) => void;
  isClient: boolean;
  localStorageKey: string; // Added prop for localStorage key
}

const SongLoader: FC<SongLoaderProps> = ({ onSongLoaded, isClient, localStorageKey }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isClient) {
      return;
    }

    const songIdToLoad = searchParams.get('loadSongId');
    if (songIdToLoad) {
      const storedSongs = localStorage.getItem(localStorageKey);
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
      
      const currentPathname = window.location.pathname; 
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('loadSongId');
      const newUrl = `${currentPathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [isClient, searchParams, router, toast, onSongLoaded, localStorageKey]);

  return null;
};

export default SongLoader;
