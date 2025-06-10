import { MongoClient } from 'mongodb';

let client: MongoClient;

export async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db(process.env.DB_NAME || 'file-uploader');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function closeDB() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

export function getDB() {
  if (!client) {
    throw new Error('Database not connected');
  }
  return client.db(process.env.DB_NAME || 'file-uploader');
} 