import mongoose from 'mongoose';

const responseItemSchema = new mongoose.Schema(
  {
    shopperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shopper',
      required: false,
    },
    shopperName: {
      type: String,
      required: true,
      trim: true,
    },
    shopperOccupation: {
      type: String,
      required: true,
      trim: true,
    },
    shopperCity: {
      type: String,
      required: true,
      trim: true,
    },
    shopperAge: {
      type: Number,
      required: true,
    },
    shopperIncome: {
      type: Number,
      required: true,
    },
    priceSensitivity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high'],
    },
    consideration: {
      type: String,
      required: true,
      trim: true,
    },
    attractions: {
      type: [String],
      required: true,
      default: [],
    },
    concerns: {
      type: [String],
      required: true,
      default: [],
    },
    reactionQuote: {
      type: String,
      required: true,
      trim: true,
    },
    willingnessToPayFeedback: {
      type: String,
      default: '',
      trim: true,
    },
    // Phase 4: Classification metadata
    classification: {
      decision: {
        type: String,
        enum: ['Definitely Yes', 'Maybe', 'No'],
        default: null,
      },
      confidenceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      primaryPurchaseDriver: {
        type: String,
        default: '',
        trim: true,
      },
      primaryObjectionCategory: {
        type: String,
        default: '',
        trim: true,
      },
      keyPositiveReason: {
        type: String,
        default: '',
        trim: true,
      },
      keyConcernReason: {
        type: String,
        default: '',
        trim: true,
      },
    },
  },
  { _id: true }
);

const simulationSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: [true, 'Batch ID is required to link simulation to a cohort'],
      index: true,
      trim: true,
    },
    product: {
      name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
      },
      category: {
        type: String,
        required: [true, 'Product category is required'],
        trim: true,
      },
      price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative'],
      },
      currency: {
        type: String,
        default: 'INR',
        trim: true,
      },
      description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
      },
      adCopy: {
        type: String,
        default: '',
        trim: true,
      },
    },
    shopperCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
    responses: [responseItemSchema],
    // Phase 6: Reliability & cost telemetry for this simulation run
    telemetry: {
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
      estimatedCostUsd: { type: Number, default: 0 },
      durationMs: { type: Number, default: 0 },
      retriesCount: { type: Number, default: 0 },
    },

    // Phase 4: Cohort-level evaluation summary
    evaluationSummary: {
      evaluatedAt: {
        type: Date,
        default: null,
      },
      intentBreakdown: {
        definitelyYes: { type: Number, default: 0 },
        maybe: { type: Number, default: 0 },
        no: { type: Number, default: 0 },
        intentScore: { type: Number, default: 0 },
      },
      topDrivers: {
        type: [String],
        default: [],
      },
      commonObjections: {
        type: [String],
        default: [],
      },
      recommendations: {
        type: [String],
        default: [],
      },
      executiveSummary: {
        type: String,
        default: '',
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

simulationSchema.index({ batchId: 1, createdAt: -1 });

export const Simulation = mongoose.model('Simulation', simulationSchema);
export default Simulation;
