import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { CONFIG } from "./config";
import { fileRoutes } from "./controllers/files";
import { connectDB, closeDB } from "./services/database";
import { errorHandler } from "./utils/errorHandler";
import { handleUploadError } from "./middlewares/fileUpload";

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "..", CONFIG.UPLOAD_DIR);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(`/${CONFIG.UPLOAD_DIR}`, express.static(uploadsDir));

// Debug middleware
if (CONFIG.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Routes
app.use("/api", fileRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling
app.use(handleUploadError);
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await connectDB();
    app.listen(CONFIG.PORT, () => {
      console.log(`Server running on port ${CONFIG.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  await closeDB();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Shutting down gracefully...");
  await closeDB();
  process.exit(0);
});

startServer();
