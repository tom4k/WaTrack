import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { getSession } from "@/lib/auth";
import { getDocument } from "@/lib/storage";

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access to private document" }, { status: 401 });
    }

    const { filename } = await params;
    const { buffer, exists } = await getDocument(filename);

    if (!exists) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".pdf") contentType = "application/pdf";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".webp") contentType = "image/webp";

    const { searchParams } = new URL(req.url);
    const download = searchParams.get("download") === "true";
    const originalName = searchParams.get("name") || filename;

    const disposition = download
      ? `attachment; filename="${encodeURIComponent(originalName)}"`
      : `inline; filename="${encodeURIComponent(originalName)}"`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("Document download error:", err);
    return NextResponse.json({ error: "Failed to load document" }, { status: 500 });
  }
}
