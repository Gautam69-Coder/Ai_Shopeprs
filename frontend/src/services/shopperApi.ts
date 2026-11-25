import { API_BASE_URL } from '../config/api';
import type {
  GenerateShoppersRequest,
  GenerateShoppersResponse,
  GetShoppersResponse,
  GetBatchesResponse,
  SyntheticShopper,
} from '../types/shopper';

/**
 * Triggers synthetic shopper profile generation via Groq LLM
 */
export const generateShoppers = async (
  payload: GenerateShoppersRequest
): Promise<GenerateShoppersResponse> => {
  const response = await fetch(`${API_BASE_URL}/shoppers/generate`, {
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
      `Generation failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};

/**
 * Directly saves one or more synthetic shoppers to MongoDB
 */
export const saveShoppers = async (
  payload: {
    targetAudience?: string;
    country?: string;
    additionalCharacteristics?: string;
    batchId?: string;
    shoppers: Partial<SyntheticShopper>[];
  }
): Promise<GenerateShoppersResponse> => {
  const response = await fetch(`${API_BASE_URL}/shoppers`, {
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
      `Save failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};

/**
 * Fetches synthetic shoppers, optionally filtered by batchId
 */
export const fetchShoppers = async (
  batchId?: string
): Promise<GetShoppersResponse> => {
  const url = batchId
    ? `${API_BASE_URL}/shoppers?batchId=${encodeURIComponent(batchId)}`
    : `${API_BASE_URL}/shoppers`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || `Failed to fetch shoppers: ${response.status}`);
  }

  return data;
};

/**
 * Fetches distinct generation batches
 */
export const fetchBatches = async (): Promise<GetBatchesResponse> => {
  const response = await fetch(`${API_BASE_URL}/shoppers/batches`, {
    headers: { Accept: 'application/json' },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || `Failed to fetch batches: ${response.status}`);
  }

  return data;
};
