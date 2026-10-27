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
 * Validates and saves an uploaded file buffer safely to:
 * 1. Persistent database (PostgreSQL & SQLite) for 100% serverless durability
 * 2. Vercel Blob (if token is configured in production)
 * 3. Local filesystem cache
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
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const dataBase64 = buffer.toString("base64");

  // 1. Save to persistent database (guarantees cross-serverless persistence across all instances)
  try {
    const { dbService } = await import("@/db");
    await dbService.saveDocument({
      filename,
      originalName: file.name,
      mimeType,
      sizeBytes: file.size,
      dataBase64,
    });
  } catch (dbErr) {
    console.warn("Could not save document record to database:", dbErr);
  }

  // 2. If Vercel Blob is configured (recommended for production on Vercel)
  const blobToken = getBlobToken();
  if (blobToken) {
    try {
      let blob;
      try {
        blob = await put(`bills/${filename}`, buffer, {
          access: "public",
          token: blobToken,
          addRandomSuffix: false,
          contentType: mimeType,
        });
      } catch {
        blob = await put(`bills/${filename}`, buffer, {
          access: "private",
          token: blobToken,
          addRandomSuffix: false,
          contentType: mimeType,
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
      console.warn("Vercel blob upload failed, falling back to database persistence:", blobErr);
    }
  }

  // 3. Fallback / local filesystem cache
  const uploadsDir = getLocalUploadsDir();
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    const targetPath = path.join(uploadsDir, filename);
    await fs.writeFile(targetPath, buffer);
  } catch (fsErr) {
    // Non-fatal if filesystem is read-only
  }

  return {
    storedFilename: filename,
    originalFilename: file.name,
    mimeType,
    sizeBytes: file.size,
  };
}

/**
 * Retrieves a document from cloud blob, persistent database, or local storage
 */
export async function getDocument(
  storedFilename: string,
  billId?: string
): Promise<{
  buffer: Buffer;
  exists: boolean;
  contentType?: string;
  originalName?: string;
}> {
  // 1. If stored as a remote cloud blob URL or pathname
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
      // Fall through to database / local check
    }
  }

  const sanitized = path.basename(storedFilename.split("?")[0]);

  // 2. Check local filesystem cache
  try {
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
  } catch {
    // Continue to database
  }

  // 3. Check persistent database
  try {
    const { dbService } = await import("@/db");
    const doc = await dbService.getDocument(sanitized);
    if (doc && doc.dataBase64) {
      const buffer = Buffer.from(doc.dataBase64, "base64");
      return {
        buffer,
        exists: true,
        contentType: doc.mimeType || undefined,
        originalName: doc.originalName || undefined,
      };
    }

    // 4. If billId was passed, check bill record for possible documentPath
    if (billId) {
      const bill = await dbService.getBillById(billId);
      if (bill?.documentPath && bill.documentPath !== storedFilename) {
        const docFromBill = await dbService.getDocument(bill.documentPath);
        if (docFromBill && docFromBill.dataBase64) {
          const buffer = Buffer.from(docFromBill.dataBase64, "base64");
          return {
            buffer,
            exists: true,
            contentType: docFromBill.mimeType || undefined,
            originalName: docFromBill.originalName || undefined,
          };
        }
      }
    }
  } catch (dbErr) {
    console.error("Database document fetch failed:", dbErr);
  }

  return { buffer: Buffer.from([]), exists: false };
}

/**
 * Deletes a document if it exists
 */
export async function deleteDocument(storedFilename: string): Promise<boolean> {
  const sanitized = path.basename(storedFilename.split("?")[0]);

  // 1. Remote blob
  if (storedFilename.startsWith("http://") || storedFilename.startsWith("https://")) {
    try {
      const blobToken = getBlobToken();
      await del(storedFilename, blobToken ? { token: blobToken } : undefined);
    } catch {
      // Ignore
    }
  }

  // 2. Database
  try {
    const { dbService } = await import("@/db");
    await dbService.deleteDocument(sanitized);
  } catch {
    // Ignore
  }

  // 3. Local filesystem
  try {
    const dir = getLocalUploadsDir();
    const filePath = path.join(dir, sanitized);
    if (fsSync.existsSync(filePath)) {
      await fs.unlink(filePath);
    }
    const tmpPath = path.join(TMP_UPLOADS_DIR, sanitized);
    if (fsSync.existsSync(tmpPath)) {
      await fs.unlink(tmpPath);
    }
    return true;
  } catch {
    return false;
  }
}
