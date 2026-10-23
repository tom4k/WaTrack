import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/db";
import { consumerSchema, getZodErrorMessage } from "@/lib/validations";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const consumer = await dbService.getConsumerById(id);
    if (!consumer) {
      return NextResponse.json({ error: "Consumer not found" }, { status: 404 });
    }

    return NextResponse.json({ consumer });
  } catch (err: any) {
    console.error("Get consumer error:", err);
    return NextResponse.json({ error: "Failed to fetch consumer" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await dbService.getConsumerById(id);
    if (!existing) {
      return NextResponse.json({ error: "Consumer not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = consumerSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    const updated = await dbService.updateConsumer(id, parsed.data);
    return NextResponse.json({ success: true, consumer: updated });
  } catch (err: any) {
    console.error("Update consumer error:", err);
    return NextResponse.json({ error: err.message || "Failed to update consumer" }, { status: 500 });
  }
}
