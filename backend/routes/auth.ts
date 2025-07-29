import express from 'express';
import { signUp, signIn, signOut } from '../controllers/authController';
import { signUpValidation, signInValidation } from '../validators/authValidator';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', signUpValidation, signUp);

// POST /api/auth/signin
router.post('/signin', signInValidation, signIn);

// POST /api/auth/signout
router.post('/signout', signOut);

export default router;