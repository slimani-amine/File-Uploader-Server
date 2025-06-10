import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "../storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertUploadedFileSchema } from "../lib/schema";

// Extend Express Request type to include file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
      cb(null, uploadsDir);
    },
    filename: (req: any, file: any, cb: any) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext);
      cb(null, `${name}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Allow all file types for now
    cb(null, true);
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload single file
  app.post(
    "/api/upload",
    upload.single("file"),
    async (req: MulterRequest, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Simulate potential upload failure for testing retry logic
        if (Math.random() < 0.1) {
          // 10% chance of failure
          // Clean up the uploaded file
          fs.unlinkSync(req.file.path);
          return res
            .status(500)
            .json({ error: "Upload failed - server error" });
        }

        const fileData = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
        };

        // Validate with schema
        const validatedData = insertUploadedFileSchema.parse(fileData);

        // Save to storage
        const uploadedFile = await storage.createUploadedFile(validatedData);

        res.json({
          success: true,
          file: uploadedFile,
        });
      } catch (error) {
        console.error("Upload error:", error);

        // Clean up file if it was uploaded but processing failed
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
    }
  );

  // Get all uploaded files
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getAllUploadedFiles();
      res.json({ files });
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  // Delete uploaded file
  app.delete("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid file ID" });
      }

      const file = await storage.getUploadedFile(id);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      // Delete physical file
      const filePath = path.join(uploadsDir, file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from storage
      const deleted = await storage.deleteUploadedFile(id);

      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "File not found" });
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // Serve uploaded files
  app.get("/api/files/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid file ID" });
      }

      const file = await storage.getUploadedFile(id);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      const filePath = path.join(uploadsDir, file.filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found on disk" });
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.originalName}"`
      );
      res.setHeader("Content-Type", file.mimeType);
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ error: "Failed to download file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
