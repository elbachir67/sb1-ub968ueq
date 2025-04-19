import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  logger.error("JWT_SECRET is not defined in environment variables");
  process.exit(1);
}

export const generateToken = payload => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "7d",
      algorithm: "HS256",
    });
  } catch (error) {
    logger.error("Error generating JWT:", error);
    throw new Error("Error generating authentication token");
  }
};

export const verifyToken = token => {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
  } catch (error) {
    logger.error("Error verifying JWT:", error);
    throw new Error("Invalid authentication token");
  }
};
