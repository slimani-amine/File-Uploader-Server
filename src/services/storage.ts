import { InsertUploadedFile, InsertUser, UploadedFile, User } from "../types";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createUploadedFile(file: InsertUploadedFile): Promise<UploadedFile>;
  getUploadedFile(id: number): Promise<UploadedFile | undefined>;
  getAllUploadedFiles(): Promise<UploadedFile[]>;
  deleteUploadedFile(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private uploadedFiles: Map<number, UploadedFile>;
  private currentUserId: number;
  private currentFileId: number;

  constructor() {
    this.users = new Map();
    this.uploadedFiles = new Map();
    this.currentUserId = 1;
    this.currentFileId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async createUploadedFile(
    insertFile: InsertUploadedFile
  ): Promise<UploadedFile> {
    const id = this.currentFileId++;
    const file: UploadedFile = {
      ...insertFile,
      id,
      uploadedAt: new Date(),
    };
    this.uploadedFiles.set(id, file);
    return file;
  }

  async getUploadedFile(id: number): Promise<UploadedFile | undefined> {
    return this.uploadedFiles.get(id);
  }

  async getAllUploadedFiles(): Promise<UploadedFile[]> {
    return Array.from(this.uploadedFiles.values()).sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
  }

  async deleteUploadedFile(id: number): Promise<boolean> {
    return this.uploadedFiles.delete(id);
  }
}

export const storage = new MemStorage();
