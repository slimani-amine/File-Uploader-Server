"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileRoutes = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../lib/db");
const mongodb_1 = require("mongodb");
const router = express_1.default.Router();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, "../../uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
// Upload file - Handle both /upload and /files/upload
router.post(["/upload", "/files/upload"], upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const db = await (0, db_1.getDB)();
        const fileDoc = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            createdAt: new Date(),
        };
        const result = await db.collection("files").insertOne(fileDoc);
        res.json({ id: result.insertedId, ...fileDoc });
    }
    catch (error) {
        console.error("Upload error details:", error);
        res.status(500).json({
            error: "Upload failed",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
// Get file metadata
router.get("/:fileId", async (req, res) => {
    try {
        const db = await (0, db_1.getDB)();
        const file = await db.collection("files").findOne({
            _id: new mongodb_1.ObjectId(req.params.fileId),
        });
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }
        res.json(file);
    }
    catch (error) {
        console.error("Get file error:", error);
        res.status(500).json({ error: "Failed to get file" });
    }
});
// Get download URL
router.get("/:fileId/download", async (req, res) => {
    try {
        const db = await (0, db_1.getDB)();
        const file = await db.collection("files").findOne({
            _id: new mongodb_1.ObjectId(req.params.fileId),
        });
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }
        const downloadUrl = `/uploads/${file.filename}`;
        res.json({ url: downloadUrl });
    }
    catch (error) {
        console.error("Get download URL error:", error);
        res.status(500).json({ error: "Failed to get download URL" });
    }
});
exports.fileRoutes = router;
