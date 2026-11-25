export type PriceSensitivity = 'low' | 'medium' | 'high';

export interface SyntheticShopper {
  _id: string;
  batchId: string;
  targetAudience: string;
  country?: string;
  additionalCharacteristics?: string;
  name: string;
  age: number;
  city: string;
  occupation: string;
  monthly_income: number;
  interests: string[];
  shopping_preferences: string[];
  price_sensitivity: PriceSensitivity;
  personality_traits: string[];
  bio: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GenerateShoppersRequest {
  targetAudience: string;
  count: number;
  country?: string;
  additionalCharacteristics?: string;
}

export interface GenerateShoppersResponse {
  success: boolean;
  message: string;
  batchId: string;
  count: number;
  targetAudience: string;
  country: string;
  additionalCharacteristics: string;
  createdAt: string;
  shoppers: SyntheticShopper[];
}

export interface ShopperBatch {
  _id: string;
  batchId: string;
  targetAudience: string;
  country: string;
  count: number;
  createdAt: string;
}

export interface GetShoppersResponse {
  success: boolean;
  count: number;
  shoppers: SyntheticShopper[];
}

export interface GetBatchesResponse {
  success: boolean;
  count: number;
  batches: ShopperBatch[];
}
