import mongoose from "mongoose";

const prerequisiteSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["math", "programming", "theory", "tools"],
    required: true,
  },
  skills: [
    {
      name: String,
      level: {
        type: String,
        enum: ["basic", "intermediate", "advanced"],
        required: true,
      },
    },
  ],
});

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  duration: {
    type: Number, // en heures
    required: true,
  },
  skills: [
    {
      name: String,
      level: {
        type: String,
        enum: ["basic", "intermediate", "advanced"],
      },
    },
  ],
  resources: [
    {
      title: String,
      type: {
        type: String,
        enum: [
          "video",
          "article",
          "book",
          "practice",
          "project",
          "tutorial",
          "course",
        ],
      },
      url: String,
      duration: Number, // en minutes
    },
  ],
  validationCriteria: [String],
});

const goalSchema = new mongoose.Schema(
  {
    title: {
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
      enum: [
        "ml",
        "dl",
        "data_science",
        "mlops",
        "computer_vision",
        "nlp",
        "robotics",
        "quantum_ml",
      ],
    },
    level: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced"],
    },
    estimatedDuration: {
      type: Number,
      required: true,
      min: 1,
    },
    prerequisites: [prerequisiteSchema],
    modules: [moduleSchema],
    careerOpportunities: [
      {
        title: String,
        description: String,
        averageSalary: String,
        companies: [String],
      },
    ],
    certification: {
      available: {
        type: Boolean,
        default: false,
      },
      name: String,
      provider: String,
      url: String,
    },
    requiredConcepts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Concept",
      },
    ],
    recommendedFor: [
      {
        profile: String,
        reason: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

goalSchema.index({ category: 1, level: 1 });
goalSchema.index({ "prerequisites.skills.name": 1 });
goalSchema.index({ "modules.skills.name": 1 });

export const Goal = mongoose.model("Goal", goalSchema);
