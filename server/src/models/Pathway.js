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

  await this.save();
};

// Méthode pour générer des recommandations adaptatives
pathwaySchema.methods.generateRecommendations = async function () {
  const currentModule = this.moduleProgress[this.currentModule];

  // Réinitialiser les recommandations
  this.adaptiveRecommendations = [];

  // Vérifier les ressources non complétées
  const incompleteResources = currentModule.resources.filter(r => !r.completed);
  if (incompleteResources.length > 0) {
    this.adaptiveRecommendations.push({
      type: "resource",
      description: "Complétez les ressources du module en cours",
      priority: "high",
      status: "pending",
    });
  }

  // Vérifier si un quiz est en attente
  if (!currentModule.quiz.completed) {
    this.adaptiveRecommendations.push({
      type: "practice",
      description: "Passez le quiz de validation du module",
      priority: "high",
      status: "pending",
    });
  }

  // Recommandations de révision basées sur les performances
  if (currentModule.quiz.score && currentModule.quiz.score < 70) {
    this.adaptiveRecommendations.push({
      type: "review",
      description: "Révisez les concepts clés du module",
      priority: "medium",
      status: "pending",
    });
  }

  await this.save();
};

export const Pathway = mongoose.model("Pathway", pathwaySchema);
