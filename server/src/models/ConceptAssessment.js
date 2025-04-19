import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  options: [
    {
      text: String,
      isCorrect: Boolean,
    },
  ],
  explanation: String,
});

const conceptAssessmentSchema = new mongoose.Schema(
  {
    conceptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Concept",
      required: true,
    },
    questions: [questionSchema],
    passingScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    timeLimit: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["basic", "intermediate", "advanced"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

conceptAssessmentSchema.index({ conceptId: 1 });

export const ConceptAssessment = mongoose.model(
  "ConceptAssessment",
  conceptAssessmentSchema
);
