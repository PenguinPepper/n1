import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import supabase from '../config/supabase';
import { 
  CreateProfileRequest, 
  UpdateProfileRequest, 
  GetProfilesQuery,
  ProfileResponse, 
  ProfilesResponse,
  GenerateBioRequest,
  GenerateBioResponse,
  DatabaseProfile,
  Profile
} from '../types';

// Helper function to convert database profile to API profile
const convertDatabaseProfileToApiProfile = (dbProfile: DatabaseProfile): Profile => ({
  id: dbProfile.id,
  name: dbProfile.name,
  age: dbProfile.age,
  bio: dbProfile.bio,
  photos: dbProfile.photos,
  interests: dbProfile.interests,
  personality: dbProfile.personality,
  tastePreferences: dbProfile.taste_preferences,
  currentVibe: dbProfile.current_vibe,
  createdAt: dbProfile.created_at,
  updatedAt: dbProfile.updated_at
});

export const createProfile = async (
  req: Request<{}, ProfileResponse, CreateProfileRequest>, 
  res: Response<ProfileResponse>
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const {
      name,
      age,
      bio,
      photos,
      interests,
      personality,
      tastePreferences,
      currentVibe
    } = req.body;

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      res.status(400).json({ error: 'Profile already exists' });
      return;
    }

    // Create new profile
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name,
        age,
        bio: bio || '',
        photos: photos || [],
        interests: interests || [],
        personality: personality || {},
        taste_preferences: tastePreferences || {},
        current_vibe: currentVibe || null
      })
      .select()
      .single();

    if (error) {
      console.error('Profile creation error:', error);
      res.status(400).json({ error: error.message });
      return;
    }

    const profile = convertDatabaseProfileToApiProfile(data as DatabaseProfile);

    res.status(201).json({
      message: 'Profile created successfully',
      profile
    });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (
  req: Request<{ userId?: string }, ProfileResponse>, 
  res: Response<ProfileResponse>
): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?.id;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }
      res.status(400).json({ error: error.message });
      return;
    }

    const profile = convertDatabaseProfileToApiProfile(data as DatabaseProfile);

    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (
  req: Request<{}, ProfileResponse, UpdateProfileRequest>, 
  res: Response<ProfileResponse>
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const {
      name,
      age,
      bio,
      photos,
      interests,
      personality,
      tastePreferences,
      currentVibe
    } = req.body;

    // Build update object with only provided fields
    const updateData: Partial<DatabaseProfile> = {};
    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = age;
    if (bio !== undefined) updateData.bio = bio;
    if (photos !== undefined) updateData.photos = photos;
    if (interests !== undefined) updateData.interests = interests;
    if (personality !== undefined) updateData.personality = personality;
    if (tastePreferences !== undefined) updateData.taste_preferences = tastePreferences;
    if (currentVibe !== undefined) updateData.current_vibe = currentVibe;

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      res.status(400).json({ error: error.message });
      return;
    }

    const profile = convertDatabaseProfileToApiProfile(data as DatabaseProfile);

    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Profile deletion error:', error);
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfiles = async (
  req: Request<{}, ProfilesResponse, {}, GetProfilesQuery>, 
  res: Response<ProfilesResponse>
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { limit = '10', offset = '0', minAge, maxAge } = req.query;

    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);

    let query = supabase
      .from('profiles')
      .select('*')
      .neq('id', userId) // Exclude current user
      .range(offsetNum, offsetNum + limitNum - 1);

    // Add age filters if provided
    if (minAge) {
      const minAgeNum = parseInt(minAge, 10);
      if (!isNaN(minAgeNum)) {
        query = query.gte('age', minAgeNum);
      }
    }
    if (maxAge) {
      const maxAgeNum = parseInt(maxAge, 10);
      if (!isNaN(maxAgeNum)) {
        query = query.lte('age', maxAgeNum);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get profiles error:', error);
      res.status(400).json({ error: error.message });
      return;
    }

    const profiles = (data as DatabaseProfile[]).map(convertDatabaseProfileToApiProfile);

    res.json({ profiles });
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const generateBio = async (
  req: Request<{}, GenerateBioResponse, GenerateBioRequest>, 
  res: Response<GenerateBioResponse>
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const {
      interests = [],
      personality = {
        openness: 50,
        conscientiousness: 50,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50
      },
      tastePreferences = {},
      currentBio = ''
    } = req.body;

    // Construct a detailed prompt for AI bio generation
    const prompt = constructBioPrompt({
      interests,
      personality,
      tastePreferences,
      currentBio
    });

    // Simulate AI response (in production, you'd call an actual LLM API here)
    const generatedBio = await simulateAIBioGeneration(prompt, {
      interests,
      personality,
      tastePreferences
    });

    res.json({
      message: 'Bio generated successfully',
      bio: generatedBio
    });
  } catch (error) {
    console.error('Generate bio error:', error);
    res.status(500).json({ error: 'Failed to generate bio' });
  }
};

// Helper function to construct AI prompt
const constructBioPrompt = (data: GenerateBioRequest): string => {
  const { interests, personality, tastePreferences } = data;
  
  let prompt = `Write an engaging, authentic dating app bio (150-200 words) for someone with these characteristics:\n\n`;
  
  // Add interests
  if (interests && interests.length > 0) {
    prompt += `Interests: ${interests.join(', ')}\n`;
  }
  
  // Add personality traits
  if (personality && Object.keys(personality).length > 0) {
    prompt += `Personality traits:\n`;
    if (personality.openness && personality.openness > 60) prompt += `- Highly open to new experiences\n`;
    if (personality.extraversion && personality.extraversion > 60) prompt += `- Outgoing and social\n`;
    if (personality.agreeableness && personality.agreeableness > 60) prompt += `- Cooperative and friendly\n`;
    if (personality.conscientiousness && personality.conscientiousness > 60) prompt += `- Organized and disciplined\n`;
    if (personality.neuroticism && personality.neuroticism < 40) prompt += `- Emotionally stable and calm\n`;
  }
  
  // Add taste preferences
  if (tastePreferences) {
    if (tastePreferences.movies && tastePreferences.movies.length > 0) {
      prompt += `Favorite movies: ${tastePreferences.movies.join(', ')}\n`;
    }
    if (tastePreferences.music && tastePreferences.music.length > 0) {
      prompt += `Music taste: ${tastePreferences.music.join(', ')}\n`;
    }
    if (tastePreferences.books && tastePreferences.books.length > 0) {
      prompt += `Favorite books: ${tastePreferences.books.join(', ')}\n`;
    }
    if (tastePreferences.genres && tastePreferences.genres.length > 0) {
      prompt += `Preferred genres: ${tastePreferences.genres.join(', ')}\n`;
    }
  }
  
  prompt += `\nWrite a bio that:\n`;
  prompt += `- Sounds natural and conversational\n`;
  prompt += `- Highlights unique personality traits\n`;
  prompt += `- Mentions specific cultural interests\n`;
  prompt += `- Includes a conversation starter\n`;
  prompt += `- Avoids clichés and generic phrases\n`;
  prompt += `- Shows authenticity and depth\n`;
  
  return prompt;
};

// Simulate AI bio generation (replace with actual LLM API call in production)
const simulateAIBioGeneration = async (
  prompt: string, 
  data: GenerateBioRequest
): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const { interests, personality, tastePreferences } = data;
  
  // Generate bio based on user data
  const bioTemplates = [
    generateCreativeBio(interests, tastePreferences),
    generateAdventurousBio(interests, personality),
    generateIntellectualBio(tastePreferences, personality),
    generateCasualBio(interests, tastePreferences)
  ];
  
  // Select template based on personality
  let selectedBio = bioTemplates[0];
  
  if (personality?.openness && personality.openness > 70) {
    selectedBio = bioTemplates[1]; // Adventurous
  } else if (personality?.conscientiousness && personality.conscientiousness > 70) {
    selectedBio = bioTemplates[2]; // Intellectual
  } else if (personality?.extraversion && personality.extraversion > 70) {
    selectedBio = bioTemplates[3]; // Casual
  }
  
  return selectedBio;
};

// Bio generation templates
const generateCreativeBio = (interests: string[] = [], tastePreferences: any = {}): string => {
  const movies = tastePreferences.movies || [];
  const music = tastePreferences.music || [];
  const books = tastePreferences.books || [];
  
  let bio = "Creative soul with a passion for ";
  
  if (interests.includes('Art') || interests.includes('Photography')) {
    bio += "visual storytelling and artistic expression. ";
  } else if (interests.includes('Music')) {
    bio += "musical discovery and sonic adventures. ";
  } else {
    bio += "authentic experiences and meaningful connections. ";
  }
  
  if (movies.length > 0) {
    bio += `You'll find me analyzing the cinematography in ${movies[0]} or `;
  }
  
  if (music.length > 0) {
    bio += `getting lost in ${music[0]}'s latest album. `;
  }
  
  if (books.length > 0) {
    bio += `Currently reading ${books[0]} and always up for book recommendations. `;
  }
  
  bio += "I believe the best conversations happen over coffee at 2 AM or during spontaneous road trips. ";
  bio += "Looking for someone who appreciates both deep thoughts and silly moments. ";
  bio += "What's the last piece of art that made you stop in your tracks?";
  
  return bio;
};

const generateAdventurousBio = (interests: string[] = [], personality: any = {}): string => {
  let bio = "Adventure seeker with an insatiable curiosity for life's experiences. ";
  
  if (interests.includes('Travel')) {
    bio += "Just got back from exploring hidden gems in the city and already planning the next adventure. ";
  } else if (interests.includes('Hiking')) {
    bio += "You'll find me on mountain trails at sunrise or discovering new hiking spots. ";
  } else {
    bio += "Always saying yes to new experiences and spontaneous plans. ";
  }
  
  bio += "I'm the type who tries the weirdest item on the menu and actually enjoys it. ";
  bio += "Equally comfortable at a hole-in-the-wall taco place or a fancy rooftop bar. ";
  bio += "Looking for a partner in crime who's up for both planned adventures and random 3 AM decisions. ";
  bio += "What's the most spontaneous thing you've done lately?";
  
  return bio;
};

const generateIntellectualBio = (tastePreferences: any = {}, personality: any = {}): string => {
  const books = tastePreferences.books || [];
  const movies = tastePreferences.movies || [];
  
  let bio = "Thoughtful conversationalist who finds beauty in ideas and deep discussions. ";
  
  if (books.length > 0) {
    bio += `Currently pondering the themes in ${books[0]} and always have a book recommendation ready. `;
  }
  
  if (movies.length > 0) {
    bio += `I'm the person who stays for the credits and wants to discuss the symbolism in ${movies[0]}. `;
  }
  
  bio += "I believe the best dates involve museums, bookstores, or long walks where we lose track of time talking. ";
  bio += "Equally fascinated by quantum physics and the perfect cup of coffee. ";
  bio += "Looking for someone who appreciates both intellectual debates and comfortable silences. ";
  bio += "What's a book that completely changed your perspective?";
  
  return bio;
};

const generateCasualBio = (interests: string[] = [], tastePreferences: any = {}): string => {
  const music = tastePreferences.music || [];
  
  let bio = "Easy-going person who believes life's too short for bad vibes and boring conversations. ";
  
  if (music.length > 0) {
    bio += `My Spotify is a chaotic mix of everything, but ${music[0]} is currently on repeat. `;
  }
  
  if (interests.includes('Coffee')) {
    bio += "Coffee enthusiast who knows the best local spots and isn't afraid to try new roasts. ";
  }
  
  bio += "I'm equally happy binge-watching a new series or trying that restaurant everyone's talking about. ";
  bio += "Good at making people laugh and even better at finding the perfect meme for any situation. ";
  bio += "Looking for someone genuine who doesn't take themselves too seriously. ";
  bio += "What's your go-to comfort show when you need to unwind?";
  
  return bio;
};