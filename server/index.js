import express from "express";
import cors from "cors";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";
import { config } from "./config/env.js";
import connectDB from "./config/database.js";

// Import routes
import { authRoutes } from "./routes/auth.js";
import { goalRoutes } from "./routes/goals.js";
import { conceptRoutes } from "./routes/concepts.js";
import { assessmentRoutes } from "./routes/assessments.js";
import { userRoutes } from "./routes/users.js";
import { learnerProfileRoutes } from "./routes/learnerProfiles.js";
import { pathwayRoutes } from "./routes/pathways.js";

const app = express();
/*
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
*/
const cors = require("cors");
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  cors({
    origin: "https://ucad-ai-1.surge.sh",
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

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Then start the server
    app.listen(config.server.port, () => {
      logger.info(`Server running on port ${config.server.port}`);
      logger.info(`Environment: ${config.server.env}`);
    });
  } catch (error) {
    logger.error("Server startup error:", error);
    process.exit(1);
  }
};

startServer();

export default app;
