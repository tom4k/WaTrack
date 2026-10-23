import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/db";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (process.env.NODE_ENV === "production" && process.env.ENABLE_SAMPLE_SEED !== "true") {
      return NextResponse.json(
        { error: "Sample data seeding is disabled in production environments." },
        { status: 403 }
      );
    }

    await dbService.seedSampleData();
    return NextResponse.json({ success: true, message: "Sample KSEB data seeded successfully" });
  } catch (err: any) {
    console.error("Seed data error:", err);
    return NextResponse.json({ error: "Failed to seed sample data" }, { status: 500 });
  }
}
