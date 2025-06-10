export interface User {
  id: number;
  username: string;
  password: string;
  createdAt: Date;
}

export interface InsertUser {
  username: string;
  password: string;
}

export interface UploadedFile {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: number;
  uploadedAt: Date;
}

export interface InsertUploadedFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: number;
}

export interface FileUploadResponse {
  success: boolean;
  file?: UploadedFile;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 