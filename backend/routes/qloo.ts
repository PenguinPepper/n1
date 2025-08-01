import express from 'express';
import { generateDateIdeas } from '../controllers/qlooController';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// All Qloo routes require authentication
router.use(authenticateUser);

// POST /api/qloo/generate-date-ideas - Generate personalized date ideas
router.post('/generate-date-ideas', generateDateIdeas);

export default router;