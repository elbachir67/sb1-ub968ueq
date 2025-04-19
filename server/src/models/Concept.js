import mongoose from "mongoose";

const conceptSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["basic", "intermediate", "advanced"],
      required: true,
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Concept",
      },
    ],
    assessmentTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ConceptAssessment",
    },
    resources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
      },
    ],
  },
  {
    timestamps: true,
  }
);

conceptSchema.index({ category: 1, level: 1 });

export const Concept = mongoose.model("Concept", conceptSchema);
