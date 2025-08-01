import { Request, Response } from 'express';
import axios from 'axios';
import { DateIdea } from '../types';

interface QlooInsightRequest {
  interests?: string[];
  tastePreferences?: {
    movies?: string[];
    music?: string[];
    books?: string[];
    tvShows?: string[];
    genres?: string[];
    artists?: string[];
  };
  personality?: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  location?: string;
}

interface QlooApiResponse {
  results?: Array<{
    item: {
      id: string;
      name: string;
      description?: string;
      category?: string;
      metadata?: any;
    };
    score: number;
    reasoning?: string;
  }>;
  status: string;
  message?: string;
}

export const generateDateIdeas = async (
  req: Request<{}, any, QlooInsightRequest>, 
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { interests, tastePreferences, personality, location } = req.body;

    // Check if Qloo API key is configured
    if (!process.env.QLOO_API_KEY) {
      console.log('Qloo API key not configured, using fallback generation');
      const fallbackIdeas = generateFallbackDateIdeas(interests, tastePreferences, personality);
      res.json({
        message: 'Date ideas generated successfully (fallback)',
        dateIdeas: fallbackIdeas
      });
      return;
    }

    try {
      // Prepare data for Qloo API
      const qlooRequestData = prepareQlooRequestData({
        interests,
        tastePreferences,
        personality,
        location
      });

      // Make request to Qloo Insights API
      const qlooResponse = await axios.post(
        'https://hackathon.api.qloo.com/v3/insights/user_to_item_affinity',
        qlooRequestData,
        {
          headers: {
            'X-API-Key': process.env.QLOO_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      // Process Qloo response and convert to DateIdea format
      const dateIdeas = processQlooResponse(qlooResponse.data, interests, tastePreferences);

      res.json({
        message: 'Date ideas generated successfully',
        dateIdeas
      });

    } catch (qlooError: any) {
      console.error('Qloo API error:', qlooError.response?.data || qlooError.message);
      
      // Fallback to template-based generation if Qloo API fails
      console.log('Falling back to template-based date idea generation');
      const fallbackIdeas = generateFallbackDateIdeas(interests, tastePreferences, personality);
      
      res.json({
        message: 'Date ideas generated successfully (fallback)',
        dateIdeas: fallbackIdeas
      });
    }

  } catch (error) {
    console.error('Generate date ideas error:', error);
    res.status(500).json({ error: 'Failed to generate date ideas' });
  }
};

// Prepare data for Qloo API request
const prepareQlooRequestData = (data: QlooInsightRequest) => {
  const { interests, tastePreferences, personality, location } = data;
  
  // Combine all user preferences into a single array for Qloo
  const userPreferences: string[] = [];
  
  // Add interests
  if (interests) {
    userPreferences.push(...interests);
  }
  
  // Add taste preferences
  if (tastePreferences) {
    if (tastePreferences.movies) userPreferences.push(...tastePreferences.movies);
    if (tastePreferences.music) userPreferences.push(...tastePreferences.music);
    if (tastePreferences.books) userPreferences.push(...tastePreferences.books);
    if (tastePreferences.tvShows) userPreferences.push(...tastePreferences.tvShows);
    if (tastePreferences.genres) userPreferences.push(...tastePreferences.genres);
    if (tastePreferences.artists) userPreferences.push(...tastePreferences.artists);
  }

  // Qloo API request structure
  return {
    user_preferences: userPreferences.slice(0, 20), // Limit to 20 items for API efficiency
    item_categories: ['restaurants', 'activities', 'entertainment', 'events'],
    location: location || 'New York, NY', // Default location
    limit: 10,
    personality_traits: personality ? {
      openness: personality.openness,
      conscientiousness: personality.conscientiousness,
      extraversion: personality.extraversion,
      agreeableness: personality.agreeableness,
      neuroticism: personality.neuroticism
    } : undefined
  };
};

// Process Qloo API response and convert to DateIdea format
const processQlooResponse = (
  qlooData: QlooApiResponse, 
  interests?: string[], 
  tastePreferences?: any
): DateIdea[] => {
  if (!qlooData.results || qlooData.results.length === 0) {
    return generateFallbackDateIdeas(interests, tastePreferences);
  }

  return qlooData.results.slice(0, 6).map((result, index) => {
    const item = result.item;
    const score = Math.round(result.score * 100);
    
    // Determine category based on item metadata or name
    const category = determineDateCategory(item.name, item.category, item.metadata);
    
    // Determine cost based on category and metadata
    const cost = determineCost(category, item.metadata);
    
    // Determine duration based on category
    const duration = determineDuration(category);
    
    return {
      id: `qloo-${item.id || index}`,
      title: item.name,
      description: item.description || generateDescription(item.name, category),
      category,
      duration,
      cost,
      vibeMatch: Math.max(75, score) // Ensure minimum 75% vibe match
    };
  });
};

// Determine date category from Qloo item data
const determineDateCategory = (name: string, category?: string, metadata?: any): string => {
  const nameLower = name.toLowerCase();
  
  if (category) {
    switch (category.toLowerCase()) {
      case 'restaurants':
      case 'food':
        return 'Food & Dining';
      case 'activities':
      case 'entertainment':
        return 'Activities & Fun';
      case 'events':
        return 'Events & Culture';
      default:
        break;
    }
  }
  
  // Fallback based on name analysis
  if (nameLower.includes('restaurant') || nameLower.includes('cafe') || nameLower.includes('bar')) {
    return 'Food & Dining';
  } else if (nameLower.includes('museum') || nameLower.includes('gallery') || nameLower.includes('theater')) {
    return 'Arts & Culture';
  } else if (nameLower.includes('park') || nameLower.includes('outdoor') || nameLower.includes('hike')) {
    return 'Outdoor & Adventure';
  } else if (nameLower.includes('music') || nameLower.includes('concert') || nameLower.includes('show')) {
    return 'Music & Entertainment';
  }
  
  return 'Activities & Fun';
};

// Determine cost based on category and metadata
const determineCost = (category: string, metadata?: any): 'Free' | '$' | '$$' | '$$$' => {
  // Check metadata for price information
  if (metadata?.price_range) {
    switch (metadata.price_range.toLowerCase()) {
      case 'free':
      case '0':
        return 'Free';
      case 'low':
      case '1':
        return '$';
      case 'medium':
      case '2':
        return '$$';
      case 'high':
      case '3':
      case '4':
        return '$$$';
    }
  }
  
  // Fallback based on category
  switch (category) {
    case 'Outdoor & Adventure':
      return Math.random() > 0.5 ? 'Free' : '$';
    case 'Food & Dining':
      return Math.random() > 0.3 ? '$$' : '$$$';
    case 'Arts & Culture':
      return Math.random() > 0.4 ? '$' : '$$';
    default:
      return '$$';
  }
};

// Determine duration based on category
const determineDuration = (category: string): string => {
  switch (category) {
    case 'Food & Dining':
      return '1-2 hours';
    case 'Arts & Culture':
      return '2-3 hours';
    case 'Outdoor & Adventure':
      return '3-4 hours';
    case 'Music & Entertainment':
      return '2-4 hours';
    default:
      return '1-3 hours';
  }
};

// Generate description if not provided by Qloo
const generateDescription = (name: string, category: string): string => {
  const descriptions: Record<string, string[]> = {
    'Food & Dining': [
      'Enjoy a delicious meal together in a cozy atmosphere',
      'Discover new flavors and share your favorite dishes',
      'Perfect spot for intimate conversation over great food'
    ],
    'Arts & Culture': [
      'Immerse yourselves in art and culture together',
      'Explore creativity and spark meaningful conversations',
      'Discover new perspectives through shared cultural experiences'
    ],
    'Outdoor & Adventure': [
      'Get active together while enjoying the great outdoors',
      'Create memories through shared adventure and exploration',
      'Perfect for couples who love nature and physical activities'
    ],
    'Music & Entertainment': [
      'Experience live entertainment and create lasting memories',
      'Enjoy music and performances in a vibrant atmosphere',
      'Perfect for music lovers and entertainment enthusiasts'
    ]
  };
  
  const categoryDescriptions = descriptions[category] || descriptions['Food & Dining'];
  return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
};

// Fallback date idea generation when Qloo API is unavailable
const generateFallbackDateIdeas = (
  interests?: string[], 
  tastePreferences?: any, 
  personality?: any
): DateIdea[] => {
  const baseIdeas: Omit<DateIdea, 'id' | 'vibeMatch'>[] = [
    {
      title: 'Artisan Coffee Tasting',
      description: 'Explore specialty coffee roasts and brewing methods at a local roastery',
      category: 'Food & Culture',
      duration: '1-2 hours',
      cost: '$'
    },
    {
      title: 'Sunset Photography Walk',
      description: 'Capture golden hour moments while exploring scenic city spots',
      category: 'Creative & Outdoor',
      duration: '2-3 hours',
      cost: 'Free'
    },
    {
      title: 'Interactive Art Gallery',
      description: 'Experience contemporary art installations and discuss your interpretations',
      category: 'Arts & Culture',
      duration: '2-3 hours',
      cost: '$$'
    },
    {
      title: 'Cooking Class Adventure',
      description: 'Learn to prepare a new cuisine together with hands-on instruction',
      category: 'Food & Learning',
      duration: '3 hours',
      cost: '$$$'
    },
    {
      title: 'Vintage Market Exploration',
      description: 'Hunt for unique treasures and vintage finds at local markets',
      category: 'Shopping & Culture',
      duration: '2-4 hours',
      cost: '$'
    },
    {
      title: 'Rooftop Stargazing',
      description: 'Watch the city lights while identifying constellations together',
      category: 'Romantic & Outdoor',
      duration: '2-3 hours',
      cost: 'Free'
    }
  ];

  // Customize ideas based on user preferences
  let selectedIdeas = [...baseIdeas];
  
  if (interests) {
    if (interests.includes('Music')) {
      selectedIdeas.unshift({
        title: 'Live Music Discovery',
        description: 'Find your new favorite band at an intimate venue',
        category: 'Music & Entertainment',
        duration: '3-4 hours',
        cost: '$$'
      });
    }
    
    if (interests.includes('Books')) {
      selectedIdeas.unshift({
        title: 'Literary Cafe Experience',
        description: 'Browse books while enjoying specialty drinks in a cozy bookstore cafe',
        category: 'Books & Culture',
        duration: '1-2 hours',
        cost: '$'
      });
    }
  }

  // Generate final ideas with IDs and vibe matches
  return selectedIdeas.slice(0, 6).map((idea, index) => ({
    ...idea,
    id: `fallback-${index + 1}`,
    vibeMatch: Math.floor(Math.random() * 20) + 80 // 80-99% match
  }));
};