import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/db";
import { saveDocument, deleteDocument } from "@/lib/storage";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await dbService.getBillById(id);
    if (!existing) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No document file provided" }, { status: 400 });
    }

    // Delete previous physical document if any
    if (existing.documentPath) {
      try {
        await deleteDocument(existing.documentPath);
      } catch {
        // Ignore deletion errors for old missing files
      }
    }

    // Save new document permanently to database & Blob
    const savedDoc = await saveDocument(file);

    // Update ONLY document fields on the bill. Keep ALL charges, readings, and dates untouched!
    const updated = await dbService.updateBillDocument(id, {
      documentPath: savedDoc.storedFilename,
      documentOriginalName: savedDoc.originalFilename,
      documentMimeType: savedDoc.mimeType,
      documentSizeBytes: savedDoc.sizeBytes,
    });

    return NextResponse.json({ success: true, bill: updated });
  } catch (err: any) {
    console.error("Document upload error:", err);
    return NextResponse.json({ error: err.message || "Failed to upload document" }, { status: 500 });
  }
}
