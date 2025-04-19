import express from "express";
import { body, validationResult } from "express-validator";
import { User } from "../models/User.js";
import { auth } from "../middleware/auth.js";
import { logger } from "../utils/logger.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Login validation rules
const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").exists(),
  body("isAdminLogin").optional().isBoolean(),
];

// Register validation rules
const registerValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain a number"),
];

// Login route
router.post("/login", loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, isAdminLogin } = req.body;
    logger.info(`Login attempt for email: ${email}`);

    // Trouver l'utilisateur par email
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      logger.warn(`No user found with email: ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Vérifier le mot de passe en utilisant la méthode du modèle
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Invalid password for user: ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check for admin login
    if (isAdminLogin && user.role !== "admin") {
      logger.warn(`Admin login attempt by non-admin user: ${email}`);
      return res
        .status(403)
        .json({ error: "Access denied. Admin privileges required." });
    }

    const token = user.generateAuthToken();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    logger.info(`Successful login for user: ${email}`);
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isAdmin: user.role === "admin",
      },
      token,
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Register route
router.post("/register", registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    logger.info(`Registration attempt for email: ${email}`);

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Registration failed - email already exists: ${email}`);
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create new user
    const user = new User({
      email,
      password, // Le mot de passe sera hashé automatiquement par le middleware pre-save
      role: "user",
      isActive: true,
      lastLogin: new Date(),
    });

    await user.save();
    logger.info(`New user registered: ${email}`);

    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isAdmin: false,
      },
      token,
    });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({ error: "Error creating user" });
  }
});

export const authRoutes = router;
