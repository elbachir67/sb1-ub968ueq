import mongoose from "mongoose";

const pathwaySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused"],
      default: "active",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    currentModule: {
      type: Number,
      default: 0,
    },
    moduleProgress: [
      {
        moduleIndex: Number,
        completed: {
          type: Boolean,
          default: false,
        },
        locked: {
          type: Boolean,
          default: true,
        },
        resources: [
          {
            resourceId: String,
            completed: Boolean,
            completedAt: Date,
          },
        ],
        quiz: {
          completed: Boolean,
          score: Number,
          completedAt: Date,
        },
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    estimatedCompletionDate: Date,
    adaptiveRecommendations: [
      {
        type: {
          type: String,
          enum: ["resource", "practice", "review"],
        },
        description: String,
        priority: {
          type: String,
          enum: ["high", "medium", "low"],
        },
        status: {
          type: String,
          enum: ["pending", "completed", "skipped"],
          default: "pending",
        },
      },
    ],
    nextGoals: [
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

// Méthode pour mettre à jour la progression
pathwaySchema.methods.updateProgress = async function () {
  const totalModules = this.moduleProgress.length;
  const completedModules = this.moduleProgress.filter(m => m.completed).length;
  this.progress = Math.round((completedModules / totalModules) * 100);

  // Mettre à jour la date estimée de complétion
  if (this.progress > 0) {
    const timeElapsed = Date.now() - this.startedAt.getTime();
    const progressRate = this.progress / timeElapsed;
    const remainingProgress = 100 - this.progress;
    const estimatedRemainingTime = remainingProgress / progressRate;
    this.estimatedCompletionDate = new Date(
      Date.now() + estimatedRemainingTime
    );
  }

  // Déverrouiller le prochain module si le module actuel est complété
  if (this.moduleProgress[this.currentModule]?.completed) {
    const nextModuleIndex = this.currentModule + 1;
    if (nextModuleIndex < this.moduleProgress.length) {
      this.moduleProgress[nextModuleIndex].locked = false;
      this.currentModule = nextModuleIndex;
    } else if (this.progress === 100) {
      // Si tous les modules sont complétés, suggérer les prochains parcours
      await this.suggestNextGoals();
    }
  }

  await this.save();
};

// Méthode pour suggérer les prochains parcours
pathwaySchema.methods.suggestNextGoals = async function () {
  const currentGoal = await mongoose.model("Goal").findById(this.goalId);
  if (!currentGoal) return;

  // Trouver des parcours plus avancés dans le même domaine
  const nextGoals = await mongoose
    .model("Goal")
    .find({
      category: currentGoal.category,
      level:
        currentGoal.level === "beginner"
          ? "intermediate"
          : currentGoal.level === "intermediate"
          ? "advanced"
          : "advanced",
      _id: { $ne: currentGoal._id },
    })
    .limit(3);

  this.nextGoals = nextGoals.map(goal => goal._id);
};

// Méthode pour vérifier si un module est accessible
pathwaySchema.methods.isModuleAccessible = function (moduleIndex) {
  if (moduleIndex === 0) return true;
  return this.moduleProgress[moduleIndex - 1]?.completed || false;
};

export const Pathway = mongoose.model("Pathway", pathwaySchema);
