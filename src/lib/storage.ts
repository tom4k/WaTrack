import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const UPLOADS_DIR = path.join(process.cwd(), "storage", "documents");

// Ensure directory exists
if (!fsSync.existsSync(UPLOADS_DIR)) {
  fsSync.mkdirSync(UPLOADS_DIR, { recursive: true });
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
 * Validates and saves an uploaded file buffer safely to private storage
 */
export async function saveDocument(file: File): Promise<SavedFile> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size exceeds maximum limit of 10MB (file is ${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
  }

  const mimeType = file.type || "application/octet-stream";
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`Unsupported file format (${mimeType}). Allowed formats: PDF, JPEG, PNG, WEBP`);
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
  const storedFilename = `${randomId}${ext}`;
  const targetPath = path.join(UPLOADS_DIR, storedFilename);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(targetPath, buffer);

  return {
    storedFilename,
    originalFilename: file.name,
    mimeType,
    sizeBytes: file.size,
  };
}

/**
 * Retrieves a document from private storage safely
 */
export async function getDocument(storedFilename: string): Promise<{
  buffer: Buffer;
  exists: boolean;
}> {
  // Prevent path traversal
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
