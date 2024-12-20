import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET || "100xAttend";

// Generate a JWT token
export const generateToken = (payload: object): string => {
  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};

// Verify a JWT token
export const verifyToken = (token: string): object | null | string => {
  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
};
