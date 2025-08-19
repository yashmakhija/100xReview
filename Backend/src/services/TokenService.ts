import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { AppError, ErrorType, createError } from "../errors";

const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "access_token_secret";
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "24h";

export interface AccessTokenPayload {
  id: number;
  role: string;
  email: string;
  tokenType: "access";
}

export class TokenService {
  static generateAccessToken(user: User): {
    accessToken: string;
    expiresAt: Date;
  } {
    const payload: AccessTokenPayload = {
      id: user.id,
      role: user.role,
      email: user.email,
      tokenType: "access",
    };

    const token = jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRES_IN,
    });

    const expiresAt = new Date(
      Date.now() + this.parseExpiryString(JWT_ACCESS_EXPIRES_IN)
    );

    return {
      accessToken: token,
      expiresAt,
    };
  }

  static verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      const payload = jwt.verify(
        token,
        JWT_ACCESS_SECRET
      ) as AccessTokenPayload;

      if (payload.tokenType !== "access") {
        return null;
      }

      return payload;
    } catch (error) {
      return null;
    }
  }

  private static parseExpiryString(expiryString: string): number {
    const unit = expiryString.charAt(expiryString.length - 1);
    const value = parseInt(expiryString.slice(0, -1));

    switch (unit) {
      case "s":
        return value * 1000;
      case "m":
        return value * 60 * 1000;
      case "h":
        return value * 60 * 60 * 1000;
      case "d":
        return value * 24 * 60 * 60 * 1000;
      default:
        return 86400000; // Default 24 hours
    }
  }
}
