import { Router, Request, Response } from 'express';
import { upload, handleUploadError } from '../middlewares/fileUpload';
import { asyncHandler } from '../utils/errorHandler';
import { storage } from '../services/storage';
import { AppError } from '../utils/errorHandler';

const router = Router();

// Get all files
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const files = await storage.getAllUploadedFiles();
  res.json({ success: true, data: files });
}));

// Get single file
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const file = await storage.getUploadedFile(parseInt(req.params.id));
  if (!file) {
    throw new AppError(404, 'File not found');
  }
  res.json({ success: true, data: file });
}));

// Upload file
router.post('/', upload.single('file'), handleUploadError, asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(400, 'No file uploaded');
  }

  const file = await storage.createUploadedFile({
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    uploadedBy: 1 // TODO: Get from auth middleware
  });

  res.status(201).json({ success: true, data: file });
}));

// Delete file
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const success = await storage.deleteUploadedFile(parseInt(req.params.id));
  if (!success) {
    throw new AppError(404, 'File not found');
  }
  res.json({ success: true });
}));

export { router as fileRoutes };
