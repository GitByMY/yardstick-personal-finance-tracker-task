import express from 'express';
console.log('--- API function cold start ---');
console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);
console.log('MONGODB_DB_NAME present:', !!process.env.MONGODB_DB_NAME);
console.log('NODE_ENV:', process.env.NODE_ENV);

import serverless from 'serverless-http';
import dotenv from 'dotenv';
import { connectToDatabase } from '../server/config/database.js';
import cors from 'cors';
import transactionRoutes from '../server/routes/transactions.js';
import categoryRoutes from '../server/routes/categories.js';
import budgetRoutes from '../server/routes/budgets.js';
import userRoutes from '../server/routes/users.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();

// Debug endpoint to inspect env vars in serverless runtime
app.get('/api/env', (req, res) => {
  res.json({
    MONGODB_URI: !!process.env.MONGODB_URI,
    MONGODB_DB_NAME: !!process.env.MONGODB_DB_NAME,
    NODE_ENV: process.env.NODE_ENV
  });
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Simple connection test function
async function testConnection() {
  try {
    await connectToDatabase();
    return true;
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return false;
  }
}

// Health check with timeout
app.get('/api/health', async (req, res) => {
  // Set a timeout of 10 seconds
  const timeout = setTimeout(() => {
    res.status(408).json({
      status: 'error',
      message: 'Request timeout',
      timestamp: new Date().toISOString()
    });
  }, 10000);

  try {
    const isConnected = await testConnection();
    clearTimeout(timeout);
    
    if (isConnected) {
      res.json({
        status: 'ok',
        message: 'API is running and database is connected',
        timestamp: new Date().toISOString(),
        env: {
          hasUri: !!process.env.MONGODB_URI,
          hasDbName: !!process.env.MONGODB_DB_NAME,
          nodeEnv: process.env.NODE_ENV
        }
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    clearTimeout(timeout);
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/users', userRoutes);

// Fallback route
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: err.message,
    timestamp: new Date().toISOString()
  });
});

export default serverless(app);