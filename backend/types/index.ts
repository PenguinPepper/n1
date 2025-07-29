import { Request } from 'express';

// Database Profile interface (matches Supabase schema with snake_case)
export interface DatabaseProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  interests: string[];
  personality: PersonalityTraits;
  taste_preferences: TastePreferences;
  current_vibe: CurrentVibe | null;
  created_at: string;
  updated_at: string;
}

// API Profile interface (matches frontend with camelCase)
export interface Profile {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  interests: string[];
  personality: PersonalityTraits;
  tastePreferences: TastePreferences;
  currentVibe: CurrentVibe | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface TastePreferences {
  movies: string[];
  music: string[];
  books: string[];
  tvShows: string[];
  genres: string[];
  artists: string[];
}

export interface CurrentVibe {
  content: string;
  type: 'song' | 'movie' | 'book' | 'show';
  timestamp: Date;
}

// Auth interfaces
export interface SignUpRequest {
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
  };
  session?: any;
}

// Profile request interfaces
export interface CreateProfileRequest {
  name: string;
  age: number;
  bio?: string;
  photos?: string[];
  interests?: string[];
  personality?: PersonalityTraits;
  tastePreferences?: TastePreferences;
  currentVibe?: CurrentVibe;
}

export interface UpdateProfileRequest {
  name?: string;
  age?: number;
  bio?: string;
  photos?: string[];
  interests?: string[];
  personality?: PersonalityTraits;
  tastePreferences?: TastePreferences;
  currentVibe?: CurrentVibe;
}

export interface GetProfilesQuery {
  limit?: string;
  offset?: string;
  minAge?: string;
  maxAge?: string;
}

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        aud: string;
        role?: string;
      };
    }
  }
}

// API Response interfaces
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

export interface ProfileResponse extends ApiResponse {
  profile?: Profile;
}

export interface ProfilesResponse extends ApiResponse {
  profiles?: Profile[];
}