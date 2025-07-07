const express = require('express');
const path = require('path');

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

// Export as Vercel handler
module.exports = app;