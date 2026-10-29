/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedPreferences } from '../types';

let inMemoryPreferences: SavedPreferences = {
  memory_enabled: false,
  preferred_languages: [],
  preferred_genres: [],
  themes_of_interest: [],
  usual_runtime_max_minutes: null,
  subtitle_or_dubbing_preference: null,
  spoiler_preference: 'avoid_by_default',
  content_avoidances: [],
  updated_at: new Date().toISOString(),
};

/**
 * Returns the currently active preferences.
 * Only returns actual preference content if memory_enabled is true.
 */
export function getSavedPreferences(): SavedPreferences {
  return { ...inMemoryPreferences };
}

/**
 * Saves preferences with strict validation on allowed fields.
 * Explicitly sets memory_enabled.
 */
export function savePreferences(data: Partial<SavedPreferences>): SavedPreferences {
  inMemoryPreferences = {
    memory_enabled: Boolean(data.memory_enabled),
    preferred_languages: Array.isArray(data.preferred_languages) ? data.preferred_languages.slice(0, 10) : [],
    preferred_genres: Array.isArray(data.preferred_genres) ? data.preferred_genres.slice(0, 10) : [],
    themes_of_interest: Array.isArray(data.themes_of_interest) ? data.themes_of_interest.slice(0, 10) : [],
    usual_runtime_max_minutes: typeof data.usual_runtime_max_minutes === 'number' && data.usual_runtime_max_minutes > 0
      ? data.usual_runtime_max_minutes
      : null,
    subtitle_or_dubbing_preference: typeof data.subtitle_or_dubbing_preference === 'string'
      ? data.subtitle_or_dubbing_preference
      : null,
    spoiler_preference: data.spoiler_preference === 'allow' ? 'allow' : 'avoid_by_default',
    content_avoidances: Array.isArray(data.content_avoidances) ? data.content_avoidances.slice(0, 10) : [],
    updated_at: new Date().toISOString(),
  };

  return { ...inMemoryPreferences };
}

/**
 * Completely purges all stored preferences and resets memory_enabled to false.
 */
export function deleteSavedPreferences(): boolean {
  inMemoryPreferences = {
    memory_enabled: false,
    preferred_languages: [],
    preferred_genres: [],
    themes_of_interest: [],
    usual_runtime_max_minutes: null,
    subtitle_or_dubbing_preference: null,
    spoiler_preference: 'avoid_by_default',
    content_avoidances: [],
    updated_at: new Date().toISOString(),
  };
  return true;
}

/**
 * Generates a concise summary string for the model prompt if memory is enabled.
 */
export function formatPreferencesForPrompt(prefs: SavedPreferences): string | null {
  if (!prefs.memory_enabled) {
    return null;
  }

  const parts: string[] = [];
  if (prefs.preferred_languages.length > 0) {
    parts.push(`Languages: ${prefs.preferred_languages.join(', ')}`);
  }
  if (prefs.preferred_genres.length > 0) {
    parts.push(`Genres: ${prefs.preferred_genres.join(', ')}`);
  }
  if (prefs.themes_of_interest.length > 0) {
    parts.push(`Themes: ${prefs.themes_of_interest.join(', ')}`);
  }
  if (prefs.usual_runtime_max_minutes) {
    parts.push(`Max runtime: ${prefs.usual_runtime_max_minutes} minutes`);
  }
  if (prefs.subtitle_or_dubbing_preference) {
    parts.push(`Sub/Dub: ${prefs.subtitle_or_dubbing_preference}`);
  }
  if (prefs.content_avoidances.length > 0) {
    parts.push(`Content boundaries to avoid: ${prefs.content_avoidances.join(', ')}`);
  }
  parts.push(`Spoiler policy: ${prefs.spoiler_preference === 'allow' ? 'User explicitly allows spoilers' : 'Strictly avoid spoilers'}`);

  return parts.length > 0 ? parts.join('; ') : null;
}
