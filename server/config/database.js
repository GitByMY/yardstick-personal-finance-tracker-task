import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not defined. Check your .env file and dotenv config path.');
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db = null;

export async function connectToDatabase() {
  try {
    if (!db) {
      await client.connect();
      db = client.db(process.env.MONGODB_DB_NAME);
      console.log("Successfully connected to MongoDB!");
      
      // Create indexes for better performance
      await createIndexes();
    }
    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

async function createIndexes() {
  try {
    // Transactions collection indexes
    await db.collection('transactions').createIndex({ userId: 1, date: -1 });
    await db.collection('transactions').createIndex({ category: 1 });
    await db.collection('transactions').createIndex({ createdAt: -1 });

    // Categories collection indexes
    await db.collection('categories').createIndex({ userId: 1, name: 1 }, { unique: true });

    // Budgets collection indexes
    await db.collection('budgets').createIndex({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });

    console.log("Database indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error);
  }
}

export async function getDatabase() {
  if (!db) {
    await connectToDatabase();
  }
  return db;
}

export async function closeConnection() {
  if (client) {
    await client.close();
    db = null;
    console.log("MongoDB connection closed");
  }
}