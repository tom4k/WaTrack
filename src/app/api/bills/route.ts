import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/db";
import { billSchema, getZodErrorMessage } from "@/lib/validations";
import { saveDocument } from "@/lib/storage";
import { computeAnalytics } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";
    const year = searchParams.get("year") || "ALL";
    const search = searchParams.get("search") || "";
    const consumerId = searchParams.get("consumerId") || "ALL";
    const includeAnalytics = searchParams.get("analytics") === "true";

    const bills = await dbService.getBills({
      status,
      year,
      search,
      consumerId,
    });

    if (includeAnalytics) {
      // Fetch all bills unfiltered for true historical analytics
      const allBills = await dbService.getBills();
      const analytics = computeAnalytics(allBills);
      return NextResponse.json({ bills, analytics });
    }

    return NextResponse.json({ bills });
  } catch (err: any) {
    console.error("Get bills error:", err);
    return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        // Build data from form entries
        for (const [key, value] of formData.entries()) {
          if (key !== "file" && key !== "data") {
            data[key] = value;
          }
        }
      }

      const file = formData.get("file");
      if (file instanceof File && file.size > 0) {
        savedDoc = await saveDocument(file);
      }
    } else {
      data = await req.json();
    }

    const parsed = billSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    const billData = {
      ...parsed.data,
      documentPath: savedDoc?.storedFilename ?? null,
      documentOriginalName: savedDoc?.originalFilename ?? null,
      documentMimeType: savedDoc?.mimeType ?? null,
      documentSizeBytes: savedDoc?.sizeBytes ?? null,
    };

    const newBill = await dbService.createBill(billData);
    return NextResponse.json({ success: true, bill: newBill }, { status: 201 });
  } catch (err: any) {
    console.error("Create bill error:", err);
    return NextResponse.json({ error: err.message || "Failed to create bill" }, { status: 500 });
  }
}
