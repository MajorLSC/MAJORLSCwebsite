import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));

  if (!email || !password) {
    return NextResponse.json({ success: false, message: "Email and password are required." }, { status: 400 });
  }

  let valid: boolean;
  try {
    valid = await verifyAdminCredentials(email, password);
    console.log("Credentials valid:", valid);
  } catch (err) {
    console.error("Admin auth misconfigured:", err);
    return NextResponse.json({ success: false, message: "Server misconfiguration." }, { status: 500 });
  }

  if (!valid) {
    return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401 });
  }

  const token = await createSessionToken(email);
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
