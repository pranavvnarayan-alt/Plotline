/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FilmCardData } from '../types';

export interface ConstraintCriteria {
  maxRuntime?: number | null;
  allowedGenres?: string[];
  preferredLanguage?: string;
}

/**
 * Validates whether a candidate film satisfies user constraints.
 */
export function validateFilmConstraints(
  film: FilmCardData,
  criteria: ConstraintCriteria
): { passes: boolean; reason?: string } {
  // 1. Runtime constraint check
  if (criteria.maxRuntime && typeof film.runtime_minutes === 'number') {
    if (film.runtime_minutes > criteria.maxRuntime) {
      return {
        passes: false,
        reason: `Runtime (${film.runtime_minutes}m) exceeds limit of ${criteria.maxRuntime}m.`,
      };
    }
  }

  // 2. Genre constraint check if specified
  if (criteria.allowedGenres && criteria.allowedGenres.length > 0 && film.genres) {
    const hasMatchingGenre = film.genres.some((g) =>
      criteria.allowedGenres!.some((allowed) => allowed.toLowerCase() === g.toLowerCase())
    );
    if (!hasMatchingGenre) {
      return {
        passes: false,
        reason: `Film genres [${film.genres.join(', ')}] do not match allowed list.`,
      };
    }
  }

  // 3. Language check if specified
  if (criteria.preferredLanguage && film.original_language) {
    if (film.original_language.toLowerCase() !== criteria.preferredLanguage.toLowerCase()) {
      return {
        passes: false,
        reason: `Language ${film.original_language} does not match preferred ${criteria.preferredLanguage}.`,
      };
    }
  }

  return { passes: true };
}

/**
 * Detects common prompt injection patterns in untrusted user or media inputs.
 */
export function detectPromptInjection(text: string): { hasSuspiciousInstruction: boolean; pattern?: string } {
  const suspiciousRegexes = [
    /ignore (all )?(previous|prior) (instructions|rules|prompts)/i,
    /reveal (your|the) (runtime|system) (prompt|instruction|rules)/i,
    /disclose (your|the) (keys|credentials|api_key|secrets)/i,
    /you are now in developer mode/i,
    /bypass safety guidelines/i,
    /system override/i,
  ];

  for (const regex of suspiciousRegexes) {
    if (regex.test(text)) {
      return {
        hasSuspiciousInstruction: true,
        pattern: regex.source,
      };
    }
  }

  return { hasSuspiciousInstruction: false };
}

/**
 * Formats runtime into a readable string (e.g. 104 -> "1h 44m").
 */
export function formatRuntime(minutes?: number | null): string {
  if (!minutes || minutes <= 0) {
    return 'Runtime unverified';
  }
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (hrs > 0) {
    return `${hrs}h`;
  }
  return `${mins}m`;
}

/**
 * Evaluates rubric score according to 06_TEST_EVALUATE_IMPROVE.md
 * Total out of 10 (each metric 0 to 2).
 */
export function calculateRubricScore(scores: {
  accuracy: number;
  clarity: number;
  scope: number;
  trust: number;
  privacy: number;
}): { total: number; passed: boolean; rating: string } {
  const total = scores.accuracy + scores.clarity + scores.scope + scores.trust + scores.privacy;
  // A test fails if total < 8 or if critical trust/accuracy is 0
  const isCriticalFail = scores.trust === 0 || scores.scope === 0;
  const passed = total >= 8 && !isCriticalFail;

  let rating = 'Poor';
  if (total >= 9) rating = 'Exemplary';
  else if (total >= 8) rating = 'Proficient';
  else if (total >= 5) rating = 'Developing';

  return { total, passed, rating };
}
