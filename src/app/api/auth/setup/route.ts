import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbService } from "@/db";
import { setSessionCookie } from "@/lib/auth";
import { initialSetupSchema, getZodErrorMessage } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const owner = await dbService.getOwner();
    if (owner) {
      return NextResponse.json(
        { error: "Owner already exists. Public registration is not permitted." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = initialSetupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 10);

    const newOwner = await dbService.createOwner({
      name,
      email,
      passwordHash,
    });

    if (!newOwner) {
      return NextResponse.json({ error: "Failed to create owner account" }, { status: 500 });
    }

    await setSessionCookie({
      userId: newOwner.id,
      email: newOwner.email,
      name: newOwner.name,
      role: newOwner.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newOwner.id,
        email: newOwner.email,
        name: newOwner.name,
        role: newOwner.role,
      },
    });
  } catch (err: any) {
    console.error("Setup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
