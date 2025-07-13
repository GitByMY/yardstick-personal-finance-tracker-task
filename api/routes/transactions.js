import express from 'express';
import Transaction from '../../server/models/Transaction.js';
import Budget from '../../server/models/Budget.js';

const router = express.Router();

// Get all transactions for a user
router.get('/', async (req, res) => {
  try {
    const { 
      userId = 'default_user', 
      limit = 50, 
      skip = 0, 
      category, 
      startDate, 
      endDate,
      sortBy = 'date',
      sortOrder = -1
    } = req.query;

    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip),
      sortBy,
      sortOrder: parseInt(sortOrder)
    };

    if (category) options.category = category;
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;

    const transactions = await Transaction.findByUserId(userId, options);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get a specific transaction
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Create a new transaction
router.post('/', async (req, res) => {
  try {
    const { amount, description, category, date, userId = 'default_user' } = req.body;

    if (!amount || !description || !category || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transactionData = {
      amount: parseFloat(amount),
      description,
      category,
      date,
      userId
    };

    const transaction = await Transaction.create(transactionData);

    // Update budget spent amount
    const transactionDate = new Date(date);
    const month = transactionDate.getMonth() + 1;
    const year = transactionDate.getFullYear();
    
    await Budget.updateSpentAmount(userId, category, month, year, parseFloat(amount));

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update a transaction
router.put('/:id', async (req, res) => {
  try {
    const updated = await Transaction.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Transaction.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Get monthly analytics
router.get('/analytics/monthly/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const { userId = 'default_user' } = req.query;
    
    const monthlyTotals = await Transaction.getMonthlyTotals(userId, parseInt(year));
    res.json(monthlyTotals);
  } catch (error) {
    console.error('Error fetching monthly totals:', error);
    res.status(500).json({ error: 'Failed to fetch monthly totals' });
  }
});

// Get category totals
router.get('/analytics/categories', async (req, res) => {
  try {
    const { userId = 'default_user', startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const categoryTotals = await Transaction.getCategoryTotals(userId, startDate, endDate);
    res.json(categoryTotals);
  } catch (error) {
    console.error('Error fetching category totals:', error);
    res.status(500).json({ error: 'Failed to fetch category totals' });
  }
});

export default router;
