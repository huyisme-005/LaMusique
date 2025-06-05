// src/ai/backend/apiClient.ts
// -------------------------------------------------------------
// API Client for communicating with the Python FastAPI backend
// Handles song creation, retrieval, and listing via HTTP requests
// -------------------------------------------------------------

import axios from 'axios';

// Base URL for the backend API. Can be set via BACKEND_API_URL env variable.
const BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

/**
 * TypeScript interface for creating a new song.
 * Represents the payload sent to the backend when saving a song.
 */
export interface SongCreate {
  title: string; // Title of the song
  lyrics: string; // Lyrics of the song
  genre: string; // Genre of the song
  key: string; // Musical key
  tempo: number; // Tempo in BPM
  melody: string; // Melody data (e.g., MusicXML)
  description?: string; // Optional description of the melody
  lyric_feedback?: string; // Optional feedback on the lyrics
}

/**
 * TypeScript interface for reading a song from the backend.
 * Extends SongCreate with a unique song ID.
 */
export interface SongRead extends SongCreate {
  id: number; // Unique identifier for the song
}

/**
 * Save a new song to the backend database.
 * @param song - SongCreate object containing song data
 * @returns The saved SongRead object from the backend
 */
export async function saveSong(song: SongCreate): Promise<SongRead> {
  const res = await axios.post(`${BASE_URL}/songs/`, song);
  return res.data;
}

/**
 * Retrieve a song by its ID from the backend.
 * @param id - The unique ID of the song
 * @returns The SongRead object from the backend
 */
export async function getSong(id: number): Promise<SongRead> {
  const res = await axios.get(`${BASE_URL}/songs/${id}`);
  return res.data;
}

/**
 * List all songs from the backend (paginated by default backend settings).
 * @returns An array of SongRead objects
 */
export async function listSongs(): Promise<SongRead[]> {
  const res = await axios.get(`${BASE_URL}/songs/`);
  return res.data;
}
