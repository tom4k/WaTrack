import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/db";
import { parseBillImage } from "@/lib/bill-parser";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Please upload a valid bill photo or PDF" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const settings = await dbService.getSettings();
    const explicitApiKey = (formData.get("geminiApiKey") as string) || (settings as any).geminiApiKey;

    const parsed = await parseBillImage(buffer, file.type, explicitApiKey);

    // Check if consumer already exists in the system
    let matchedConsumer: any = null;
    let consumerExists = false;

    if (parsed.consumer?.consumerNumber) {
      matchedConsumer = await dbService.getConsumerByNumber(parsed.consumer.consumerNumber);
      if (matchedConsumer) {
        consumerExists = true;
      }
    }

    return NextResponse.json({
      success: true,
      source: parsed.source,
      consumerExists,
      matchedConsumer,
      consumer: matchedConsumer || parsed.consumer,
      newConsumerData: consumerExists ? null : parsed.consumer,
      bill: parsed.bill,
    });
  } catch (err: any) {
    console.error("Parse bill error:", err);
    return NextResponse.json({ error: err.message || "Failed to scan and parse bill photo" }, { status: 500 });
  }
}
