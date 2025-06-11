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

const uploadsDir = path.join(__dirname, "..", CONFIG.UPLOAD_DIR);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        CONFIG.FRONTEND_URL,
        /\.ngrok-free\.app$/,
        "https://file-uploader-client-i5oq.vercel.app",
      ];

      if (
        !origin ||
        allowedOrigins.some((allowed) =>
          typeof allowed === "string"
            ? allowed === origin
            : allowed.test(origin)
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(`/${CONFIG.UPLOAD_DIR}`, express.static(uploadsDir));

if (CONFIG.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

app.use("/api", fileRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(handleUploadError);
app.use(errorHandler);

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
