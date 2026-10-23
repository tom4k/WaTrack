import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/db";
import { paymentSchema, getZodErrorMessage } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const billId = searchParams.get("billId") || undefined;

    const payments = await dbService.getPayments(billId);
    return NextResponse.json({ payments });
  } catch (err: any) {
    console.error("Get payments error:", err);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = paymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    const result = await dbService.recordPayment(parsed.data);
    const bill = await dbService.getBillById(parsed.data.billId);

    return NextResponse.json({
      success: true,
      paymentId: result.id,
      bill,
    }, { status: 201 });
  } catch (err: any) {
    console.error("Record payment error:", err);
    return NextResponse.json({ error: err.message || "Failed to record payment" }, { status: 500 });
  }
}
