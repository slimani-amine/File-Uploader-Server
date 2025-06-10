import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileRoutes } from "./routes/files";
import { connectDB } from "./lib/db";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
if (!require("fs").existsSync(uploadsDir)) {
  require("fs").mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Connect to MongoDB and start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("MongoDB connection established");

    // Debug middleware to log all requests
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.url}`);
      next();
    });

    // Routes
    app.use("/api", fileRoutes);

    // Health check
    app.get("/health", (req, res) => {
      res.json({ status: "ok" });
    });

    // Error handling middleware
    app.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error(err.stack);
        res.status(500).json({ error: "Something broke!" });
      }
    );

    // Start server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
