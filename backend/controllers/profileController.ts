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
  ProcessMatchRequest,
  MatchProcessResponse,
  TasteNuance,
  DatabaseProfile,
  Profile
} from '../types';
import OpenAI from 'openai';

//Initialise openai client

const openaiClient = new OpenAI

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

  const generatedBio = await generateAIBio(prompt, {
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
const generateAIBio = async (
  prompt: string, 
  data: GenerateBioRequest
): Promise<string> => {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert dating profile writer who creates authentic, engaging, and personalized bios that help people make genuine connections. Write bios that are conversational, specific, and avoid clichés."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.8,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const generatedBio = completion.choices[0]?.message?.content?.trim();
    
    if (!generatedBio) {
      throw new Error('No bio content generated');
    }

    return generatedBio;
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    // Fallback to template-based generation if OpenAI fails
    console.log('Falling back to template-based bio generation');
    return generateFallbackBio(data);
  }
};

// Fallback bio generation using templates
const generateFallbackBio = (data: GenerateBioRequest): string => {
  const { interests, personality, tastePreferences } = data;
  
  // Generate bio based on user data using templates
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

export const processMatch = async (
  req: Request<{}, MatchProcessResponse, ProcessMatchRequest>, 
  res: Response<MatchProcessResponse>
): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      res.status(401);
      return;
    }

    const { targetUserId } = req.body;
    if (!targetUserId) {
      res.status(400);
      return;
    }

    // Fetch both user profiles
    const [currentUserResult, targetUserResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', currentUserId).single(),
      supabase.from('profiles').select('*').eq('id', targetUserId).single()
    ]);

    if (currentUserResult.error || targetUserResult.error) {
      res.status(404);
      return;
    }

    const currentUser = currentUserResult.data as DatabaseProfile;
    const targetUser = targetUserResult.data as DatabaseProfile;

    // Generate taste nuances
    const tasteNuances = generateTasteNuances(currentUser, targetUser);
    
    // Calculate compatibility score
    const compatibilityScore = calculateCompatibilityScore(currentUser, targetUser);

    // For now, assume all likes result in matches (in production, you'd check mutual likes)
    const isMatch = true;

    res.json({
      message: 'Match processed successfully',
      isMatch,
      tasteNuances,
      compatibilityScore
    });
  } catch (error) {
    console.error('Process match error:', error);
    res.status(500);
  }
};

// Helper function to generate taste nuances
const generateTasteNuances = (user1: DatabaseProfile, user2: DatabaseProfile): TasteNuance[] => {
  const nuances: TasteNuance[] = [];

  // Analyze movie preferences
  const movieNuance = analyzeMovieTastes(user1, user2);
  if (movieNuance) nuances.push(movieNuance);

  // Analyze music preferences
  const musicNuance = analyzeMusicTastes(user1, user2);
  if (musicNuance) nuances.push(musicNuance);

  // Analyze book preferences
  const bookNuance = analyzeBookTastes(user1, user2);
  if (bookNuance) nuances.push(bookNuance);

  // Analyze general interests
  const interestNuance = analyzeGeneralInterests(user1, user2);
  if (interestNuance) nuances.push(interestNuance);

  // Analyze personality compatibility
  const personalityNuance = analyzePersonalityCompatibility(user1, user2);
  if (personalityNuance) nuances.push(personalityNuance);

  return nuances;
};

// Movie taste analysis
const analyzeMovieTastes = (user1: DatabaseProfile, user2: DatabaseProfile): TasteNuance | null => {
  const user1Movies = user1.taste_preferences?.movies || [];
  const user2Movies = user2.taste_preferences?.movies || [];
  
  if (user1Movies.length === 0 || user2Movies.length === 0) return null;

  const sharedMovies = user1Movies.filter(movie => 
    user2Movies.some(otherMovie => 
      movie.toLowerCase().includes(otherMovie.toLowerCase()) || 
      otherMovie.toLowerCase().includes(movie.toLowerCase())
    )
  );

  if (sharedMovies.length === 0) {
    // Look for genre similarities
    const cinematicStyles = analyzeCinematicStyles(user1Movies, user2Movies);
    if (cinematicStyles.length > 0) {
      return {
        category: 'Cinematic Sensibilities',
        sharedItems: cinematicStyles,
        description: `You both gravitate toward ${cinematicStyles.join(' and ')} storytelling, suggesting a shared appreciation for nuanced filmmaking.`,
        nuanceLevel: 'deep',
        examples: [`Your taste for ${user1Movies[0]} and their love of ${user2Movies[0]} both reflect this aesthetic.`]
      };
    }
    return null;
  }

  const nuanceLevel = sharedMovies.length >= 3 ? 'profound' : sharedMovies.length >= 2 ? 'deep' : 'surface';
  
  return {
    category: 'Film Appreciation',
    sharedItems: sharedMovies,
    description: generateMovieDescription(sharedMovies, nuanceLevel),
    nuanceLevel,
    examples: generateMovieExamples(sharedMovies, user1Movies, user2Movies)
  };
};

// Music taste analysis
const analyzeMusicTastes = (user1: DatabaseProfile, user2: DatabaseProfile): TasteNuance | null => {
  const user1Music = user1.taste_preferences?.music || [];
  const user2Music = user2.taste_preferences?.music || [];
  
  if (user1Music.length === 0 || user2Music.length === 0) return null;

  const sharedMusic = user1Music.filter(artist => 
    user2Music.some(otherArtist => 
      artist.toLowerCase().includes(otherArtist.toLowerCase()) || 
      otherArtist.toLowerCase().includes(artist.toLowerCase())
    )
  );

  if (sharedMusic.length === 0) {
    // Analyze musical styles and genres
    const musicalStyles = analyzeMusicalStyles(user1Music, user2Music);
    if (musicalStyles.length > 0) {
      return {
        category: 'Musical Wavelength',
        sharedItems: musicalStyles,
        description: `Your musical tastes align in the ${musicalStyles.join(' and ')} spectrum, indicating a shared sonic sensibility.`,
        nuanceLevel: 'deep',
        examples: [`The atmospheric quality in your favorite artists suggests you both appreciate layered, emotive soundscapes.`]
      };
    }
    return null;
  }

  const nuanceLevel = sharedMusic.length >= 3 ? 'profound' : sharedMusic.length >= 2 ? 'deep' : 'surface';
  
  return {
    category: 'Musical Connection',
    sharedItems: sharedMusic,
    description: generateMusicDescription(sharedMusic, nuanceLevel),
    nuanceLevel,
    examples: generateMusicExamples(sharedMusic, user1Music, user2Music)
  };
};

// Book taste analysis
const analyzeBookTastes = (user1: DatabaseProfile, user2: DatabaseProfile): TasteNuance | null => {
  const user1Books = user1.taste_preferences?.books || [];
  const user2Books = user2.taste_preferences?.books || [];
  
  if (user1Books.length === 0 || user2Books.length === 0) return null;

  const sharedBooks = user1Books.filter(book => 
    user2Books.some(otherBook => 
      book.toLowerCase().includes(otherBook.toLowerCase()) || 
      otherBook.toLowerCase().includes(book.toLowerCase())
    )
  );

  if (sharedBooks.length === 0) {
    // Analyze literary themes and styles
    const literaryThemes = analyzeLiteraryThemes(user1Books, user2Books);
    if (literaryThemes.length > 0) {
      return {
        category: 'Literary Resonance',
        sharedItems: literaryThemes,
        description: `You both are drawn to ${literaryThemes.join(' and ')} narratives, suggesting aligned intellectual curiosities.`,
        nuanceLevel: 'deep',
        examples: [`Your reading choices reflect a shared appreciation for thought-provoking storytelling.`]
      };
    }
    return null;
  }

  const nuanceLevel = sharedBooks.length >= 3 ? 'profound' : sharedBooks.length >= 2 ? 'deep' : 'surface';
  
  return {
    category: 'Literary Kinship',
    sharedItems: sharedBooks,
    description: generateBookDescription(sharedBooks, nuanceLevel),
    nuanceLevel,
    examples: generateBookExamples(sharedBooks, user1Books, user2Books)
  };
};

// General interests analysis
const analyzeGeneralInterests = (user1: DatabaseProfile, user2: DatabaseProfile): TasteNuance | null => {
  const user1Interests = user1.interests || [];
  const user2Interests = user2.interests || [];
  
  if (user1Interests.length === 0 || user2Interests.length === 0) return null;

  const sharedInterests = user1Interests.filter(interest => 
    user2Interests.some(otherInterest => 
      interest.toLowerCase() === otherInterest.toLowerCase()
    )
  );

  if (sharedInterests.length === 0) return null;

  const nuanceLevel = sharedInterests.length >= 4 ? 'profound' : sharedInterests.length >= 2 ? 'deep' : 'surface';
  
  return {
    category: 'Lifestyle Harmony',
    sharedItems: sharedInterests,
    description: generateInterestDescription(sharedInterests, nuanceLevel),
    nuanceLevel,
    examples: [`Your mutual love for ${sharedInterests.slice(0, 2).join(' and ')} suggests compatible ways of spending time together.`]
  };
};

// Personality compatibility analysis
const analyzePersonalityCompatibility = (user1: DatabaseProfile, user2: DatabaseProfile): TasteNuance | null => {
  const p1 = user1.personality || {};
  const p2 = user2.personality || {};
  
  if (Object.keys(p1).length === 0 || Object.keys(p2).length === 0) return null;

  const compatibleTraits: string[] = [];
  const insights: string[] = [];

  // Analyze openness compatibility
  if (Math.abs((p1.openness || 50) - (p2.openness || 50)) <= 20) {
    compatibleTraits.push('Openness to Experience');
    insights.push('You both share a similar appetite for new experiences and creative exploration.');
  }

  // Analyze extraversion compatibility
  if (Math.abs((p1.extraversion || 50) - (p2.extraversion || 50)) <= 25) {
    compatibleTraits.push('Social Energy');
    insights.push('Your social energy levels are well-matched, suggesting comfortable interaction dynamics.');
  }

  // Analyze agreeableness compatibility
  if (Math.abs((p1.agreeableness || 50) - (p2.agreeableness || 50)) <= 20) {
    compatibleTraits.push('Interpersonal Harmony');
    insights.push('You both value cooperation and understanding in relationships.');
  }

  if (compatibleTraits.length === 0) return null;

  return {
    category: 'Personality Synergy',
    sharedItems: compatibleTraits,
    description: `Your personalities complement each other across ${compatibleTraits.length} key dimensions.`,
    nuanceLevel: compatibleTraits.length >= 3 ? 'profound' : 'deep',
    examples: insights
  };
};

// Helper functions for style analysis
const analyzeCinematicStyles = (movies1: string[], movies2: string[]): string[] => {
  const styles: string[] = [];
  
  // Check for indie/arthouse preferences
  const indieKeywords = ['wes anderson', 'charlie kaufman', 'denis villeneuve', 'christopher nolan', 'greta gerwig'];
  if (movies1.some(m => indieKeywords.some(k => m.toLowerCase().includes(k))) &&
      movies2.some(m => indieKeywords.some(k => m.toLowerCase().includes(k)))) {
    styles.push('auteur-driven');
  }
  
  // Check for sci-fi preferences
  const scifiKeywords = ['blade runner', 'matrix', 'interstellar', 'arrival', 'ex machina'];
  if (movies1.some(m => scifiKeywords.some(k => m.toLowerCase().includes(k))) &&
      movies2.some(m => scifiKeywords.some(k => m.toLowerCase().includes(k)))) {
    styles.push('cerebral sci-fi');
  }
  
  return styles;
};

const analyzeMusicalStyles = (music1: string[], music2: string[]): string[] => {
  const styles: string[] = [];
  
  // Check for indie preferences
  const indieKeywords = ['tame impala', 'radiohead', 'arctic monkeys', 'the strokes', 'vampire weekend'];
  if (music1.some(m => indieKeywords.some(k => m.toLowerCase().includes(k))) &&
      music2.some(m => indieKeywords.some(k => m.toLowerCase().includes(k)))) {
    styles.push('indie/alternative');
  }
  
  // Check for electronic preferences
  const electronicKeywords = ['aphex twin', 'boards of canada', 'burial', 'four tet', 'bonobo'];
  if (music1.some(m => electronicKeywords.some(k => m.toLowerCase().includes(k))) &&
      music2.some(m => electronicKeywords.some(k => m.toLowerCase().includes(k)))) {
    styles.push('atmospheric electronic');
  }
  
  return styles;
};

const analyzeLiteraryThemes = (books1: string[], books2: string[]): string[] => {
  const themes: string[] = [];
  
  // Check for literary fiction
  const literaryKeywords = ['murakami', 'kafka', 'borges', 'calvino', 'atwood'];
  if (books1.some(b => literaryKeywords.some(k => b.toLowerCase().includes(k))) &&
      books2.some(b => literaryKeywords.some(k => b.toLowerCase().includes(k)))) {
    themes.push('literary fiction');
  }
  
  // Check for philosophical themes
  const philKeywords = ['camus', 'sartre', 'hesse', 'dostoyevsky', 'nietzsche'];
  if (books1.some(b => philKeywords.some(k => b.toLowerCase().includes(k))) &&
      books2.some(b => philKeywords.some(k => b.toLowerCase().includes(k)))) {
    themes.push('philosophical exploration');
  }
  
  return themes;
};

// Description generators
const generateMovieDescription = (sharedMovies: string[], level: string): string => {
  if (level === 'profound') {
    return `Your film tastes reveal a profound connection - you both appreciate ${sharedMovies.slice(0, 2).join(' and ')} among others, suggesting you share sophisticated cinematic sensibilities and likely enjoy deep post-movie discussions.`;
  } else if (level === 'deep') {
    return `You have overlapping film appreciation with shared love for ${sharedMovies[0]}, indicating compatible storytelling preferences and similar emotional responses to cinema.`;
  } else {
    return `You both enjoy ${sharedMovies[0]}, which suggests some alignment in your entertainment preferences.`;
  }
};

const generateMusicDescription = (sharedMusic: string[], level: string): string => {
  if (level === 'profound') {
    return `Your musical connection runs deep - sharing artists like ${sharedMusic.slice(0, 2).join(' and ')} suggests you're on the same emotional wavelength and likely have similar ways of processing feelings through sound.`;
  } else if (level === 'deep') {
    return `You both resonate with ${sharedMusic[0]}, indicating aligned musical sensibilities and possibly similar moods and energy levels.`;
  } else {
    return `Your mutual appreciation for ${sharedMusic[0]} shows some common ground in musical taste.`;
  }
};

const generateBookDescription = (sharedBooks: string[], level: string): string => {
  if (level === 'profound') {
    return `Your literary connection is remarkable - both drawn to works like ${sharedBooks.slice(0, 2).join(' and ')}, suggesting you share intellectual curiosities and similar ways of processing complex ideas.`;
  } else if (level === 'deep') {
    return `You both connect with ${sharedBooks[0]}, indicating compatible intellectual interests and possibly similar life philosophies.`;
  } else {
    return `Your shared appreciation for ${sharedBooks[0]} suggests some alignment in reading preferences.`;
  }
};

const generateInterestDescription = (sharedInterests: string[], level: string): string => {
  if (level === 'profound') {
    return `Your lifestyle compatibility is striking - sharing interests in ${sharedInterests.slice(0, 3).join(', ')} suggests you'd naturally enjoy spending time together and have built-in conversation topics.`;
  } else if (level === 'deep') {
    return `You both are passionate about ${sharedInterests.slice(0, 2).join(' and ')}, indicating compatible ways of spending free time and shared values.`;
  } else {
    return `Your mutual interest in ${sharedInterests[0]} provides a natural connection point.`;
  }
};

const generateMovieExamples = (shared: string[], user1Movies: string[], user2Movies: string[]): string[] => {
  return [`The fact that you both appreciate ${shared[0]} suggests you value ${getMovieQuality(shared[0])} in storytelling.`];
};

const generateMusicExamples = (shared: string[], user1Music: string[], user2Music: string[]): string[] => {
  return [`Your shared love for ${shared[0]} indicates you both appreciate ${getMusicQuality(shared[0])} in music.`];
};

const generateBookExamples = (shared: string[], user1Books: string[], user2Books: string[]): string[] => {
  return [`Both being drawn to ${shared[0]} suggests you value ${getBookQuality(shared[0])} in literature.`];
};

const getMovieQuality = (movie: string): string => {
  const qualities = ['complex narratives', 'visual storytelling', 'emotional depth', 'innovative cinematography'];
  return qualities[Math.floor(Math.random() * qualities.length)];
};

const getMusicQuality = (artist: string): string => {
  const qualities = ['atmospheric soundscapes', 'emotional authenticity', 'innovative production', 'lyrical depth'];
  return qualities[Math.floor(Math.random() * qualities.length)];
};

const getBookQuality = (book: string): string => {
  const qualities = ['psychological complexity', 'philosophical depth', 'narrative innovation', 'emotional resonance'];
  return qualities[Math.floor(Math.random() * qualities.length)];
};

// Calculate overall compatibility score
const calculateCompatibilityScore = (user1: DatabaseProfile, user2: DatabaseProfile): number => {
  let score = 0;
  let factors = 0;

  // Interest compatibility (25% weight)
  const sharedInterests = (user1.interests || []).filter(interest => 
    (user2.interests || []).includes(interest)
  ).length;
  const totalInterests = Math.max((user1.interests || []).length, (user2.interests || []).length);
  if (totalInterests > 0) {
    score += (sharedInterests / totalInterests) * 25;
    factors++;
  }

  // Taste preferences compatibility (50% weight)
  const tasteScore = calculateTasteCompatibility(user1.taste_preferences || {}, user2.taste_preferences || {});
  score += tasteScore * 50;
  factors++;

  // Personality compatibility (25% weight)
  const personalityScore = calculatePersonalityCompatibility(user1.personality || {}, user2.personality || {});
  score += personalityScore * 25;
  factors++;

  return Math.round(score / factors);
};

const calculateTasteCompatibility = (taste1: any, taste2: any): number => {
  let compatibility = 0;
  let categories = 0;

  ['movies', 'music', 'books', 'tvShows'].forEach(category => {
    const items1 = taste1[category] || [];
    const items2 = taste2[category] || [];
    
    if (items1.length > 0 && items2.length > 0) {
      const shared = items1.filter((item: string) => 
        items2.some((other: string) => 
          item.toLowerCase().includes(other.toLowerCase()) || 
          other.toLowerCase().includes(item.toLowerCase())
        )
      ).length;
      
      const total = Math.max(items1.length, items2.length);
      compatibility += shared / total;
      categories++;
    }
  });

  return categories > 0 ? compatibility / categories : 0;
};

const calculatePersonalityCompatibility = (p1: any, p2: any): number => {
  const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
  let compatibility = 0;
  let validTraits = 0;

  traits.forEach(trait => {
    if (p1[trait] !== undefined && p2[trait] !== undefined) {
      const difference = Math.abs(p1[trait] - p2[trait]);
      const traitCompatibility = Math.max(0, (100 - difference) / 100);
      compatibility += traitCompatibility;
      validTraits++;
    }
  });

  return validTraits > 0 ? compatibility / validTraits : 0;
};