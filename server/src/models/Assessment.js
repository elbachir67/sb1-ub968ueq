import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "math",
        "programming",
        "ml",
        "dl",
        "computer_vision",
        "nlp",
        "mlops",
      ],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["basic", "intermediate", "advanced"],
    },
    questions: [
      {
        text: {
          type: String,
          required: true,
        },
        options: [
          {
            text: {
              type: String,
              required: true,
            },
            isCorrect: {
              type: Boolean,
              required: true,
            },
          },
        ],
        explanation: {
          type: String,
          required: true,
        },
      },
    ],
    recommendedGoals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Goal",
      },
    ],
  },
  {
    timestamps: true,
  }
);

assessmentSchema.index({ category: 1, difficulty: 1 });

export const Assessment = mongoose.model("Assessment", assessmentSchema);
