export interface ProductInput {
  name: string;
  category: string;
  price: number;
  currency?: string;
  description: string;
  adCopy?: string;
}

export type PurchaseDecision = 'Definitely Yes' | 'Maybe' | 'No';

export interface ShopperClassification {
  decision: PurchaseDecision;
  confidenceScore: number;
  primaryPurchaseDriver: string;
  primaryObjectionCategory: string;
  keyPositiveReason: string;
  keyConcernReason: string;
}

export interface ShopperResponse {
  _id?: string;
  shopperId?: string;
  shopperName: string;
  shopperOccupation: string;
  shopperCity: string;
  shopperAge: number;
  shopperIncome: number;
  priceSensitivity: 'low' | 'medium' | 'high';
  consideration: string;
  attractions: string[];
  concerns: string[];
  reactionQuote: string;
  willingnessToPayFeedback?: string;
  classification?: ShopperClassification;
}

export interface EvaluationSummary {
  evaluatedAt?: string;
  intentBreakdown: {
    definitelyYes: number;
    maybe: number;
    no: number;
    intentScore: number;
  };
  topDrivers: string[];
  commonObjections: string[];
  recommendations: string[];
  executiveSummary: string;
}

/** Phase 6: Per-simulation reliability & cost telemetry */
export interface SimulationTelemetry {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  durationMs: number;
  retriesCount: number;
}

export interface SimulationRun {
  _id: string;
  batchId: string;
  product: ProductInput;
  shopperCount: number;
  status: 'pending' | 'completed' | 'failed';
  responses?: ShopperResponse[];
  evaluationSummary?: EvaluationSummary;
  telemetry?: SimulationTelemetry;
  createdAt: string;
  updatedAt?: string;
}

export interface RunSimulationRequest {
  batchId: string;
  product: ProductInput;
}

export interface RunSimulationResponse {
  success: boolean;
  message: string;
  simulation: SimulationRun;
}

export interface GetSimulationsResponse {
  success: boolean;
  count: number;
  simulations: SimulationRun[];
}

export interface GetSimulationByIdResponse {
  success: boolean;
  simulation: SimulationRun;
}

export interface EvaluateSimulationResponse {
  success: boolean;
  message: string;
  simulation: SimulationRun;
}
