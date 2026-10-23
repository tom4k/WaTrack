import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { dbService } from "@/db";
import { changePasswordSchema, getZodErrorMessage } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    const owner = await dbService.getOwner();
    if (!owner) {
      return NextResponse.json({ error: "Owner account not found" }, { status: 404 });
    }

    const { currentPassword, newPassword } = parsed.data;
    const isValid = await bcrypt.compare(currentPassword, owner.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await dbService.updateOwnerPassword(owner.id, newHash);

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (err: any) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
