import mongoose from 'mongoose';

const shopperSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: [true, 'Batch ID is required'],
      index: true,
      trim: true,
    },
    targetAudience: {
      type: String,
      required: [true, 'Target audience description is required'],
      trim: true,
    },
    country: {
      type: String,
      default: '',
      trim: true,
    },
    additionalCharacteristics: {
      type: String,
      default: '',
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Shopper name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'Age must be at least 18'],
      max: [75, 'Age must be at most 75'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    occupation: {
      type: String,
      required: [true, 'Occupation is required'],
      trim: true,
    },
    monthly_income: {
      type: Number,
      required: [true, 'Monthly income is required'],
      min: [0, 'Monthly income cannot be negative'],
    },
    interests: {
      type: [String],
      required: [true, 'Interests are required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one interest is required',
      },
    },
    shopping_preferences: {
      type: [String],
      required: [true, 'Shopping preferences are required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one shopping preference is required',
      },
    },
    price_sensitivity: {
      type: String,
      required: [true, 'Price sensitivity is required'],
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Price sensitivity must be low, medium, or high',
      },
    },
    personality_traits: {
      type: [String],
      required: [true, 'Personality traits are required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one personality trait is required',
      },
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying batch shoppers sorted by creation
shopperSchema.index({ batchId: 1, createdAt: -1 });

export const Shopper = mongoose.model('Shopper', shopperSchema);
