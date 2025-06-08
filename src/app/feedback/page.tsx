/**
 * @fileOverview Feedback page component for La Musique.
 * This page allows users to submit feedback about the application.
 * It renders the AppHeader and the FeedbackForm component within a scrollable area.
 *
 * @exports FeedbackPage - The React functional component for the feedback page.
 */
"use client";

import type { FC } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import FeedbackForm from '@/components/features/feedback/FeedbackForm';
import { ScrollArea } from "@/components/ui/scroll-area";

const FeedbackPage: FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 p-4 md:p-6">
        <ScrollArea className="h-[calc(100vh-100px)]"> {/* Adjust height as needed */}
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-primary">Submit Your Feedback</h1>
              <p className="text-muted-foreground">
                Help us improve La Musique! Your opinions are valuable.
              </p>
            </div>
            <FeedbackForm />
          </div>
        </ScrollArea>
      </main>
    </div>
  );
};

export default FeedbackPage;
