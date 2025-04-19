import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'reading', 'kinesthetic'],
    required: true
  },
  preferences: {
    mathLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true
    },
    programmingLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true
    },
    preferredDomain: {
      type: String,
      enum: ['ml', 'dl', 'computer_vision', 'nlp', 'mlops'],
      required: true
    }
  },
  goals: [{
    title: String,
    targetDate: Date,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  certificates: [{
    title: String,
    issuer: String,
    date: Date,
    url: String
  }],
  skills: [{
    name: String,
    level: {
      type: Number,
      min: 1,
      max: 5
    },
    endorsements: Number
  }]
}, {
  timestamps: true
});

// Index for efficient querying
userProfileSchema.index({ user: 1 });
userProfileSchema.index({ 'skills.name': 1 });

export const UserProfile = mongoose.model('UserProfile', userProfileSchema);