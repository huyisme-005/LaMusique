
"use client";

import type { FC } from 'react';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateMelody, type GenerateMelodyOutput } from '@/ai/flows/generate-melody';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Piano } from 'lucide-react';

const melodySchema = z.object({
  genre: z.string().min(1, "Genre is required."),
  key: z.string().min(1, "Key is required."),
  tempo: z.coerce.number().min(40, "Tempo must be at least 40 BPM.").max(220, "Tempo must be at most 220 BPM."),
});

type MelodyFormValues = z.infer<typeof melodySchema>;

interface MelodyGeneratorProps {
  lyrics: string;
  onMelodyGenerated: (melody: GenerateMelodyOutput) => void;
}

const musicKeys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const genres = ["Pop", "Rock", "Jazz", "Electronic", "Folk", "Classical", "Hip Hop", "Blues"];


const MelodyGenerator: FC<MelodyGeneratorProps> = ({ lyrics, onMelodyGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<MelodyFormValues>({
    resolver: zodResolver(melodySchema),
    defaultValues: {
      genre: "",
      key: "C",
      tempo: 120,
    },
  });

  const onSubmit: SubmitHandler<MelodyFormValues> = async (data) => {
    if (!lyrics) {
      toast({
        title: "Lyrics Required",
        description: "Please generate or provide lyrics before composing a melody.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await generateMelody({ ...data, lyrics });
      onMelodyGenerated(result);
      toast({
        title: "Melody Composed!",
        description: "A melody has been generated for your lyrics.",
      });
    } catch (error) {
      console.error("Error generating melody:", error);
      toast({
        title: "Error Composing Melody",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Piano className="text-primary" /> Compose Melody</CardTitle>
        <CardDescription>Set the genre, key, and tempo for your song's melody.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a genre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a key" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {musicKeys.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tempo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo (BPM)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 120" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !lyrics} className="w-full">
              {isLoading ? <Loader2 className="animate-spin" /> : "Compose Melody"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default MelodyGenerator;
