import express from 'express';
import { body } from 'express-validator';
import { User } from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Register user
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 })
  ],
  validate,
  async (req, res) => {
    try {
      const user = new User(req.body);
      await user.save();
      const token = user.generateAuthToken();
      res.status(201).json({ user, token });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(400).json({ error: error.message });
    }
  }
);

// Login user
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ],
  validate,
  async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user || !(await user.comparePassword(req.body.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = user.generateAuthToken();
      res.json({ user, token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Get user profile
router.get('/profile', auth, async (req, res) => {
  res.json(req.user);
});

// Update user progress
router.post('/progress/:stepId', auth, async (req, res) => {
  try {
    const user = req.user;
    const stepId = req.params.stepId;
    
    const progressIndex = user.progress.findIndex(
      p => p.step.toString() === stepId
    );

    if (progressIndex > -1) {
      user.progress[progressIndex].completed = true;
      user.progress[progressIndex].completedAt = new Date();
    } else {
      user.progress.push({
        step: stepId,
        completed: true,
        completedAt: new Date()
      });
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export const userRoutes = router;