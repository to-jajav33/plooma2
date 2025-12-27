/**
 * JWT token utilities
 */

export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Create a JWT token
 */
export function createToken(payload: JWTPayload): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const tokenPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + 60 * 60 * 24 * 7, // 7 days
  };

  const base64Header = btoa(JSON.stringify(header))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const base64Payload = btoa(JSON.stringify(tokenPayload))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  // Simple HMAC-SHA256 signature (in production, use a proper library)
  const signature = createSignature(`${base64Header}.${base64Payload}`);
  const base64Signature = btoa(signature)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${base64Header}.${base64Payload}.${base64Signature}`;
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSignature = createSignature(`${header}.${payload}`);
    const base64Signature = btoa(expectedSignature)
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (signature !== base64Signature) return null;
    if (!payload) return null;

    const decodedPayload = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    ) as JWTPayload;

    // Check expiration
    if (
      decodedPayload.exp &&
      decodedPayload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return decodedPayload;
  } catch {
    return null;
  }
}

/**
 * Create a simple signature (in production, use proper HMAC)
 */
function createSignature(data: string): string {
  // Simple hash for now - in production use proper HMAC-SHA256
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return btoa(secret + data);
}
