import { timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret(secret = process.env.ADMIN_SESSION_SECRET) {
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export function passwordMatches(candidate: string, expected = process.env.ADMIN_PASSWORD) {
  if (!expected) throw new Error("ADMIN_PASSWORD is not configured.");
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  if (candidateBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(candidateBuffer, expectedBuffer);
}

export async function createSessionToken(secret?: string, expiresIn: string | number = SESSION_DURATION_SECONDS) {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(typeof expiresIn === "number" ? `${expiresIn}s` : expiresIn)
    .setSubject("portfolio-admin")
    .sign(getSessionSecret(secret));
}

export async function verifySessionToken(token: string | undefined, secret?: string) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(secret), {
      algorithms: ["HS256"],
      subject: "portfolio-admin",
    });
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const valid = await verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
  if (!valid) redirect("/admin/login");
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: SESSION_DURATION_SECONDS,
  path: "/",
};
