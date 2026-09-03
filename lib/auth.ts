import bcrypt from "bcryptjs";

// Node-only (bcrypt). Only ever imported from API routes, never from middleware.
export { COOKIE_NAME, createSessionToken, verifySessionToken } from "./session";
export type { AdminSession } from "./session";

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  console.log("ADMIN_PASSWORD_HASH:", process.env.ADMIN_PASSWORD_HASH);
  console.log("Length:", process.env.ADMIN_PASSWORD_HASH?.length);
  if (!adminEmail || !passwordHash) throw new Error("Admin credentials are not configured.");

  if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) return false;
  return bcrypt.compare(password, passwordHash);
}
