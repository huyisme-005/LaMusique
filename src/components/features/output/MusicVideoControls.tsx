
"use client";

import type { FC } from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clapperboard, Film, Sparkles, Upload, Image as ImageIcon, Video, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface AssetFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  file: File;
  previewUrl?: string; // For images
}

const MusicVideoControls: FC = () => {
  const [assets, setAssets] = useState<AssetFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Clapperboard className="text-primary" /> Music Video Assets</CardTitle>
        <CardDescription>Upload images and video clips to use in your AI-generated music video (Generation Coming Soon!).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <Upload className="mr-2 h-4 w-4" /> Upload Images/Videos
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
      </CardContent>
    </Card>
  );
};

export default MusicVideoControls;
