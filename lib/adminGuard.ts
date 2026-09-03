import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, COOKIE_NAME, AdminSession } from "@/lib/session";

export async function requireAdmin(req: NextRequest): Promise<AdminSession | NextResponse> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ success: false, code: "UNAUTHORIZED", message: "Not signed in." }, { status: 401 });
  }
  return session;
}
