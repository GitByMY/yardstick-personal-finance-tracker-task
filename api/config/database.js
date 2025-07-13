import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from project .env
console.log('[database.js] module loaded');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let cachedClient = null;
let cachedDb = null;
export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGODB_URL;
  const dbName = process.env.MONGODB_DB_NAME;

  console.log('[connectToDatabase] Start');
  console.log('[connectToDatabase] URI present:', !!uri);
  console.log('[connectToDatabase] DB Name:', dbName);

  if (!uri) {
    console.log('[connectToDatabase] ❌ No MongoDB URI found');
    throw new Error('Missing MongoDB connection string. Please set MONGODB_URI, DATABASE_URL, or MONGODB_URL.');
  }

  if (cachedClient && cachedDb) {
    console.log('[connectToDatabase] Using cached MongoDB connection');
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    maxPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
  });

  try {
    console.log('[connectToDatabase] Attempting client.connect()');
    await client.connect();
    console.log('[connectToDatabase] client.connect() successful');
    const db = dbName ? client.db(dbName) : client.db();

    cachedClient = client;
    cachedDb = db;
    // createIndexes(db); // index creation skipped in serverless to speed up invocations

    console.log("✅ Successfully connected to MongoDB");
    return { client, db };
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

export async function getDatabase() {
  const { db } = await connectToDatabase();
  return db;
}

export async function closeConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log('MongoDB connection closed');
  }
}

// (Optional) Index creation logic for local dev
async function createIndexes(db) {
  try {
    await db.collection('transactions').createIndex({ userId: 1, date: -1 });
    await db.collection('transactions').createIndex({ category: 1 });
    await db.collection('transactions').createIndex({ createdAt: -1 });
    await db.collection('categories').createIndex({ userId: 1, name: 1 }, { unique: true });
    await db.collection('budgets').createIndex({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log("✅ Indexes created");
  } catch (error) {
    console.error("⚠️ Error creating indexes:", error);
  }
}
