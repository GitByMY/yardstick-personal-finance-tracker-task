import express from 'express';
import serverless from 'serverless-http';
import { connectToDatabase } from '../server/config/database.js';
import cors from 'cors';

// Import routes
import budgetRoutes from '../server/routes/budgets.js';
import categoryRoutes from '../server/routes/categories.js';
import transactionRoutes from '../server/routes/transactions.js';
import userRoutes from '../server/routes/users.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    // Test the database connection
    await db.command({ ping: 1 });
    res.json({ status: 'ok', message: 'Database connected' });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      details: process.env.MONGODB_URI ? 'URI exists' : 'URI missing'
    });
  }
});

// Use routes
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

export default serverless(app);
