
"use client";

import type { FC } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, HelpCircle, Music, Mic, SmilePlus, Edit3, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type HelpTopic = "lyrics" | "melody" | "audio" | "emotion" | "editing" | "general";

interface HelpContent {
  title: string;
  icon: JSX.Element;
  description: string;
  tips: string[];
}

const helpData: Record<HelpTopic, HelpContent> = {
  general: {
    title: "Welcome to HarmonicAI Copilot!",
    icon: <Info className="text-primary h-5 w-5" />,
    description: "I'm here to help you navigate and make the most of HarmonicAI. Select a topic below for specific guidance.",
    tips: [
      "Use the sections in this left panel to access all song creation tools and analyzers.",
      "Your main generated content (lyrics and melody details) will appear in the right panel.",
      "Experiment with different inputs to discover creative possibilities!",
      "This application is a prototype; some advanced features are placeholders for future development.",
    ],
  },
  lyrics: {
    title: "Lyrics Generation",
    icon: <Music className="text-primary h-5 w-5" />,
    description: "Craft song lyrics based on your theme and keywords. The AI will generate lyrics which you can then edit.",
    tips: [
      "Be specific with your theme for more targeted lyrics (e.g., 'breakup in a rainy city' vs. 'sad song').",
      "Use diverse keywords to inspire unique lyrical ideas.",
      "After generating, lyrics appear in the 'Current Lyrics' box below the inputs, and also in the right-hand panel.",
      "You can immediately edit them in the 'Manual Lyrics Editor' section further down.",
    ],
  },
  melody: {
    title: "Melody Composition",
    icon: <Music className="text-primary h-5 w-5" />,
    description: "Compose a melody for your lyrics by setting genre, key, and tempo.",
    tips: [
      "Ensure you have some lyrics generated or written in the 'Current Lyrics' box (from Lyrics Generator) or 'Manual Lyrics Editor' before composing a melody.",
      "Explore the extensive list of genres to see how they affect the melody's style.",
      "The key and tempo will significantly influence the mood and feel of the melody.",
      "Melody data (MusicXML format) and a descriptive summary will be shown in the right panel. Full playback and advanced editing are future features.",
    ],
  },
  audio: {
    title: "Audio Input & Analysis",
    icon: <Mic className="text-primary h-5 w-5" />,
    description: "Upload an audio file and/or provide lyrics for a preliminary plagiarism concern scan.",
    tips: [
      "You can upload common audio file types (e.g., .mp3, .wav).",
      "If no audio file is uploaded, a default silent placeholder is used for the analysis. The scan will then focus primarily on any lyrics you provide.",
      "The plagiarism scan is an experimental, AI-powered preliminary check for obvious lyrical or thematic overlaps with known works. It is NOT a definitive legal copyright assessment.",
      "Recording audio directly via microphone is a planned future feature.",
    ],
  },
  emotion: {
    title: "Emotion Analyzer",
    icon: <SmilePlus className="text-primary h-5 w-5" />,
    description: "Analyze the emotional content of any text you provide.",
    tips: [
      "Paste any text (e.g., your song lyrics, a poem, a story snippet) into the text area.",
      "The AI will identify the primary emotion detected, a confidence score for its assessment, and a brief explanation.",
      "This can be useful for understanding the mood of your lyrics or getting thematic inspiration.",
    ],
  },
  editing: {
    title: "Manual Lyrics Editor",
    icon: <Edit3 className="text-primary h-5 w-5" />,
    description: "Directly edit your generated or existing song lyrics.",
    tips: [
      "Any lyrics you generate using the 'Generate Lyrics' tool, or type here directly, will be available for editing.",
      "Changes made here are reflected in real-time in the 'Current Lyrics' box in the Lyrics Generator and the main display in the right panel.",
      "This is your primary space to refine, rewrite, and perfect your song's words.",
    ],
  },
};

const AiCopilot: FC = () => {
  const [activeTopic, setActiveTopic] = useState<HelpTopic>("general");

  const currentHelp = helpData[activeTopic];

  const topicButtons: {topic: HelpTopic, label: string, icon: JSX.Element}[] = [
    { topic: "general", label: "General", icon: <Info className="mr-2 h-4 w-4" /> },
    { topic: "lyrics", label: "Lyrics", icon: <Music className="mr-2 h-4 w-4" /> },
    { topic: "melody", label: "Melody", icon: <Music className="mr-2 h-4 w-4" /> },
    { topic: "audio", label: "Audio", icon: <Mic className="mr-2 h-4 w-4" /> },
    { topic: "emotion", label: "Emotion", icon: <SmilePlus className="mr-2 h-4 w-4" /> },
    { topic: "editing", label: "Editing", icon: <Edit3 className="mr-2 h-4 w-4" /> },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="text-primary" /> AI Copilot
        </CardTitle>
        <CardDescription>
          Your guide to HarmonicAI. Click a topic for tips and instructions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {topicButtons.map(({topic, label, icon}) => (
            <Button 
              key={topic}
              variant={activeTopic === topic ? 'default' : 'outline'} 
              onClick={() => setActiveTopic(topic)} 
              size="sm" 
              className="justify-start text-xs sm:text-sm h-9 sm:h-10"
            >
              {icon} {label}
            </Button>
          ))}
        </div>

        <Card className="bg-muted/50 border-border shadow-inner">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="flex items-center gap-2 text-md sm:text-lg">
              {currentHelp.icon} {currentHelp.title}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm pt-1">{currentHelp.description}</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ScrollArea className="h-[120px] sm:h-[150px] pr-3">
              <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm text-muted-foreground">
                {currentHelp.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default AiCopilot;
