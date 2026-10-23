import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { put, del } from "@vercel/blob";

const UPLOADS_DIR = path.join(process.cwd(), "storage", "documents");

// Ensure directory exists in local environment
if (!process.env.BLOB_READ_WRITE_TOKEN && !fsSync.existsSync(UPLOADS_DIR)) {
  try {
    fsSync.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch {
    // Ignore directory creation failure on serverless read-only filesystems
  }
}

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface SavedFile {
  storedFilename: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
}

/**
 * Validates and saves an uploaded file buffer safely to Vercel Blob (production)
 * or local private storage (development fallback).
 */
export async function saveDocument(file: File): Promise<SavedFile> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size exceeds maximum limit of 10MB (file is ${(file.size / (1024 * 1024)).toFixed(2)}MB)`
    );
  }

  const mimeType = file.type || "application/octet-stream";
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(
      `Unsupported file format (${mimeType}). Allowed formats: PDF, JPEG, PNG, WEBP`
    );
  }

  // Safe file extension
  let ext = path.extname(file.name).toLowerCase();
  if (!ext) {
    if (mimeType === "application/pdf") ext = ".pdf";
    else if (mimeType === "image/jpeg") ext = ".jpg";
    else if (mimeType === "image/png") ext = ".png";
    else if (mimeType === "image/webp") ext = ".webp";
  }

  const randomId = crypto.randomUUID();
  const filename = `${randomId}${ext}`;

  // If Vercel Blob is configured (recommended for production on Vercel)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`bills/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return {
      storedFilename: blob.url,
      originalFilename: file.name,
      mimeType,
      sizeBytes: file.size,
    };
  }

  // Fallback to local filesystem for offline development
  const targetPath = path.join(UPLOADS_DIR, filename);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(targetPath, buffer);

  return {
    storedFilename: filename,
    originalFilename: file.name,
    mimeType,
    sizeBytes: file.size,
  };
}

/**
 * Retrieves a document from private storage or cloud blob safely
 */
export async function getDocument(storedFilename: string): Promise<{
  buffer: Buffer;
  exists: boolean;
  contentType?: string;
}> {
  // If stored as a remote cloud blob URL
  if (storedFilename.startsWith("http://") || storedFilename.startsWith("https://")) {
    try {
      const res = await fetch(storedFilename);
      if (!res.ok) return { buffer: Buffer.from([]), exists: false };
      const arrayBuffer = await res.arrayBuffer();
      return {
        buffer: Buffer.from(arrayBuffer),
        exists: true,
        contentType: res.headers.get("content-type") || undefined,
      };
    } catch {
      return { buffer: Buffer.from([]), exists: false };
    }
  }

  // Local filesystem fallback
  const sanitized = path.basename(storedFilename);
  const filePath = path.join(UPLOADS_DIR, sanitized);

  if (!fsSync.existsSync(filePath)) {
    return { buffer: Buffer.from([]), exists: false };
  }

  const buffer = await fs.readFile(filePath);
  return { buffer, exists: true };
}

/**
 * Deletes a document if it exists
 */
export async function deleteDocument(storedFilename: string): Promise<boolean> {
  // Remote blob deletion
  if (storedFilename.startsWith("http://") || storedFilename.startsWith("https://")) {
    try {
      await del(storedFilename);
      return true;
    } catch {
      return false;
    }
  }

  // Local filesystem deletion
  try {
    const sanitized = path.basename(storedFilename);
    const filePath = path.join(UPLOADS_DIR, sanitized);
    if (fsSync.existsSync(filePath)) {
      await fs.unlink(filePath);
      return true;
    }
  } catch {
    // Ignore error
  }
  return false;
}
