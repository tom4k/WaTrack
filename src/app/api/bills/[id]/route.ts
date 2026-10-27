import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/db";
import { billSchema, getZodErrorMessage } from "@/lib/validations";
import { saveDocument, deleteDocument } from "@/lib/storage";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const bill = await dbService.getBillById(id);
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    const payments = await dbService.getPayments(id);
    return NextResponse.json({ bill, payments });
  } catch (err: any) {
    console.error("Get bill error:", err);
    return NextResponse.json({ error: "Failed to fetch bill" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const contentType = req.headers.get("content-type") || "";
    let data: any = {};
    let savedDoc: any = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const rawData = formData.get("data");
      if (typeof rawData === "string") {
        data = JSON.parse(rawData);
      } else {
        for (const [key, value] of formData.entries()) {
          if (key !== "file" && key !== "data") {
            data[key] = value;
          }
        }
      }

      const file = formData.get("file");
      if (file instanceof File && file.size > 0) {
        // Delete old document if replaced
        if (existing.documentPath) {
          await deleteDocument(existing.documentPath);
        }
        savedDoc = await saveDocument(file);
      }
    } else {
      data = await req.json();
    }

    const parsed = billSchema.partial().safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    // Only set fields that were explicitly supplied in the request data (prevents schema defaults from wiping existing data)
    const updatePayload: any = {};
    for (const key of Object.keys(data)) {
      if (data[key] !== undefined && (parsed.data as any)[key] !== undefined) {
        updatePayload[key] = (parsed.data as any)[key];
      }
    }

    if (savedDoc) {
      updatePayload.documentPath = savedDoc.storedFilename;
      updatePayload.documentOriginalName = savedDoc.originalFilename;
      updatePayload.documentMimeType = savedDoc.mimeType;
      updatePayload.documentSizeBytes = savedDoc.sizeBytes;
    }

    const updated = await dbService.updateBill(id, updatePayload);
    return NextResponse.json({ success: true, bill: updated });
  } catch (err: any) {
    console.error("Update bill error:", err);
    return NextResponse.json({ error: err.message || "Failed to update bill" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await dbService.getBillById(id);
    if (existing?.documentPath) {
      await deleteDocument(existing.documentPath);
    }

    await dbService.deleteBill(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete bill error:", err);
    return NextResponse.json({ error: "Failed to delete bill" }, { status: 500 });
  }
}
