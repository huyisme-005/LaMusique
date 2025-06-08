/**
 * @fileOverview Root layout component for the La Musique application.
 * This file defines the main HTML structure, including metadata, fonts,
 * global styles, Toaster for notifications, and Vercel Analytics.
 * It wraps all page content.
 *
 * @exports RootLayout - The main layout React component.
 * @exports metadata - The default metadata for the application.
 */
import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'La Musique - Your Creative Music Partner',
  description: 'AI-powered song and melody generation, refinement, and inspiration by La Musique.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
