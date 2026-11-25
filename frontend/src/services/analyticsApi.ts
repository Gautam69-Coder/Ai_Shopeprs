import type {
  GetPlatformOverviewResponse,
  GetSimulationAnalyticsResponse,
  GetComparisonResponse,
} from '../types/analytics';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Fetches platform-wide aggregate KPI metrics across all tested cohorts
 */
export const fetchPlatformOverview = async (): Promise<GetPlatformOverviewResponse> => {
  const response = await fetch(`${API_BASE_URL}/analytics/overview`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch analytics overview (${response.status})`
    );
  }
  return response.json();
};

/**
 * Fetches deep demographic cross-tabulations and driver rankings for a specific simulation
 */
export const fetchSimulationAnalytics = async (
  simulationId: string
): Promise<GetSimulationAnalyticsResponse> => {
  const response = await fetch(`${API_BASE_URL}/analytics/simulations/${simulationId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch simulation analytics (${response.status})`
    );
  }
  return response.json();
};

/**
 * Compares two or more product simulations side-by-side (A/B testing matrix)
 */
export const fetchComparison = async (
  simulationIds: string[]
): Promise<GetComparisonResponse> => {
  const idsParam = simulationIds.join(',');
  const response = await fetch(
    `${API_BASE_URL}/analytics/compare?ids=${encodeURIComponent(idsParam)}`
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to compare simulations (${response.status})`
    );
  }
  return response.json();
};
