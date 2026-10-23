import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/db";

export async function GET() {
  const session = await getSession();
  const owner = await dbService.getOwner();
  const hasOwner = Boolean(owner);

  return NextResponse.json({
    authenticated: Boolean(session),
    user: session,
    hasOwner,
  });
}
