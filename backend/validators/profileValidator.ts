import { body, ValidationChain } from 'express-validator';

export const createProfileValidation: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('age')
    .isInt({ min: 18, max: 100 })
    .withMessage('Age must be between 18 and 100'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('photos')
    .optional()
    .isArray()
    .withMessage('Photos must be an array'),
  body('photos.*')
    .optional()
    .isURL()
    .withMessage('Each photo must be a valid URL'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  body('interests.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each interest must be between 1 and 30 characters'),
  body('personality')
    .optional()
    .isObject()
    .withMessage('Personality must be an object'),
  body('personality.openness')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Openness must be between 0 and 100'),
  body('personality.conscientiousness')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Conscientiousness must be between 0 and 100'),
  body('personality.extraversion')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Extraversion must be between 0 and 100'),
  body('personality.agreeableness')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Agreeableness must be between 0 and 100'),
  body('personality.neuroticism')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Neuroticism must be between 0 and 100'),
  body('tastePreferences')
    .optional()
    .isObject()
    .withMessage('Taste preferences must be an object'),
  body('currentVibe')
    .optional()
    .isObject()
    .withMessage('Current vibe must be an object')
];

export const updateProfileValidation: ValidationChain[] = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('age')
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage('Age must be between 18 and 100'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('photos')
    .optional()
    .isArray()
    .withMessage('Photos must be an array'),
  body('photos.*')
    .optional()
    .isURL()
    .withMessage('Each photo must be a valid URL'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  body('interests.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each interest must be between 1 and 30 characters'),
  body('personality')
    .optional()
    .isObject()
    .withMessage('Personality must be an object'),
  body('tastePreferences')
    .optional()
    .isObject()
    .withMessage('Taste preferences must be an object'),
  body('currentVibe')
    .optional()
    .isObject()
    .withMessage('Current vibe must be an object')
];