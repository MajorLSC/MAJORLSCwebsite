import { SignJWT, jwtVerify } from "jose";

// Edge-safe (no bcrypt here) — this is the file middleware.ts imports.
export const COOKIE_NAME = "lsc_admin_session";
const SESSION_DURATION = "8h";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET env var.");
  return new TextEncoder().encode(secret);
}

export interface AdminSession {
  email: string;
  role: "ADMIN";
}

export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({ email, role: "ADMIN" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret());
}

export async function verifySessionToken(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "ADMIN" || typeof payload.email !== "string") return null;
    return { email: payload.email, role: "ADMIN" };
  } catch {
    return null;
  }
}
