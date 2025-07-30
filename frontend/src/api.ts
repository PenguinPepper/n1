import axios from 'axios';

// API base URL - adjust based on your environment
const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('authToken');
      // You might want to redirect to login page here
      console.warn('Authentication token expired');
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signUp: async (email: string, password: string) => {
    const response = await api.post('/auth/signup', { email, password });
    return response.data;
  },

  signIn: async (email: string, password: string) => {
    const response = await api.post('/auth/signin', { email, password });
    return response.data;
  },

  signOut: async () => {
    const response = await api.post('/auth/signout');
    localStorage.removeItem('authToken');
    return response.data;
  },
};

// Profile API calls
export const profileAPI = {
  createProfile: async (profileData: {
    name: string;
    age: number;
    bio?: string;
    photos?: string[];
    interests?: string[];
    personality?: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    tastePreferences?: {
      movies: string[];
      music: string[];
      books: string[];
      tvShows: string[];
      genres: string[];
      artists: string[];
    };
    currentVibe?: {
      content: string;
      type: 'song' | 'movie' | 'book' | 'show';
      timestamp: Date;
    };
  }) => {
    const response = await api.post('/profiles', profileData);
    return response.data;
  },

  getProfile: async (userId?: string) => {
    const endpoint = userId ? `/profiles/${userId}` : '/profiles/me';
    const response = await api.get(endpoint);
    return response.data;
  },

  updateProfile: async (profileData: Partial<{
    name: string;
    age: number;
    bio: string;
    photos: string[];
    interests: string[];
    personality: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    tastePreferences: {
      movies: string[];
      music: string[];
      books: string[];
      tvShows: string[];
      genres: string[];
      artists: string[];
    };
    currentVibe: {
      content: string;
      type: 'song' | 'movie' | 'book' | 'show';
      timestamp: Date;
    };
  }>) => {
    const response = await api.put('/profiles/me', profileData);
    return response.data;
  },

  deleteProfile: async () => {
    const response = await api.delete('/profiles/me');
    return response.data;
  },

  getProfiles: async (params?: {
    limit?: number;
    offset?: number;
    minAge?: number;
    maxAge?: number;
  }) => {
    const response = await api.get('/profiles', { params });
    return response.data;
  },
  
generateBio: async (bioData: {
    interests?: string[];
    personality?: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    tastePreferences?: {
      movies: string[];
      music: string[];
      books: string[];
      tvShows: string[];
      genres: string[];
      artists: string[];
    };
    currentBio?: string;
  }) => {
    const response = await api.post('/profiles/generate-bio', bioData);
    return response.data;
  },
};

export default api;