/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 1:1 Unified Model Mapping between Google Native API and OpenRouter.
 * Guarantees that irrespective of whether the application runs with GEMINI_API_KEY (Google AI Studio)
 * or OPENROUTER_API_KEY (OpenRouter), the exact same models and exact same fallback cascade handle the jobs.
 */
export interface ModelTierMapping {
  tier: number;
  label: string;
  googleModel: string;
  openRouterModel: string;
  description: string;
}

export const UNIFIED_MODEL_MAPPINGS: ModelTierMapping[] = [
  {
    tier: 1,
    label: 'Primary Flagship Flash',
    googleModel: 'gemini-3.8-flash',
    openRouterModel: 'google/gemini-3.8-flash',
    description: 'High-speed cinematic reasoning, multimodal clue analysis, and structured extraction.',
  },
  {
    tier: 2,
    label: 'First Resilient Fallback',
    googleModel: 'gemini-3.1-flash-lite',
    openRouterModel: 'google/gemini-3.1-flash-lite',
    description: 'Ultra-low latency, high-throughput fallback if Tier 1 experiences high demand.',
  },
  {
    tier: 3,
    label: 'Secondary Stability Fallback',
    googleModel: 'gemini-2.5-flash',
    openRouterModel: 'google/gemini-2.5-flash',
    description: 'Proven multi-token context fallback for global reliability.',
  },
];

/**
 * Retrieves the ordered candidate model list for Google Native API.
 */
export function getGoogleCandidateModels(): string[] {
  return UNIFIED_MODEL_MAPPINGS.map((m) => m.googleModel);
}

/**
 * Retrieves the ordered candidate model list for OpenRouter API.
 * Allows optional OPENROUTER_MODEL env override if user specifically designates a preferred tier.
 */
export function getOpenRouterCandidateModels(): string[] {
  const customModel = process.env.OPENROUTER_MODEL?.trim();
  const defaultList = UNIFIED_MODEL_MAPPINGS.map((m) => m.openRouterModel);

  if (customModel && !defaultList.includes(customModel)) {
    return [customModel, ...defaultList];
  }

  // If user specified one of the mapped models as preferred, put it first
  if (customModel && defaultList.includes(customModel)) {
    return [customModel, ...defaultList.filter((m) => m !== customModel)];
  }

  return defaultList;
}
