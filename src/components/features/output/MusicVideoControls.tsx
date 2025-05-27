
"use client";

import type { FC } from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Clapperboard, Film, Sparkles, Upload, Image as ImageIcon, Video, Trash2, Info, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from "@/hooks/use-toast";


interface AssetFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  file: File;
  previewUrl?: string; // For images
}

const SCROLL_AMOUNT = 200;

const MusicVideoControls: FC = () => {
  const [assets, setAssets] = useState<AssetFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { toast } = useToast();


  const checkScrollability = useCallback(() => {
    const current = viewportRef.current;
    if (current) {
      setCanScrollLeft(current.scrollLeft > 0);
      setCanScrollRight(current.scrollLeft < current.scrollWidth - current.clientWidth -1);
    } else {
      setCanScrollLeft(false);
      setCanScrollRight(false);
    }
  }, []);

  useEffect(() => {
    checkScrollability();
    const current = viewportRef.current;
    if (current) {
      const handleResize = () => checkScrollability();
      window.addEventListener('resize', handleResize);
      const observer = new MutationObserver(checkScrollability);
      observer.observe(current, { childList: true, subtree: true, attributes: true, characterData: true });
      
      return () => {
        window.removeEventListener('resize', handleResize);
        observer.disconnect();
      };
    }
  }, [checkScrollability]);

  const handleScroll = (direction: 'left' | 'right') => {
    const current = viewportRef.current;
    if (current) {
      current.scrollBy({
        left: direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
        behavior: 'smooth',
      });
      setTimeout(checkScrollability, 300);
    }
  };

  const handleGenerateVideo = () => {
    alert("Music video generation is a future feature and not yet implemented. Uploaded assets are listed below.");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAssets: AssetFile[] = Array.from(files).map(file => {
        const fileType = file.type.startsWith('image/') ? 'image' : (file.type.startsWith('video/') ? 'video' : null);
        if (!fileType) return null; // Skip non-image/video files

        const asset: AssetFile = {
          id: crypto.randomUUID(),
          name: file.name,
          type: fileType,
          file: file,
        };
        if (fileType === 'image') {
          asset.previewUrl = URL.createObjectURL(file);
        }
        return asset;
      }).filter(Boolean) as AssetFile[];
      
      setAssets(prevAssets => [...prevAssets, ...newAssets]);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAsset = (assetId: string) => {
    setAssets(prevAssets => prevAssets.filter(asset => {
      if (asset.id === assetId && asset.previewUrl) {
        URL.revokeObjectURL(asset.previewUrl); // Clean up image preview URL
      }
      return asset.id !== assetId;
    }));
  };

  const handleAssetPlagiarismScan = () => {
    toast({
        title: "Feature Not Implemented",
        description: "Scanning visual assets for plagiarism is a complex feature planned for a future update.",
        variant: "default",
    });
  };

  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Clapperboard className="text-primary" /> Music Video Assets</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">Optionally, upload images and video clips here if you plan to create an AI-generated music video (feature coming soon). Manage your uploaded assets below. Plagiarism scan for assets is also a future feature.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Optionally, upload images/videos. AI-powered music video generation and asset plagiarism scan are future features.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea 
          orientation="horizontal" 
          type="scroll" 
          className="w-full"
          viewportRef={viewportRef}
          onViewportScroll={checkScrollability}
        >
          <div className="min-w-max p-6 pt-0">
            <div className="space-y-4">
              <Input 
                type="file" 
                accept="image/*,video/*" 
                multiple 
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                id="music-video-asset-upload"
              />
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" /> Upload Images/Videos (Optional)
              </Button>

              {assets.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Uploaded Assets:</h4>
                  <ScrollArea className="h-[150px] w-full rounded-md border p-2 bg-muted/30">
                    <ul className="space-y-2">
                      {assets.map(asset => (
                        <li key={asset.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                          <div className="flex items-center gap-2 overflow-hidden">
                            {asset.type === 'image' && asset.previewUrl ? (
                              <img src={asset.previewUrl} alt={asset.name} className="h-8 w-8 rounded object-cover" />
                            ) : asset.type === 'image' ? (
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            ) : (
                              <Video className="h-6 w-6 text-muted-foreground" />
                            )}
                            <span className="text-xs truncate" title={asset.name}>{asset.name}</span>
                            <Badge variant="secondary" className="capitalize text-xs">{asset.type}</Badge>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeAsset(asset.id)} className="h-6 w-6">
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}
              
              <div 
                className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center border border-dashed"
                data-ai-hint="music video abstract"
              >
                <Film size={64} className="text-muted-foreground opacity-50" />
              </div>
              <Button onClick={handleGenerateVideo} variant="secondary" className="w-full" disabled={assets.length === 0}>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Music Video (Future Feature)
              </Button>
              <Button onClick={handleAssetPlagiarismScan} variant="outline" className="w-full" disabled={assets.length === 0}>
                <ShieldAlert className="mr-2 h-4 w-4" /> Scan Assets for Plagiarism (Future Feature)
              </Button>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4 border-t">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-xs text-muted-foreground">Scroll options</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MusicVideoControls;
