
"use client";

import type { FC } from 'react';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from 'lucide-react';

const feedbackSchema = z.object({
  // Section 1: General Information
  ageRange: z.string({ required_error: "Please select an age range." }).min(1, "Please select an age range."),
  musicExperience: z.string({ required_error: "Please select your music experience." }).min(1, "Please select your music experience."),
  currentTools: z.string().optional(),

  // Section 2: Current Features Feedback
  emotionThemeTempoUsefulness: z.string({ required_error: "Please rate this feature." }).min(1, "Please rate this feature."),
  aiFeedbackImportance: z.string({ required_error: "Please rate this feature." }).min(1, "Please rate this feature."),
  moreMelodyControl: z.string({ required_error: "Please answer this question." }).min(1, "Please answer this question."),

  // Section 3: Future Features Interest
  futureFeaturesInterest: z.object({
    uploadRecordVocals: z.string({ required_error: "Please rate interest." }),
    generateFullAudio: z.string({ required_error: "Please rate interest." }),
    createMusicVideo: z.string({ required_error: "Please rate interest." }),
    exportAudioVideo: z.string({ required_error: "Please rate interest." }),
    shareSocialMedia: z.string({ required_error: "Please rate interest." }),
    aiSingingSamples: z.string({ required_error: "Please rate interest." }),
    aiCopilot: z.string({ required_error: "Please rate interest." }),
    collaborateRealTime: z.string({ required_error: "Please rate interest." }),
  }),

  // Section 4: Accessibility & Utility
  signupPreference: z.string({ required_error: "Please select a preference." }).min(1, "Please select a preference."),
  signupPreferenceOther: z.string().optional(),
  permanentStorageImportance: z.string({ required_error: "Please rate importance." }).min(1, "Please rate importance."),
  plagiarismScanPreference: z.string({ required_error: "Please answer this question." }).min(1, "Please answer this question."),

  // Section 5: Subscription & Value
  subscriptionInterest: z.string({ required_error: "Please indicate interest." }).min(1, "Please indicate interest."),
  fairPriceRange: z.string({ required_error: "Please select a price range." }).min(1, "Please select a price range."),

  // Section 6: Open Feedback
  lovedFeatures: z.string().optional(),
  creationChallenges: z.string().optional(),
  contactForTesting: z.string({ required_error: "Please select an option." }).min(1, "Please select an option."),
  contactEmail: z.string().optional(),
}).refine(data => {
  if (data.signupPreference === "Other" && (!data.signupPreferenceOther || data.signupPreferenceOther.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Please specify your 'Other' signup preference.",
  path: ["signupPreferenceOther"],
}).refine(data => {
  if (data.contactForTesting === "Yes" && (!data.contactEmail || data.contactEmail.trim() === "")) {
    return false;
  }
  if (data.contactForTesting === "Yes" && data.contactEmail && !z.string().email().safeParse(data.contactEmail).success) {
    return false;
  }
  return true;
}, {
  message: "A valid email is required if you agree to be contacted.",
  path: ["contactEmail"],
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

const ageRanges = ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"];
const musicExperiences = [
  "Beginner (No prior experience)",
  "Hobbyist (Some experience, for fun)",
  "Semi-professional (Occasional gigs or online sharing)",
  "Professional (Earn income from music)",
];
const usefulnessOptions = ["Not useful", "Somewhat useful", "Very useful", "Haven’t tried yet"];
const importanceOptions = ["Not important", "Nice to have", "Very important", "Essential to me"];
const yesNoNotSure = ["Yes", "No", "Not sure"];
const ratingOptions = [
    { value: "1", label: "1 (Not interested)" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5 (Very interested)" },
];
const futureFeatureQuestions = [
    { id: "uploadRecordVocals", label: "Upload/record vocals for your song" },
    { id: "generateFullAudio", label: "Generate full music audio from vocals" },
    { id: "createMusicVideo", label: "Create a music video from your media assets" },
    { id: "exportAudioVideo", label: "Export audio/video of your song" },
    { id: "shareSocialMedia", label: "Share your song on social media platforms" },
    { id: "aiSingingSamples", label: "AI-generated singing samples" },
    { id: "aiCopilot", label: "AI Copilot to help you create/edit music" },
    { id: "collaborateRealTime", label: "Collaborate with others in real time" },
] as const;

const signupPrefs = ["Email", "Phone number", "Google", "Facebook", "Apple ID", "Other"];
const storageImportance = ["Not important", "Somewhat important", "Very important", "Critical"];
const subscriptionInterests = ["Not interested", "Maybe", "Yes – I’d pay for a Premium tier", "Yes – I’d pay for a Corporate/Team tier"];
const priceRanges = ["$0–5", "$6–10", "$11–20", "$20+"];

const FEEDBACK_STORAGE_KEY = "laMusique_userFeedback";

interface StoredFeedbackEntry extends FeedbackFormValues {
  submittedAt: string; // ISO date string
}

const FeedbackForm: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      currentTools: "",
      futureFeaturesInterest: {
        uploadRecordVocals: "",
        generateFullAudio: "",
        createMusicVideo: "",
        exportAudioVideo: "",
        shareSocialMedia: "",
        aiSingingSamples: "",
        aiCopilot: "",
        collaborateRealTime: "",
      },
      signupPreferenceOther: "",
      lovedFeatures: "",
      creationChallenges: "",
      contactEmail: "",
    },
  });

  const watchedSignupPreference = form.watch("signupPreference");
  const watchedContactForTesting = form.watch("contactForTesting");

  const onSubmit: SubmitHandler<FeedbackFormValues> = async (data) => {
    setIsLoading(true);
    
    const feedbackEntry: StoredFeedbackEntry = {
      ...data,
      submittedAt: new Date().toISOString(),
    };

    try {
      const existingFeedbackString = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      let allFeedback: StoredFeedbackEntry[] = [];
      if (existingFeedbackString) {
        allFeedback = JSON.parse(existingFeedbackString);
      }
      allFeedback.push(feedbackEntry);
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(allFeedback));
      
      console.log("Feedback Submitted & Saved Locally:", feedbackEntry);
      toast({
        title: "Feedback Received!",
        description: "Thank you! Your feedback has been saved locally in this browser.",
      });
      form.reset();
    } catch (error) {
      console.error("Error saving feedback to localStorage:", error);
      toast({
        title: "Submission Error",
        description: "Could not save your feedback locally. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <Card>
          <CardHeader>
            <CardTitle>1. General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="ageRange"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>What is your age range?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      {ageRanges.map(option => (
                        <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value={option} /></FormControl>
                          <FormLabel className="font-normal">{option}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="musicExperience"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>What is your experience with music creation?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      {musicExperiences.map(option => (
                        <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value={option} /></FormControl>
                          <FormLabel className="font-normal">{option}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentTools"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What tools or apps do you currently use for music creation (if any)?</FormLabel>
                  <FormControl><Input placeholder="e.g., GarageBand, FL Studio, Ableton Live, a notepad..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Current Features Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="emotionThemeTempoUsefulness"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>How useful do you find the ability to generate lyrics and melodies based on emotion, theme, and tempo?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      {usefulnessOptions.map(option => (
                        <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value={option} /></FormControl>
                          <FormLabel className="font-normal">{option}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aiFeedbackImportance"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>How important is it to receive AI feedback and singing instructions for your lyrics?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      {importanceOptions.map(option => (
                        <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value={option} /></FormControl>
                          <FormLabel className="font-normal">{option}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="moreMelodyControl"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Would you like more control over melody editing (e.g., tune tweaking, rhythm adjustment)?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      {yesNoNotSure.map(option => (
                        <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value={option} /></FormControl>
                          <FormLabel className="font-normal">{option}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Future Features Interest</CardTitle>
            <CardDescription>How likely are you to use the following upcoming features? (1 = Not interested, 5 = Very interested)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {futureFeatureQuestions.map(feature => (
              <FormField
                key={feature.id}
                control={form.control}
                name={`futureFeaturesInterest.${feature.id}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{feature.label}</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                        {ratingOptions.map(option => (
                          <FormItem key={`${feature.id}-${option.value}`} className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value={option.value} id={`${feature.id}-${option.value}`} /></FormControl>
                            <FormLabel htmlFor={`${feature.id}-${option.value}`} className="font-normal text-sm">{option.label}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Accessibility & Utility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="signupPreference"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Would you prefer signing up via:</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      {signupPrefs.map(option => (
                        <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value={option} /></FormControl>
                          <FormLabel className="font-normal">{option}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {watchedSignupPreference === "Other" && (
              <FormField
                control={form.control}
                name="signupPreferenceOther"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Please specify "Other" preference:</FormLabel>
                    <FormControl><Input placeholder="Your preferred method" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="permanentStorageImportance"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>How important is it for your content (songs, lyrics, assets) to be stored permanently and accessible across devices?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      {storageImportance.map(option => (
                        <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value={option} /></FormControl>
                          <FormLabel className="font-normal">{option}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plagiarismScanPreference"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Would you like your content to be scanned for plagiarism before publishing?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      {yesNoNotSure.map(option => (
                        <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value={option} /></FormControl>
                          <FormLabel className="font-normal">{option}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Subscription & Value</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="subscriptionInterest"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Would you be interested in a subscription plan offering more features (e.g., collaboration, AI Copilot, extra exports)?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      {subscriptionInterests.map(option => (
                        <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value={option} /></FormControl>
                          <FormLabel className="font-normal">{option}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fairPriceRange"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>What price range would you consider fair for a Premium plan (per month)?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      {priceRanges.map(option => (
                        <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value={option} /></FormControl>
                          <FormLabel className="font-normal">{option}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Open Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="lovedFeatures"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What features would you love to see in a music creation app like La Musique?</FormLabel>
                  <FormControl><Textarea placeholder="Share your dream features..." {...field} rows={4} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="creationChallenges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What challenges do you face when creating music or songwriting?</FormLabel>
                  <FormControl><Textarea placeholder="Tell us about your pain points..." {...field} rows={4} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactForTesting"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Would you like to be contacted to test new features or provide deeper feedback?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      {["Yes", "No"].map(option => (
                        <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value={option} /></FormControl>
                          <FormLabel className="font-normal">{option}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {watchedContactForTesting === "Yes" && (
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Email (for testing/feedback contact):</FormLabel>
                    <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
          Submit Feedback
        </Button>
      </form>
    </Form>
  );
};

export default FeedbackForm;

    