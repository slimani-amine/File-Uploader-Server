import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import CONFIG from "../config";

dotenv.config();

let client: MongoClient;

export async function connectDB() {
  try {
    console.log("Connecting to MongoDB...");
    console.log(
      "URI:",
      CONFIG.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, "//****:****@")
    ); // Hide credentials in logs

    client = await MongoClient.connect(CONFIG.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    // Test the connection
    await client.db(CONFIG.DB_NAME).command({ ping: 1 });
    console.log("MongoDB connection test successful");

    return client.db(CONFIG.DB_NAME);
  } catch (error) {
    console.error("MongoDB connection error details:", error);
    process.exit(1);
  }
}

export async function getDB() {
  if (!client) {
    await connectDB();
  }
  return client.db(CONFIG.DB_NAME);
}

export async function closeDB() {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed");
  }
}
