import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { put, del } from "@vercel/blob";

const UPLOADS_DIR = path.join(process.cwd(), "storage", "documents");
const TMP_UPLOADS_DIR = path.join(os.tmpdir(), "watrack", "documents");

export function getLocalUploadsDir(): string {
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    process.cwd().startsWith("/var/task");

  return isServerless ? TMP_UPLOADS_DIR : UPLOADS_DIR;
}

export function getBlobToken(): string | undefined {
  return (
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.VERCEL_BLOB_TOKEN ||
    process.env.VERCEL_BLOB_READ_WRITE_TOKEN
  );
}

// Ensure directory exists in local development
try {
  const dir = getLocalUploadsDir();
  if (!fsSync.existsSync(dir)) {
    fsSync.mkdirSync(dir, { recursive: true });
  }
} catch {
  // Ignore serverless startup mkdir
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
  const blobToken = getBlobToken();
  if (blobToken) {
    try {
      let blob;
      try {
        blob = await put(`bills/${filename}`, file, {
          access: "public",
          token: blobToken,
          addRandomSuffix: false,
        });
      } catch {
        blob = await put(`bills/${filename}`, file, {
          access: "private",
          token: blobToken,
          addRandomSuffix: false,
        });
      }

      if (blob?.url) {
        return {
          storedFilename: blob.url,
          originalFilename: file.name,
          mimeType,
          sizeBytes: file.size,
        };
      }
    } catch (blobErr) {
      console.warn("Vercel blob upload failed, falling back to local storage:", blobErr);
    }
  }

  // Fallback to local filesystem for development / serverless temp storage
  const uploadsDir = getLocalUploadsDir();
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    const targetPath = path.join(uploadsDir, filename);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(targetPath, buffer);

    return {
      storedFilename: filename,
      originalFilename: file.name,
      mimeType,
      sizeBytes: file.size,
    };
  } catch (fsErr) {
    console.warn("Local storage write failed, persisting record without physical file:", fsErr);
    return {
      storedFilename: filename,
      originalFilename: file.name,
      mimeType,
      sizeBytes: file.size,
    };
  }
}

/**
 * Retrieves a document from private storage or cloud blob safely
 */
export async function getDocument(storedFilename: string): Promise<{
  buffer: Buffer;
  exists: boolean;
  contentType?: string;
}> {
  // If stored as a remote cloud blob URL or pathname
  if (
    storedFilename.startsWith("http://") ||
    storedFilename.startsWith("https://") ||
    storedFilename.startsWith("bills/")
  ) {
    const blobToken = getBlobToken();
    if (blobToken) {
      try {
        const { get } = await import("@vercel/blob");
        const result = await get(storedFilename, { access: "private", token: blobToken });
        if (result && result.statusCode === 200 && result.stream) {
          const chunks: Uint8Array[] = [];
          const reader = result.stream.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) chunks.push(value);
          }
          const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
          const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)), totalLength);
          return {
            buffer,
            exists: true,
            contentType: result.blob.contentType || undefined,
          };
        }
      } catch {
        // Fall through to direct fetch
      }
    }

    try {
      const res = await fetch(storedFilename);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        return {
          buffer: Buffer.from(arrayBuffer),
          exists: true,
          contentType: res.headers.get("content-type") || undefined,
        };
      }
    } catch {
      // Ignore
    }

    return { buffer: Buffer.from([]), exists: false };
  }

  // Local filesystem fallback
  const sanitized = path.basename(storedFilename);
  const dir = getLocalUploadsDir();
  const filePath = path.join(dir, sanitized);

  if (fsSync.existsSync(filePath)) {
    const buffer = await fs.readFile(filePath);
    return { buffer, exists: true };
  }

  const tmpPath = path.join(TMP_UPLOADS_DIR, sanitized);
  if (fsSync.existsSync(tmpPath)) {
    const buffer = await fs.readFile(tmpPath);
    return { buffer, exists: true };
  }

  return { buffer: Buffer.from([]), exists: false };
}

/**
 * Deletes a document if it exists
 */
export async function deleteDocument(storedFilename: string): Promise<boolean> {
  if (storedFilename.startsWith("http://") || storedFilename.startsWith("https://")) {
    try {
      const blobToken = getBlobToken();
      await del(storedFilename, blobToken ? { token: blobToken } : undefined);
      return true;
    } catch {
      return false;
    }
  }

  try {
    const sanitized = path.basename(storedFilename);
    const dir = getLocalUploadsDir();
    const filePath = path.join(dir, sanitized);
    if (fsSync.existsSync(filePath)) {
      await fs.unlink(filePath);
      return true;
    }
  } catch {
    // Ignore error
  }
  return false;
}
