import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/db";
import { generateBillsCsv, generatePaymentsCsv } from "@/lib/csv";

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type } = await params;
    const today = new Date().toISOString().split("T")[0];

    if (type === "bills") {
      const bills = await dbService.getBills();
      const csv = generateBillsCsv(bills);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="kseb_bills_${today}.csv"`,
        },
      });
    } else if (type === "payments") {
      const payments = await dbService.getPayments();
      const csv = generatePaymentsCsv(payments);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="kseb_payments_${today}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid export type. Use 'bills' or 'payments'." }, { status: 400 });
  } catch (err: any) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Failed to generate CSV export" }, { status: 500 });
  }
}
