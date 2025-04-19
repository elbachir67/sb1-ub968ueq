import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  try {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified("password")) {
      return next();
    }

    // Generate a salt with a cost factor of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    logger.info(`Password hashed for user: ${this.email}`);
    next();
  } catch (error) {
    logger.error("Error hashing password:", error);
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    logger.info(`Comparing password for user: ${this.email}`);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    logger.info(`Password match result for ${this.email}: ${isMatch}`);
    return isMatch;
  } catch (error) {
    logger.error(`Error comparing password for ${this.email}:`, error);
    throw error;
  }
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign(
      {
        id: this._id,
        email: this.email,
        role: this.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
        algorithm: "HS256",
      }
    );

    logger.info(`Generated auth token for user: ${this.email}`);
    return token;
  } catch (error) {
    logger.error("Error generating auth token:", error);
    throw error;
  }
};

// Static method to find user by credentials
userSchema.statics.findByCredentials = async function (email, password) {
  try {
    logger.info(`Attempting to find user by credentials: ${email}`);

    const user = await this.findOne({ email, isActive: true });
    if (!user) {
      logger.warn(`No user found with email: ${email}`);
      throw new Error("Invalid credentials");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Invalid password for user: ${email}`);
      throw new Error("Invalid credentials");
    }

    logger.info(`User authenticated successfully: ${email}`);
    return user;
  } catch (error) {
    logger.error(`Authentication error for ${email}:`, error);
    throw error;
  }
};

export const User = mongoose.model("User", userSchema);
