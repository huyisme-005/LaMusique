
"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Share2, Twitter, Facebook, Instagram } from 'lucide-react'; 
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useRef } from 'react';


const ShareControls: FC = () => {
  const viewportRef = useRef<HTMLDivElement>(null);

  const handleShare = (platform: string) => {
    alert(`Sharing on ${platform} (functionality not implemented yet).`);
  };

  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Share2 className="text-primary" /> Share on Social Media</CardTitle>
        </div>
        <CardDescription>Let the world hear your masterpiece!</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea orientation="horizontal" type="scroll" viewportRef={viewportRef}>
            <div className="min-w-max p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-max">
                    <Button onClick={() => handleShare('Twitter')} variant="outline">
                    <Twitter className="mr-2 h-4 w-4 text-[#1DA1F2]" /> Share on X
                    </Button>
                    <Button onClick={() => handleShare('Facebook')} variant="outline">
                    <Facebook className="mr-2 h-4 w-4 text-[#1877F2]" /> Share on Facebook
                    </Button>
                    <Button onClick={() => handleShare('Instagram')} variant="outline">
                    <Instagram className="mr-2 h-4 w-4 text-[#E4405F]" /> Share on Instagram
                    </Button>
                    <Button onClick={() => handleShare('TikTok')} variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M21 7.392a1.48 1.48 0 0 0-1.14-1.446c-2.05-.41-4.23-.77-6.45-.77-2.28 0-4.5.37-6.6.8-2.28.46-4.11.87-5.26 1.29a.485.485 0 0 0-.28.617c.28 1.1.83 3.51 1.29 5.26.42 2.08.77 4.24.77 6.45 0 2.28-.36 4.5-.8 6.6a1.23 1.23 0 0 0 .604 1.326c1.01.51 3.1.99 5.26 1.29 2.08.42 4.24.77 6.45.77 2.28 0 4.5-.36 6.6-.8 2.28-.46 4.11-.87 5.26-1.29a.485.485 0 0 0 .28-.617c-.28-1.1-.83-3.51-1.29-5.26-.42-2.08-.77-4.24-.77-6.45s.35-4.37.77-6.45c.1-.48.11-.97.09-1.45Z"/><path d="M10.26 17.64a4.04 4.04 0 1 0 0-8.08 4.04 4.04 0 0 0 0 8.08Z"/></svg>
                    Share on TikTok
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center pt-4">
                    Direct social media integration is a future feature.
                </p>
            </div>
        </ScrollArea>
      </CardContent>
       <CardFooter className="pt-4 border-t">
      </CardFooter>
    </Card>
  );
};

export default ShareControls;
