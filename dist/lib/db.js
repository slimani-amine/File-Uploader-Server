"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.getDB = getDB;
exports.closeDB = closeDB;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "fileUploader";
let client;
async function connectDB() {
    try {
        console.log("Connecting to MongoDB...");
        console.log("URI:", MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, "//****:****@")); // Hide credentials in logs
        client = await mongodb_1.MongoClient.connect(MONGODB_URI, {
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
    }
    catch (error) {
        console.error("MongoDB connection error details:", error);
        process.exit(1);
    }
}
async function getDB() {
    if (!client) {
        await connectDB();
    }
    return client.db(DB_NAME);
}
async function closeDB() {
    if (client) {
        await client.close();
        console.log("MongoDB connection closed");
    }
}
