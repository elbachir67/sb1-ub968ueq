import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "../utils/logger.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Required environment variables
const requiredEnvVars = ["MONGODB_URI", "PORT"];

// Verify all required variables are present
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

export const config = {
  mongodb: {
    uri: process.env.MONGODB_URI,
  },
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || "development",
  },
};
