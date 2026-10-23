import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/db";
import { paymentSchema, getZodErrorMessage } from "@/lib/validations";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const body = await req.json();
    const parsed = paymentSchema.safeParse({ ...body, billId: id });
    if (!parsed.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    const result = await dbService.recordPayment(parsed.data);
    const updatedBill = await dbService.getBillById(id);

    return NextResponse.json({
      success: true,
      paymentId: result.id,
      bill: updatedBill,
    });
  } catch (err: any) {
    console.error("Record bill payment error:", err);
    return NextResponse.json({ error: err.message || "Failed to record payment" }, { status: 500 });
  }
}
