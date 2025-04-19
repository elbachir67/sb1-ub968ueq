import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    timeLimit: {
      type: Number,
      required: true,
      min: 60,
      max: 3600,
    },
    passingScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 70,
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
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances des requêtes
quizSchema.index({ moduleId: 1 });

export const Quiz = mongoose.model("Quiz", quizSchema);
