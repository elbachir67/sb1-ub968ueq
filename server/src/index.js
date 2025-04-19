import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";
import connectDB from "./config/database.js";

// Import routes
import { authRoutes } from "./routes/auth.js";
import { goalRoutes } from "./routes/goals.js";
import { conceptRoutes } from "./routes/concepts.js";
import assessmentRoutes from "./routes/assessments.js";
import { userRoutes } from "./routes/users.js";
import learnerProfileRoutes from "./routes/learnerProfiles.js";
import { pathwayRoutes } from "./routes/pathways.js";
import { quizRoutes } from "./routes/quiz.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Verify critical environment variables
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "PORT"];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      /\.netlify\.app$/,
      /\.netlify\.live$/,
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/concepts", conceptRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", learnerProfileRoutes);
app.use("/api/pathways", pathwayRoutes);
app.use("/api", quizRoutes); // Ajout des routes de quiz

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Then start the server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info("JWT_SECRET is set:", !!process.env.JWT_SECRET);
    });
  } catch (error) {
    logger.error("Server startup error:", error);
    process.exit(1);
  }
};

startServer();

export default app;
