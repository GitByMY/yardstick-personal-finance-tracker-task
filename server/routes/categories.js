import express from 'express';
import Category from '../models/Category.js';

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
    const { name, icon, color, userId = 'default_user' } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const categoryData = {
      name,
      icon: icon || 'DollarSign',
      color: color || '#45B7D1',
      userId
    };

    const category = await Category.create(categoryData);
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Category name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
});

// Update a category
router.put('/:id', async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;

    const result = await Category.updateById(req.params.id, updateData);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const result = await Category.deleteById(req.params.id);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Initialize default categories for a user
router.post('/initialize', async (req, res) => {
  try {
    const { userId = 'default_user' } = req.body;
    
    const result = await Category.initializeDefaultCategories(userId);
    
    if (result) {
      res.status(201).json({ 
        message: 'Default categories initialized successfully',
        count: result.insertedCount 
      });
    } else {
      res.json({ message: 'Default categories already exist' });
    }
  } catch (error) {
    console.error('Error initializing categories:', error);
    res.status(500).json({ error: 'Failed to initialize categories' });
  }
});

export default router;