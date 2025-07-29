import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import supabase from '../config/supabase';
import { 
  CreateProfileRequest, 
  UpdateProfileRequest, 
  GetProfilesQuery,
  ProfileResponse, 
  ProfilesResponse,
  DatabaseProfile,
  Profile
} from '../types/index';

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