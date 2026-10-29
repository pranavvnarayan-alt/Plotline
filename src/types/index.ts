/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PersonaStyle = 'companion' | 'detective' | 'cinephile';

export interface RatingData {
  source: string;
  value: string | number;
  scale: string;
  retrieval_timestamp?: string;
  source_url?: string;
}

export interface AvailabilityData {
  provider: string;
  region: string;
  availability_type?: 'flatrate' | 'rent' | 'buy' | 'free' | 'unknown';
  source_url?: string;
  checked_timestamp?: string;
}

export interface CinemaShowtimeData {
  venue: string;
  location: string;
  date_time: string;
  ticket_price?: string;
  official_url?: string;
  checked_timestamp?: string;
}

export interface FilmCardData {
  title: string;
  release_year?: number | string;
  poster_url?: string;
  short_synopsis?: string;
  runtime_minutes?: number;
  genres?: string[];
  original_language?: string;
  origin_country?: string;
  match_reason?: string;
  ratings?: RatingData[];
  availability?: AvailabilityData[];
  cinema_showtimes?: CinemaShowtimeData[];
  confidence_note?: string;
  tmdb_id?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  films?: FilmCardData[];
  image_preview?: string;
  source_note?: string;
  is_clarification?: boolean;
  is_error?: boolean;
  reverse_search_engine?: string;
  reverse_search_matches?: Array<{ title: string; sourceUrl?: string }>;
}

export interface SavedPreferences {
  memory_enabled: boolean;
  preferred_languages: string[];
  preferred_genres: string[];
  themes_of_interest: string[];
  usual_runtime_max_minutes: number | null;
  subtitle_or_dubbing_preference: string | null;
  spoiler_preference: 'avoid_by_default' | 'allow';
  content_avoidances: string[];
  updated_at: string;
}

export interface SystemStatus {
  gemini_configured: boolean;
  openrouter_configured: boolean;
  active_provider: 'google' | 'openrouter';
  model_name: string;
  tmdb_configured: boolean;
  apify_configured: boolean;
  voice_status: {
    available: boolean;
    mode: string;
    note: string;
  };
  system_prompt_version: string;
  server_timestamp: string;
}

export interface TestScenario {
  id: string;
  name: string;
  prompt: string;
  expected_behaviour: string;
  status: 'not run' | 'passed' | 'failed' | 'blocked';
  actual_output?: string;
  scores?: {
    accuracy: number;
    clarity: number;
    scope: number;
    trust: number;
    privacy: number;
  };
  notes?: string;
}
