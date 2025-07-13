const express = require('express');
const serverless = require('serverless-http');
const path = require('path');
const { connectToDatabase } = require('../server/config/database.js');

// Import your routes and other server logic
const budgets = require('../server/routes/budgets');
const categories = require('../server/routes/categories');
const transactions = require('../server/routes/transactions');
const users = require('../server/routes/users');

const app = express();
app.use(express.json());

// Use your routes
app.use('/api/budgets', budgets);
app.use('/api/categories', categories);
app.use('/api/transactions', transactions);
app.use('/api/users', users);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    
    await connectToDatabase();
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', message: error.message, stack: error.stack });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message, stack: err.stack });
});

// Export as Vercel handler
module.exports = serverless(app);