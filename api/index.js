import express from 'express';
import serverless from 'serverless-http';
import { MongoClient } from 'mongodb';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Simple connection test function
async function testConnection() {
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: { version: '1', strict: true, deprecationErrors: true }
  });
  
  try {
    await client.connect();
    await client.db(process.env.MONGODB_DB_NAME).command({ ping: 1 });
    await client.close();
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