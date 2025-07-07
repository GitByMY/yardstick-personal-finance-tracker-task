import express from 'express';
import Budget from '../models/Budget.js';

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
    const { category, budgetAmount, month, year, userId = 'default_user' } = req.body;

    if (!category || !budgetAmount || !month || !year) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const budgetData = {
      category,
      budgetAmount: parseFloat(budgetAmount),
      month: parseInt(month),
      year: parseInt(year),
      userId
    };

    const budget = await Budget.create(budgetData);
    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Budget already exists for this category and period' });
    } else {
      res.status(500).json({ error: 'Failed to create budget' });
    }
  }
});

// Update a budget
router.put('/:id', async (req, res) => {
  try {
    const { budgetAmount, spentAmount } = req.body;
    
    const updateData = {};
    if (budgetAmount !== undefined) updateData.budgetAmount = parseFloat(budgetAmount);
    if (spentAmount !== undefined) updateData.spentAmount = parseFloat(spentAmount);

    const result = await Budget.updateById(req.params.id, updateData);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json({ message: 'Budget updated successfully' });
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// Delete a budget
router.delete('/:id', async (req, res) => {
  try {
    const result = await Budget.deleteById(req.params.id);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

// Get budget vs actual analytics
router.get('/analytics/vs-actual/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const { userId = 'default_user' } = req.query;
    
    const analytics = await Budget.getBudgetVsActual(userId, parseInt(year));
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching budget analytics:', error);
    res.status(500).json({ error: 'Failed to fetch budget analytics' });
  }
});

export default router;