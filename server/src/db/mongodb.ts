import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'automotive_ai';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;

export async function connectDB(): Promise<Db | null> {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    await client.connect();
    db = client.db(DB_NAME);
    isConnected = true;
    console.log('✅ Connected to MongoDB - Data will persist');
    return db;
  } catch (error) {
    console.warn('⚠️  MongoDB not available - Using in-memory storage (data will not persist)');
    console.warn('   To enable persistence, install and start MongoDB: https://www.mongodb.com/try/download/community');
    isConnected = false;
    return null;
  }
}

export async function getDB(): Promise<Db | null> {
  if (!db && !isConnected) {
    return await connectDB();
  }
  return db;
}

export function isMongoConnected(): boolean {
  return isConnected;
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    isConnected = false;
  }
}
