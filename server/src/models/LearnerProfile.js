import mongoose from "mongoose";

const learnerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    learningStyle: {
      type: String,
      enum: ["visual", "auditory", "reading", "kinesthetic"],
      required: true,
    },
    preferences: {
      mathLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "expert"],
        required: true,
      },
      programmingLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "expert"],
        required: true,
      },
      preferredDomain: {
        type: String,
        enum: ["ml", "dl", "computer_vision", "nlp", "mlops"],
        required: true,
      },
    },
    assessments: [
      {
        category: {
          type: String,
          enum: [
            "math",
            "programming",
            "ml",
            "dl",
            "computer_vision",
            "nlp",
            "mlops",
          ],
          required: true,
        },
        score: {
          type: Number,
          min: 0,
          max: 100,
          required: true,
        },
        responses: [
          {
            questionId: String,
            selectedOption: String,
            timeSpent: Number,
            category: String,
            difficulty: String,
          },
        ],
        recommendations: [
          {
            category: {
              type: String,
              required: true,
            },
            score: {
              type: Number,
              required: true,
            },
            recommendations: {
              type: [String],
              required: true,
            },
          },
        ],
        completedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
    },
  },
  {
    timestamps: true,
  }
);

// Définir les index de manière explicite avec des noms uniques
learnerProfileSchema.index(
  { userId: 1 },
  { name: "learnerProfile_userId_index" }
);
learnerProfileSchema.index(
  { "assessments.category": 1 },
  { name: "learnerProfile_assessments_category_index" }
);

export const LearnerProfile = mongoose.model(
  "LearnerProfile",
  learnerProfileSchema
);
