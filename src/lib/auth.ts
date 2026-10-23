import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { dbService } from "@/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "watrack-super-secret-kseb-bill-manager-key-2026"
);

const SESSION_COOKIE_NAME = "watrack_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Sign JWT session token
 */
export async function createSessionToken(payload: AuthSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(JWT_SECRET);
}

/**
 * Verify JWT session token
 */
export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

/**
 * Get current authenticated owner session from cookies
 */
export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Set session cookie
 */
export async function setSessionCookie(session: AuthSession): Promise<void> {
  const token = await createSessionToken(session);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/**
 * Clear session cookie (logout)
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Require active authentication session or throw error
 */
export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized: Owner authentication required");
  }
  return session;
}
