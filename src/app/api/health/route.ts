/**
 * @fileOverview API route for health check.
 * This Next.js App Router route handler provides a simple GET endpoint
 * to verify the application's operational status.
 * It returns a JSON response indicating a healthy status and the current timestamp.
 */
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'healthy', timestamp: new Date().toISOString() }, { status: 200 });
}
