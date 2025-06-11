import { File } from "buffer";
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const uploadedFiles = pgTable("uploaded_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// Define the schemas for inserting data
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const insertUploadedFileSchema = z.object({
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;

// Frontend-only types for queue management
export type FileUploadStatus =
  | "queued"
  | "uploading"
  | "completed"
  | "failed"
  | "retrying";

export interface QueuedFile {
  id: string;
  file: File;
  status: FileUploadStatus;
  progress: number;
  error?: string;
  retryCount: number;
  uploadedFileId?: string;
}

export interface UploadStats {
  totalFiles: number;
  uploading: number;
  completed: number;
  failed: number;
  queued: number;
}
