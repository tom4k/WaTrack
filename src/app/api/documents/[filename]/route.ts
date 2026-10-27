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
    const decodedFilename = decodeURIComponent(filename);
    const { searchParams } = new URL(req.url);
    const billId = searchParams.get("billId") || undefined;
    const download = searchParams.get("download") === "true";
    const requestedName = searchParams.get("name");

    const {
      buffer,
      exists,
      contentType: docContentType,
      originalName: dbOriginalName,
    } = await getDocument(decodedFilename, billId);

    if (!exists) {
      const acceptHeader = req.headers.get("accept") || "";
      if (acceptHeader.includes("text/html")) {
        return new NextResponse(
          `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Document Not Found | WaTrack</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; padding: 24px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 36px 32px; max-width: 460px; width: 100%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6); }
    .icon { width: 56px; height: 56px; line-height: 56px; border-radius: 16px; background: rgba(245, 158, 11, 0.15); color: #fbbf24; font-size: 26px; margin: 0 auto 18px; border: 1px solid rgba(245, 158, 11, 0.3); }
    h1 { font-size: 18px; font-weight: 700; margin: 0 0 8px; color: #f1f5f9; }
    p { font-size: 13px; color: #94a3b8; line-height: 1.6; margin: 0 0 24px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; height: 40px; padding: 0 20px; background: #10b981; color: white; text-decoration: none; font-weight: 600; font-size: 13px; border-radius: 10px; transition: background 0.15s; }
    .btn:hover { background: #059669; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⚠️</div>
    <h1>Document Attachment Not Found</h1>
    <p>This file was stored in ephemeral container storage before permanent database persistence was enabled, and is no longer available. You can re-attach or replace the file anytime in the Bill Details drawer.</p>
    <a href="/bills" class="btn">Return to Bills</a>
  </div>
</body>
</html>`,
          {
            status: 404,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          }
        );
      }

      return NextResponse.json(
        { error: "Document not found in storage. Please re-attach the document in the bill details drawer." },
        { status: 404 }
      );
    }

    const originalName = requestedName || dbOriginalName || path.basename(decodedFilename);
    const ext =
      path.extname(originalName).toLowerCase() ||
      path.extname(decodedFilename.split("?")[0]).toLowerCase();

    let contentType = docContentType || "application/octet-stream";
    if (!docContentType || docContentType === "application/octet-stream") {
      if (ext === ".pdf") contentType = "application/pdf";
      else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".png") contentType = "image/png";
      else if (ext === ".webp") contentType = "image/webp";
    }

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
