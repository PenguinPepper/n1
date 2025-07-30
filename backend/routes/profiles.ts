import express from 'express';
import {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  getProfiles,
  generateBio,
  processMatch
} from '../controllers/profileController';
import { authenticateUser } from '../middleware/auth';
import { createProfileValidation, updateProfileValidation } from '../validators/profileValidator';

const router = express.Router();

// All profile routes require authentication
router.use(authenticateUser);

// POST /api/profiles - Create a new profile
router.post('/', createProfileValidation, createProfile);

// GET /api/profiles/me - Get current user's profile
router.get('/me', getProfile);

// GET /api/profiles/:userId - Get specific user's profile
router.get('/:userId', getProfile);

// PUT /api/profiles/me - Update current user's profile
router.put('/me', updateProfileValidation, updateProfile);

// DELETE /api/profiles/me - Delete current user's profile
router.delete('/me', deleteProfile);

// GET /api/profiles - Get profiles for matching (with filters)
router.get('/', getProfiles);

// POST /api/profiles/generate-bio - Generate AI bio
router.post('/generate-bio', generateBio);
router.post('/process-match', processMatch);

export default router;