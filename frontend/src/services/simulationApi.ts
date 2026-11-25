import type {
  RunSimulationRequest,
  RunSimulationResponse,
  GetSimulationsResponse,
  GetSimulationByIdResponse,
  EvaluateSimulationResponse,
} from '../types/simulation';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Runs a product simulation across a cohort of synthetic shoppers
 */
export const runSimulation = async (
  payload: RunSimulationRequest
): Promise<RunSimulationResponse> => {
  const response = await fetch(`${API_BASE_URL}/simulations/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg =
      data?.error?.details?.join(', ') ||
      data?.error?.message ||
      `Simulation failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};

/**
 * Retrieves the list of recent simulation runs
 */
export const fetchSimulations = async (): Promise<GetSimulationsResponse> => {
  const response = await fetch(`${API_BASE_URL}/simulations`, {
    headers: { Accept: 'application/json' },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || `Failed to fetch simulations: ${response.status}`);
  }

  return data;
};

/**
 * Deletes all simulation runs from the database
 */
export const deleteAllSimulations = async (): Promise<{ success: boolean; message: string; deletedCount: number }> => {
  const response = await fetch(`${API_BASE_URL}/simulations`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || `Failed to delete simulations: ${response.status}`);
  }

  return data;
};

/**
 * Retrieves a single simulation with full shopper reaction details
 */
export const fetchSimulationById = async (
  id: string
): Promise<GetSimulationByIdResponse> => {
  const response = await fetch(`${API_BASE_URL}/simulations/${encodeURIComponent(id)}`, {
    headers: { Accept: 'application/json' },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || `Failed to fetch simulation: ${response.status}`);
  }

  return data;
};

/**
 * Runs AI evaluation and classification on an existing simulation
 */
export const evaluateSimulation = async (
  id: string
): Promise<EvaluateSimulationResponse> => {
  const response = await fetch(`${API_BASE_URL}/simulations/${encodeURIComponent(id)}/evaluate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || `Evaluation failed with status ${response.status}`);
  }

  return data;
};
