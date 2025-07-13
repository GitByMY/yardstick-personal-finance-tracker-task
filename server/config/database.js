import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri || !dbName) {
  throw new Error('Missing MONGODB_URI or MONGODB_DB_NAME. Check your .env file and dotenv config path.');
}

let cachedClient = null;
let cachedDb = null;
export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    maxPoolSize: 1,
  });

  try {
      await client.connect();
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;
    await createIndexes(db);

    console.log("✅ Successfully connected to MongoDB");
    return { client, db };
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

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

export async function getDatabase() {
  const { db } = await connectToDatabase();
  return db;
}
