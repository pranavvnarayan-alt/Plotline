/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isOpenRouterConfigured,
  getOpenRouterApiKey,
  getOpenRouterModel,
} from './openRouterClient';

test('OpenRouter Adapter: Detects explicit OPENROUTER_API_KEY', () => {
  const origOR = process.env.OPENROUTER_API_KEY;
  const origGemini = process.env.GEMINI_API_KEY;

  try {
    process.env.OPENROUTER_API_KEY = 'sk-or-v1-testkey123';
    process.env.GEMINI_API_KEY = '';

    assert.equal(isOpenRouterConfigured(), true);
    assert.equal(getOpenRouterApiKey(), 'sk-or-v1-testkey123');
  } finally {
    process.env.OPENROUTER_API_KEY = origOR;
    process.env.GEMINI_API_KEY = origGemini;
  }
});

test('OpenRouter Adapter: Auto-detects OpenRouter key placed in GEMINI_API_KEY', () => {
  const origOR = process.env.OPENROUTER_API_KEY;
  const origGemini = process.env.GEMINI_API_KEY;

  try {
    delete process.env.OPENROUTER_API_KEY;
    process.env.GEMINI_API_KEY = 'sk-or-v1-abc987654321';

    assert.equal(isOpenRouterConfigured(), true);
    assert.equal(getOpenRouterApiKey(), 'sk-or-v1-abc987654321');
  } finally {
    process.env.OPENROUTER_API_KEY = origOR;
    process.env.GEMINI_API_KEY = origGemini;
  }
});

test('OpenRouter Adapter: Returns false when standard Google AI key is provided', () => {
  const origOR = process.env.OPENROUTER_API_KEY;
  const origGemini = process.env.GEMINI_API_KEY;

  try {
    delete process.env.OPENROUTER_API_KEY;
    process.env.GEMINI_API_KEY = 'AIzaSyTestGoogleStudioKey';

    assert.equal(isOpenRouterConfigured(), false);
    assert.equal(getOpenRouterApiKey(), '');
  } finally {
    process.env.OPENROUTER_API_KEY = origOR;
    process.env.GEMINI_API_KEY = origGemini;
  }
});

test('OpenRouter Adapter: Resolves default 1:1 primary model and custom model override', () => {
  const origModel = process.env.OPENROUTER_MODEL;

  try {
    delete process.env.OPENROUTER_MODEL;
    // Default mapped 1:1 to Google flagship Flash
    assert.equal(getOpenRouterModel(), 'google/gemini-3.8-flash');

    process.env.OPENROUTER_MODEL = 'google/gemini-2.5-pro';
    assert.equal(getOpenRouterModel(), 'google/gemini-2.5-pro');
  } finally {
    if (origModel === undefined) {
      delete process.env.OPENROUTER_MODEL;
    } else {
      process.env.OPENROUTER_MODEL = origModel;
    }
  }
});

test('1:1 Model Mapping: Exact correspondence between Google and OpenRouter tiers', async () => {
  const { UNIFIED_MODEL_MAPPINGS, getGoogleCandidateModels, getOpenRouterCandidateModels } = await import('./modelConfig');

  const googleModels = getGoogleCandidateModels();
  const openRouterModels = getOpenRouterCandidateModels();

  assert.equal(googleModels.length, 3);
  assert.equal(openRouterModels.length, 3);

  // Tier 1: Flagship Flash
  assert.equal(googleModels[0], 'gemini-3.8-flash');
  assert.equal(openRouterModels[0], 'google/gemini-3.8-flash');

  // Tier 2: Resilient Flash Lite Fallback
  assert.equal(googleModels[1], 'gemini-3.1-flash-lite');
  assert.equal(openRouterModels[1], 'google/gemini-3.1-flash-lite');

  // Tier 3: Dynamic Flash Latest Fallback
  assert.equal(googleModels[2], 'gemini-flash-latest');
  assert.equal(openRouterModels[2], 'google/gemini-flash-latest');

  // Verify all entries in UNIFIED_MODEL_MAPPINGS are populated
  for (const mapping of UNIFIED_MODEL_MAPPINGS) {
    assert.ok(mapping.googleModel);
    assert.ok(mapping.openRouterModel);
    assert.equal(`google/${mapping.googleModel}`, mapping.openRouterModel);
  }
});

test('OpenRouter Adapter: Automatically upgrades deprecated models (e.g. gemini-2.5-flash)', () => {
  const origModel = process.env.OPENROUTER_MODEL;

  try {
    process.env.OPENROUTER_MODEL = 'google/gemini-2.5-flash';
    assert.equal(getOpenRouterModel(), 'google/gemini-3.8-flash');

    process.env.OPENROUTER_MODEL = 'gemini-2.5-flash';
    assert.equal(getOpenRouterModel(), 'google/gemini-3.8-flash');
  } finally {
    if (origModel === undefined) {
      delete process.env.OPENROUTER_MODEL;
    } else {
      process.env.OPENROUTER_MODEL = origModel;
    }
  }
});
