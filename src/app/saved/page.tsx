
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { Button } from '@/components/layout-parts/Button'; // Assuming you might have a custom Button or use ShadCN
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Home, Trash2, PlayCircle, Eye } from 'lucide-react';
import type { SavedSong } from '@/app/page'; // Import the interface
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';


const SavedProgressPage: FC = () => {
  const [savedSongs, setSavedSongs] = useState<SavedSong[]>([]);
  const [selectedSongForView, setSelectedSongForView] = useState<SavedSong | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const storedSongs = localStorage.getItem('harmonicAI_savedSongs');
    if (storedSongs) {
      try {
        setSavedSongs(JSON.parse(storedSongs));
      } catch (e) {
        console.error("Error parsing saved songs from localStorage on saved page", e);
        toast({ title: "Load Error", description: "Could not parse saved songs data.", variant: "destructive" });
      }
    }
  }, [toast]);

  const updateLocalStorageAndState = (newSongs: SavedSong[]) => {
    setSavedSongs(newSongs);
    localStorage.setItem('harmonicAI_savedSongs', JSON.stringify(newSongs));
  };

  const handleDeleteSong = (songId: string) => {
    const updatedSongs = savedSongs.filter(song => song.id !== songId);
    updateLocalStorageAndState(updatedSongs);
    toast({
      title: "Song Deleted",
      description: "The song has been removed from your saved progress.",
    });
  };

  const handleLoadSong = (songId: string) => {
    router.push(`/?loadSongId=${songId}`);
  };
  
  const handleViewSong = (song: SavedSong) => {
    setSelectedSongForView(song);
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-primary">Saved Songs</h1>
            <Link href="/" passHref>
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" /> Back to Creation
              </Button>
            </Link>
          </div>

          {savedSongs.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 bg-card rounded-xl shadow-md p-6">
              <p className="text-xl mb-2">No songs saved yet.</p>
              <p>Go to the creation page and click "Save Current Song" to save your work.</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-4">
                {savedSongs.map(song => (
                  <Card key={song.id} className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-xl">{song.name}</CardTitle>
                      <CardDescription>
                        Saved on: {new Date(parseInt(song.id)).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground truncate mb-1">
                        Lyrics: {song.lyrics.substring(0, 80)}{song.lyrics.length > 80 ? "..." : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Melody: {song.melody ? "Generated" : "Not generated"}
                      </p>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="ghost" size="sm" onClick={() => handleViewSong(song)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Button>
                        </DialogTrigger>
                        {selectedSongForView && selectedSongForView.id === song.id && (
                           <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                            <DialogHeader>
                              <DialogTitle className="text-2xl mb-2">{selectedSongForView.name}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="flex-1 pr-2">
                              <div className="space-y-4">
                                <div>
                                  <h3 className="font-semibold text-lg text-primary mb-1">Lyrics</h3>
                                  <pre className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md max-h-60 overflow-y-auto">{selectedSongForView.lyrics || "No lyrics saved."}</pre>
                                </div>
                                <Separator/>
                                <div>
                                  <h3 className="font-semibold text-lg text-primary mb-1">Melody Details</h3>
                                  {selectedSongForView.melody ? (
                                    <div className="space-y-2 text-sm">
                                      <p><strong className="text-muted-foreground">Description & Singing Instructions:</strong></p>
                                      <pre className="whitespace-pre-wrap bg-muted/50 p-3 rounded-md max-h-60 overflow-y-auto">{selectedSongForView.melody.description}</pre>
                                      <p><strong className="text-muted-foreground">Lyric Feedback:</strong></p>
                                      <pre className="whitespace-pre-wrap bg-muted/50 p-3 rounded-md max-h-60 overflow-y-auto">{selectedSongForView.melody.lyricFeedback}</pre>
                                      <p><strong className="text-muted-foreground">Melody Structure (MusicXML - Snippet):</strong></p>
                                      <pre className="whitespace-pre-wrap bg-muted/50 p-3 rounded-md text-xs max-h-40 overflow-y-auto">{selectedSongForView.melody.melody.substring(0,300) + "..."}</pre>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground italic">No melody data saved.</p>
                                  )}
                                </div>
                              </div>
                            </ScrollArea>
                             <DialogClose asChild>
                                <Button variant="outline" className="mt-4 self-end">Close</Button>
                              </DialogClose>
                          </DialogContent>
                        )}
                      </Dialog>
                      <Button variant="outline" size="sm" onClick={() => handleLoadSong(song.id)}>
                        <PlayCircle className="mr-2 h-4 w-4" /> Load in Editor
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the song "{song.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSong(song.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedProgressPage;
