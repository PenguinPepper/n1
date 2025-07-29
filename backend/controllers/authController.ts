import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import supabase from '../config/supabase';
import { SignUpRequest, SignInRequest, AuthResponse, ApiResponse } from '../types';

export const signUp = async (req: Request<{}, AuthResponse, SignUpRequest, ApiResponse>, res: Response<AuthResponse>): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      res.status(400);
      return;
    }

    const { email, password } = req.body;

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.CLIENT_URL}/auth/callback`
      }
    });

    if (error) {
      res.status(400);
      return;
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: data.user?.id || '',
        email: data.user?.email || ''
      },
      session: data.session
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500);
  }
};

export const signIn = async (req: Request<{}, AuthResponse, SignInRequest>, res: Response<AuthResponse>): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return;
    }

    const { email, password } = req.body;

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      res.status(400);
      return;
    }

    res.json({
      message: 'Signed in successfully',
      user: {
        id: data.user.id,
        email: data.user.email || ''
      },
      session: data.session
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500);
  }
};

export const signOut = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};