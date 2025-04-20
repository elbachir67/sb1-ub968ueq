import mongoose from "mongoose";

const generatedContentSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    userLevel: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced"],
    },
    learningStyle: {
      type: String,
      required: true,
      enum: ["visual", "auditory", "reading", "kinesthetic"],
    },
    contentType: {
      type: String,
      required: true,
      enum: ["explanation", "exercise", "summary"],
    },
    performanceContext: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

generatedContentSchema.index({ topic: 1, userLevel: 1, contentType: 1 });

export const GeneratedContent = mongoose.model(
  "GeneratedContent",
  generatedContentSchema
);
