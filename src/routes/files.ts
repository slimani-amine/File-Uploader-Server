import express from "express";
import multer from "multer";
import path from "path";
import { getDB } from "../lib/db";
import { ObjectId } from "mongodb";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Upload file - Handle both /upload and /files/upload
router.post(
  ["/upload", "/files/upload"],
  upload.single("file"),
  async (req, res) => {
    try {
      console.log("Upload request received:", req.file);

      if (!req.file) {
        console.log("No file in request");
        return res.status(400).json({ error: "No file uploaded" });
      }

      const db = await getDB();
      const fileDoc = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        createdAt: new Date(),
      };

      console.log("Saving file document:", fileDoc);
      const result = await db.collection("files").insertOne(fileDoc);
      console.log("File saved with ID:", result.insertedId);

      res.json({ id: result.insertedId, ...fileDoc });
    } catch (error) {
      console.error("Upload error details:", error);
      res.status(500).json({
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Get file metadata
router.get("/:fileId", async (req, res) => {
  try {
    const db = await getDB();
    const file = await db.collection("files").findOne({
      _id: new ObjectId(req.params.fileId),
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json(file);
  } catch (error) {
    console.error("Get file error:", error);
    res.status(500).json({ error: "Failed to get file" });
  }
});

// Get download URL
router.get("/:fileId/download", async (req, res) => {
  try {
    const db = await getDB();
    const file = await db.collection("files").findOne({
      _id: new ObjectId(req.params.fileId),
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const downloadUrl = `/uploads/${file.filename}`;
    res.json({ url: downloadUrl });
  } catch (error) {
    console.error("Get download URL error:", error);
    res.status(500).json({ error: "Failed to get download URL" });
  }
});

export const fileRoutes = router;
