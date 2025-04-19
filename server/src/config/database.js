import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import all models to ensure they are registered
import "../models/index.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Ensure we have a MongoDB URI
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ucad_ia";

const connectDB = async () => {
  try {
    logger.info("Attempting to connect to MongoDB at:", MONGODB_URI);

    // Connect to MongoDB with unified topology
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Wait for connection to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Drop all indexes first
    const collections = await mongoose.connection.db.collections();

    for (const collection of collections) {
      try {
        if (!collection.collectionName.startsWith("system.")) {
          await collection.dropIndexes();
          logger.info(
            `Dropped indexes for collection: ${collection.collectionName}`
          );
        }
      } catch (error) {
        logger.error(
          `Error dropping indexes for ${collection.collectionName}:`,
          error
        );
      }
    }

    // Recreate indexes for all models
    const models = mongoose.modelNames();
    for (const modelName of models) {
      try {
        const model = mongoose.model(modelName);
        await model.syncIndexes();
        logger.info(`Synchronized indexes for model: ${modelName}`);
      } catch (error) {
        logger.error(`Error synchronizing indexes for ${modelName}:`, error);
      }
    }

    logger.info("Database indexes synchronized");

    return conn;
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
