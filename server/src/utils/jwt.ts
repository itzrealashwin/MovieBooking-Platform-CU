import jwt, { SignOptions } from "jsonwebtoken";

// ----------------------
// Payload Types
// ----------------------
export interface AccessTokenPayload {
  userId: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

// ----------------------
// Secrets (must be set in .env)
// ----------------------
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || "";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "";

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error(
    "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be defined in environment variables"
  );
}

const ACCESS_TOKEN_EXPIRY = "15m"; // short-lived, sent to client
const REFRESH_TOKEN_EXPIRY = "7d"; // long-lived, stored as httpOnly cookie

// ----------------------
// Generate Tokens
// ----------------------
export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  } as SignOptions);
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  } as SignOptions);
};

// ----------------------
// Verify Tokens
// ----------------------
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
};