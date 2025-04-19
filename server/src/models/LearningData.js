import mongoose from "mongoose";

const learningDataSchema = new mongoose.Schema(
  {
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearnerProfile",
      required: true,
    },
    pathwayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pathway",
      required: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningGoal",
      required: true,
    },
    initialAssessment: {
      type: Map,
      of: Number,
    },
    finalAssessment: {
      type: Map,
      of: Number,
    },
    timeToComplete: Number,
    successRate: Number,
    difficulties: [String],
  },
  {
    timestamps: true,
  }
);

learningDataSchema.index({ learnerId: 1, pathwayId: 1 });
learningDataSchema.index({ goalId: 1 });

export const LearningData = mongoose.model("LearningData", learningDataSchema);
