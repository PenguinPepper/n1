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

    console.log('Attempting to sign up user:', email); // Debug log

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.CLIENT_URL}/auth/callback`
      }
    });

    if (error) {
      console.error('Supabase signup error:', error); // Debug log
      res.status(400);
      return;
    }

    // Check if user was created but needs email confirmation
    if (data.user && !data.session) {
      res.status(201).json({
        message: 'User created successfully. Please check your email for confirmation.',
        user: {
          id: data.user.id,
          email: data.user.email || ''
        },
        session: null
      });
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

    console.log('Attempting to sign in user:', email); // Debug log

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase signin error:', error); // Debug log
      
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        res.status(401);
        return;
      }
      
      if (error.message.includes('Email not confirmed')) {
        res.status(401);
        return;
      }

      res.status(400);
      return;
    }

    // Ensure we have both user and session
    if (!data.user || !data.session) {
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
      console.error('Supabase signout error:', error);
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};