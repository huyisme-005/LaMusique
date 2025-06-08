/**
 * @fileOverview Utility functions for the application.
 * This file provides helper functions, currently including `cn` for conditionally
 * joining class names using `clsx` and `tailwind-merge`.
 *
 * @exports cn - Function to merge Tailwind CSS classes with clsx.
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
