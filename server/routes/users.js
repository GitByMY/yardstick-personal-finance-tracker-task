import express from 'express';
import User from '../models/User.js';
import Category from '../models/Category.js';

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  try {
    const { email, name, preferences } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const userData = {
      email,
      name,
      preferences: preferences || {
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        theme: 'dark'
      }
    };

    const user = await User.create(userData);
    
    // Initialize default categories for the new user
    await Category.initializeDefaultCategories(user._id.toString());
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { name, preferences } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (preferences !== undefined) updateData.preferences = preferences;

    const result = await User.updateById(req.params.id, updateData);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get user by email
router.get('/email/:email', async (req, res) => {
  try {
    const user = await User.findByEmail(req.params.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;