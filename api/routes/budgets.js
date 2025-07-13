import express from 'express';
import Budget from '../../server/models/Budget.js';

const router = express.Router();

// Get all budgets for a user
router.get('/', async (req, res) => {
  try {
    const { userId = 'default_user', month, year } = req.query;
    
    const budgets = await Budget.findByUserId(
      userId, 
      month ? parseInt(month) : undefined, 
      year ? parseInt(year) : undefined
    );
    
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// Get a specific budget
router.get('/:id', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

// Create a new budget
router.post('/', async (req, res) => {
  try {
    const { userId = 'default_user', category, limit, month, year } = req.body;
    if (!category || !limit || !month || !year) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const budget = await Budget.create({ userId, category, limit, month, year });
    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Budget already exists for this category and month' });
    } else {
      res.status(500).json({ error: 'Failed to create budget' });
    }
  }
});

// Update a budget
router.put('/:id', async (req, res) => {
  try {
    const updated = await Budget.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// Delete a budget
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Budget.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

export default router;
