import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    pathwayId: {
      type: String,
      required: true,
    },
    moduleId: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    answers: [
      {
        questionId: String,
        selectedOption: String,
        isCorrect: Boolean,
        timeSpent: Number,
      },
    ],
    totalTimeSpent: {
      type: Number,
      required: true,
      min: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances des requêtes
quizAttemptSchema.index({ userId: 1, quizId: 1 });
quizAttemptSchema.index({ pathwayId: 1, moduleId: 1 });

export const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
