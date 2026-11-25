import type { ProductInput, EvaluationSummary } from './simulation';

export interface DecisionStats {
  total: number;
  shareOfCohort: number;
  definitelyYes: number;
  maybe: number;
  no: number;
  yesPercent: number;
  maybePercent: number;
  noPercent: number;
  intentScore: number;
}

export interface FrequencyItem {
  name: string;
  count: number;
  percentage: number;
}

export interface CategoryBenchmark {
  category: string;
  simulationCount: number;
  totalShoppers: number;
  averagePrice: number;
  averageIntentScore: number;
}

export interface PlatformOverview {
  totalSimulations: number;
  totalEvaluations: number;
  averageIntentScore: number;
  globalDecisionBreakdown: DecisionStats;
  topPlatformDrivers: FrequencyItem[];
  topPlatformObjections: FrequencyItem[];
  categoryBenchmarks: CategoryBenchmark[];
}

export interface CrossTabSegment {
  segment: string;
  description: string;
  label?: string;
  stats: DecisionStats;
}

export interface SimulationAnalytics {
  simulationId: string;
  product: ProductInput;
  shopperCount: number;
  evaluationSummary?: EvaluationSummary;
  crossTabs: {
    priceSensitivity: CrossTabSegment[];
    ageBrackets: CrossTabSegment[];
    incomeTiers: CrossTabSegment[];
  };
  rankedDrivers: FrequencyItem[];
  rankedObjections: FrequencyItem[];
}

export interface ComparedSimulation {
  _id: string;
  product: ProductInput;
  batchId: string;
  shopperCount: number;
  createdAt: string;
  intentScore: number;
  intentBreakdown: {
    definitelyYes: number;
    maybe: number;
    no: number;
    yesPercent: number;
    maybePercent: number;
    noPercent: number;
  };
  topDrivers: string[];
  commonObjections: string[];
  recommendations: string[];
  executiveSummary: string;
}

export interface ComparisonResult {
  count: number;
  winnerId: string;
  verdictSummary: string;
  simulations: ComparedSimulation[];
}

export interface GetPlatformOverviewResponse {
  success: boolean;
  overview: PlatformOverview;
}

export interface GetSimulationAnalyticsResponse {
  success: boolean;
  analytics: SimulationAnalytics;
}

export interface GetComparisonResponse {
  success: boolean;
  comparison: ComparisonResult;
}
