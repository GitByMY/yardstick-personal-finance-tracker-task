import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

// Only load local .env in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri || !dbName) {
  throw new Error('Missing MONGODB_URI or MONGODB_DB_NAME. Check your .env file and dotenv config path.');
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db = null;

export async function connectToDatabase() {
  try {
    if (!db) {
      await client.connect();
      db = client.db(dbName);
      console.log("✅ Successfully connected to MongoDB");

      await createIndexes();
    }
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

async function createIndexes() {
  try {
    const collections = db.collection.bind(db);

    // Transactions
    await collections('transactions').createIndex({ userId: 1, date: -1 });
    await collections('transactions').createIndex({ category: 1 });
    await collections('transactions').createIndex({ createdAt: -1 });

    // Categories
    await collections('categories').createIndex({ userId: 1, name: 1 }, { unique: true });

    // Budgets
    await collections('budgets').createIndex({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

    // Users
    await collections('users').createIndex({ email: 1 }, { unique: true });

    console.log("✅ Indexes created");
  } catch (error) {
    console.error("⚠️ Error creating indexes:", error);
  }
}

export async function getDatabase() {
  if (!db) {
    await connectToDatabase();
  }
  return db;
}

export async function closeConnection() {
  try {
    if (client) {
      await client.close();
      db = null;
      console.log("🛑 MongoDB connection closed");
    }
  } catch (error) {
    console.error("⚠️ Error closing MongoDB connection:", error);
  }
}
