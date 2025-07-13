import express from 'express';
import Category from '../../server/models/Category.js';

const router = express.Router();

// Get all categories for a user
router.get('/', async (req, res) => {
  try {
    const { userId = 'default_user' } = req.query;
    const categories = await Category.findByUserId(userId);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get a specific category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create a new category
router.post('/', async (req, res) => {
  try {
    const { name, userId = 'default_user', icon } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const category = await Category.create({ name, userId, icon });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Category already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
});

// Update a category
router.put('/:id', async (req, res) => {
  try {
    const updated = await Category.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Category.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Initialize default categories for a user
router.post('/initialize-default', async (req, res) => {
  try {
    const { userId = 'default_user' } = req.body;
    await Category.initializeDefaultCategories(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error initializing default categories:', error);
    res.status(500).json({ error: 'Failed to initialize default categories' });
  }
});

export default router;
