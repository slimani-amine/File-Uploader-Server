"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const files_1 = require("./routes/files");
const db_1 = require("./lib/db");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(__dirname, "../uploads");
if (!require("fs").existsSync(uploadsDir)) {
    require("fs").mkdirSync(uploadsDir, { recursive: true });
}
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// Connect to MongoDB and start server
async function startServer() {
    try {
        // Connect to MongoDB
        await (0, db_1.connectDB)();
        console.log("MongoDB connection established");
        // Debug middleware to log all requests
        app.use((req, res, next) => {
            console.log(`${req.method} ${req.url}`);
            next();
        });
        // Routes
        app.use("/api", files_1.fileRoutes);
        // Health check
        app.get("/health", (req, res) => {
            res.json({ status: "ok" });
        });
        // Error handling middleware
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ error: "Something broke!" });
        });
        // Start server
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}
startServer();
