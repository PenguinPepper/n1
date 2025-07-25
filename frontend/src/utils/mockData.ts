import type { User, MatchInsight, DateIdea, TasteResult, VibeMatch, ChatMessage, Conversation } from '../types';

export const currentUser: User = {
  id: 'current-user',
  name: 'You',
  age: 26,
  photos: ['https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400'],
  bio: 'Love discovering new music and hidden coffee spots',
  interests: ['Music', 'Coffee', 'Art', 'Travel'],
  personality: {
    openness: 85,
    conscientiousness: 70,
    extraversion: 75,
    agreeableness: 80,
    neuroticism: 35
  }
};

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Emma',
    age: 24,
    photos: ['https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400'],
    bio: 'Artist by day, vinyl collector by night',
    interests: ['Art', 'Vinyl Records', 'Photography', 'Indie Music'],
    currentVibe: {
      content: 'Listening to Tame Impala - The Less I Know The Better',
      type: 'song',
      timestamp: new Date()
    },
    personality: {
      openness: 90,
      conscientiousness: 65,
      extraversion: 60,
      agreeableness: 85,
      neuroticism: 40
    }
  },
  {
    id: '2',
    name: 'Alex',
    age: 28,
    photos: ['https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400'],
    bio: 'Coffee enthusiast and weekend hiker',
    interests: ['Coffee', 'Hiking', 'Books', 'Craft Beer'],
    currentVibe: {
      content: 'Just watched Blade Runner 2049',
      type: 'movie',
      timestamp: new Date()
    },
    personality: {
      openness: 80,
      conscientiousness: 85,
      extraversion: 70,
      agreeableness: 75,
      neuroticism: 30
    }
  }
];

export const generateMatchInsights = (user: User): MatchInsight[] => [
  {
    category: 'Creative Compatibility',
    score: 92,
    description: 'Strong creative synergy',
    details: [
      'Both value artistic expression highly',
      'Similar appreciation for indie culture',
      'Complementary creative personalities'
    ]
  },
  {
    category: 'Lifestyle Alignment',
    score: 88,
    description: 'Great lifestyle match',
    details: [
      'Shared love for coffee culture',
      'Similar social energy levels',
      'Compatible weekend preferences'
    ]
  },
  {
    category: 'Intellectual Connection',
    score: 85,
    description: 'Strong mental connection',
    details: [
      'High openness to new experiences',
      'Similar curiosity levels',
      'Engaging conversation potential'
    ]
  }
];

export const mockDateIdeas: DateIdea[] = [
  {
    id: '1',
    title: 'Record Store Exploration',
    description: 'Discover new music together while browsing vintage vinyl collections',
    category: 'Music & Culture',
    duration: '2-3 hours',
    cost: '$',
    vibeMatch: 95
  },
  {
    id: '2',
    title: 'Art Gallery & Coffee',
    description: 'Start with contemporary art, then discuss over specialty coffee',
    category: 'Arts & Culture',
    duration: '3-4 hours',
    cost: '$$',
    vibeMatch: 88
  },
  {
    id: '3',
    title: 'Sunset Photography Walk',
    description: 'Capture golden hour moments in the city\'s most photogenic spots',
    category: 'Creative & Outdoor',
    duration: '1-2 hours',
    cost: 'Free',
    vibeMatch: 82
  }
];

export const generateTasteResults = (keyword: string): TasteResult => {
  const results: Record<string, TasteResult> = {
    'cyberpunk': {
      movies: ['Blade Runner 2049', 'Ghost in the Shell', 'The Matrix', 'Akira'],
      music: ['Perturbator', 'Carpenter Brut', 'Power Trip', 'Daniel Deluxe'],
      books: ['Neuromancer', 'Snow Crash', 'Do Androids Dream', 'Altered Carbon'],
      vibes: ['Neon-lit nights', 'Digital rebellion', 'Future noir', 'Tech dystopia']
    },
    'lofi': {
      movies: ['Lost in Translation', 'Her', 'Midnight in Paris', 'The Royal Tenenbaums'],
      music: ['Nujabes', 'j^p^n', 'Boards of Canada', 'Emancipator'],
      books: ['Norwegian Wood', 'The Wind-Up Bird Chronicle', 'Colorless Tsukuru Tazaki'],
      vibes: ['Rainy afternoons', 'Cozy studying', 'Nostalgic memories', 'Quiet contemplation']
    },
    'vintage': {
      movies: ['Casablanca', 'Roman Holiday', 'Singin\' in the Rain', 'The Apartment'],
      music: ['Ella Fitzgerald', 'Frank Sinatra', 'Billie Holiday', 'Dean Martin'],
      books: ['The Great Gatsby', 'To Kill a Mockingbird', 'Pride and Prejudice'],
      vibes: ['Golden age glamour', 'Classic elegance', 'Timeless romance', 'Old Hollywood']
    }
  };

  return results[keyword.toLowerCase()] || {
    movies: ['Discover something new...'],
    music: ['Explore fresh sounds...'],
    books: ['Find your next read...'],
    vibes: ['Create new experiences...']
  };
};

export const generateVibeMatches = (content: string): VibeMatch[] => [
  {
    user: mockUsers[0],
    similarity: 94,
    sharedContent: ['Tame Impala', 'Indie Rock', 'Psychedelic Pop']
  },
  {
    user: mockUsers[1],
    similarity: 76,
    sharedContent: ['Atmospheric Music', 'Chill Vibes']
  }
];

export const generateMockChatMessages = (userId: string): ChatMessage[] => {
  const baseMessages: Omit<ChatMessage, 'id' | 'timestamp'>[] = [
    { senderId: userId, text: "Hey! Thanks for the match 😊", type: 'text' },
    { senderId: 'current-user', text: "Hi! I loved your taste in music, especially Tame Impala!", type: 'text' },
    { senderId: userId, text: "Right?! Their new album is incredible. Have you seen them live?", type: 'text' },
    { senderId: 'current-user', text: "Not yet, but it's definitely on my bucket list! 🎵", type: 'text' },
    { senderId: userId, text: "We should definitely go together when they tour again!", type: 'text' },
    { senderId: 'current-user', text: "That sounds amazing! I'd love that", type: 'text' },
    { senderId: userId, text: "Perfect! So tell me, what's your favorite coffee spot in the city?", type: 'text' },
    { senderId: 'current-user', text: "There's this hidden gem called Blue Bottle - amazing pour-overs ☕", type: 'text' },
    { senderId: userId, text: "Oh I know that place! Their single origins are incredible", type: 'text' },
    { senderId: 'current-user', text: "Yes! Maybe we could check it out together sometime?", type: 'text' }
  ];

  return baseMessages.map((msg, index) => ({
    ...msg,
    id: `msg-${index + 1}`,
    timestamp: new Date(Date.now() - (baseMessages.length - index) * 300000) // 5 min intervals
  }));
};