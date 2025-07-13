const express = require('express');
const serverless = require('serverless-http');
const { connectToDatabase } = require('../server/config/database.js');

// Import your routes
const budgets = require('../server/routes/budgets');
const categories = require('../server/routes/categories');
const transactions = require('../server/routes/transactions');
const users = require('../server/routes/users');

const app = express();
app.use(express.json());

// Middleware to ensure database connection
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

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
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message });
});

module.exports = serverless(app);