import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "fileUploader";

let client: MongoClient;

export async function connectDB() {
  try {
    console.log("Connecting to MongoDB...");
    console.log(
      "URI:",
      MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, "//****:****@")
    ); // Hide credentials in logs

    client = await MongoClient.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    // Test the connection
    await client.db(DB_NAME).command({ ping: 1 });
    console.log("MongoDB connection test successful");

    return client.db(DB_NAME);
  } catch (error) {
    console.error("MongoDB connection error details:", error);
    process.exit(1);
  }
}

export async function getDB() {
  if (!client) {
    await connectDB();
  }
  return client.db(DB_NAME);
}

export async function closeDB() {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed");
  }
}
