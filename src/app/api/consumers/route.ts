import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/db";
import { consumerSchema, getZodErrorMessage } from "@/lib/validations";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const consumers = await dbService.getConsumers();
    const defaultConsumer = await dbService.getDefaultConsumer();
    return NextResponse.json({ consumers, defaultConsumer });
  } catch (err: any) {
    console.error("Get consumers error:", err);
    return NextResponse.json({ error: "Failed to fetch consumers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = consumerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    const created = await dbService.createConsumer(parsed.data);
    return NextResponse.json({ success: true, consumer: created }, { status: 201 });
  } catch (err: any) {
    console.error("Create consumer error:", err);
    return NextResponse.json({ error: err.message || "Failed to create consumer" }, { status: 500 });
  }
}
