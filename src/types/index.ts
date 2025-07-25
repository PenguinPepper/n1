export interface User {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio: string;
  interests: string[];
  currentVibe?: {
    content: string;
    type: 'song' | 'movie' | 'book' | 'show';
    timestamp: Date;
  };
  personality: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
}

export interface MatchInsight {
  category: string;
  score: number;
  description: string;
  details: string[];
}

export interface DateIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  cost: 'Free' | '$' | '$$' | '$$$';
  vibeMatch: number;
}

export interface TasteResult {
  movies: string[];
  music: string[];
  books: string[];
  vibes: string[];
}

export interface VibeMatch {
  user: User;
  similarity: number;
  sharedContent: string[];
}