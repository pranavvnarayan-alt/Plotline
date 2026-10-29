/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FilmCardData, RatingData, AvailabilityData } from '../types';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

export interface TMDBEnrichedData {
  poster_url?: string;
  tmdb_id?: number;
  release_year?: number;
  runtime_minutes?: number;
  genres?: string[];
  ratings?: RatingData[];
  availability?: AvailabilityData[];
  source_attribution?: string;
}

/**
 * Resolves the TMDB API key from various secret name conventions:
 * TMDB_API_KEY, ImDb_KEY (user secret), TMDB_KEY, TmDb_KEY, etc.
 */
export function getTMDBApiKey(): string | undefined {
  return (
    process.env.TMDB_API_KEY ||
    process.env.TMDB_KEY ||
    process.env.ImDb_KEY ||
    process.env.IMDB_KEY ||
    process.env.TmDb_KEY
  )?.trim();
}

/**
 * Resolves the Watchmode API key from environment variables or attached user secrets
 * (including Platform_identification_KEY).
 */
export function getWatchmodeApiKey(): string | undefined {
  return (
    process.env.WATCHMODE_API_KEY ||
    process.env.WATCHMODE_KEY ||
    process.env.Platform_identification_KEY
  )?.trim();
}

export interface WatchmodeEnrichedData {
  watchmode_id?: number;
  user_rating?: number;
  critic_score?: number;
  us_rating?: string;
  ratings: RatingData[];
  availability: AvailabilityData[];
}

/**
 * Queries Watchmode v1 API by TMDB movie ID (`movie-{tmdbId}`) for live user ratings,
 * critic scores, and regional streaming/rental/purchase sources.
 */
export async function fetchWatchmodeMovieData(
  tmdbId: number,
  region: string = 'IN'
): Promise<WatchmodeEnrichedData | null> {
  const apiKey = getWatchmodeApiKey();
  if (!apiKey || !tmdbId) return null;

  try {
    const url = new URL(`https://api.watchmode.com/v1/title/movie-${tmdbId}/details/`);
    url.searchParams.set('apiKey', apiKey);
    url.searchParams.set('append_to_response', 'sources');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const data = await res.json();
    const nowIso = new Date().toISOString();
    const ratings: RatingData[] = [];

    if (typeof data.user_rating === 'number' && data.user_rating > 0) {
      ratings.push({
        source: 'Watchmode User Rating',
        value: Number(data.user_rating.toFixed(1)),
        scale: '10',
        retrieval_timestamp: nowIso,
        source_url: `https://www.watchmode.com/`,
      });
    }

    if (typeof data.critic_score === 'number' && data.critic_score > 0) {
      ratings.push({
        source: 'Watchmode Critic Score',
        value: Math.round(data.critic_score),
        scale: '100',
        retrieval_timestamp: nowIso,
        source_url: `https://www.watchmode.com/`,
      });
    }

    const availability: AvailabilityData[] = [];
    if (Array.isArray(data.sources) && data.sources.length > 0) {
      const targetRegion = region.toUpperCase();
      const regionSources = data.sources.filter(
        (s: any) => !s.region || s.region.toUpperCase() === targetRegion
      );
      const sourcesToUse = regionSources.length > 0 ? regionSources : data.sources.slice(0, 4);
      const seenProviders = new Set<string>();

      for (const s of sourcesToUse) {
        const providerName = s.name || 'Streaming Platform';
        const typeRaw = (s.type || '').toLowerCase();
        const mappedType: AvailabilityData['availability_type'] =
          typeRaw === 'sub'
            ? 'flatrate'
            : typeRaw === 'free'
              ? 'free'
              : typeRaw === 'rent'
                ? 'rent'
                : typeRaw === 'buy'
                  ? 'buy'
                  : 'flatrate';
        const dedupeKey = `${providerName}-${mappedType}`;
        if (seenProviders.has(dedupeKey)) continue;
        seenProviders.add(dedupeKey);

        availability.push({
          provider: providerName,
          region: (s.region || targetRegion).toUpperCase(),
          availability_type: mappedType,
          source_url:
            typeof s.web_url === 'string' && s.web_url.startsWith('http')
              ? s.web_url
              : `https://www.themoviedb.org/movie/${tmdbId}/watch`,
          checked_timestamp: nowIso,
        });
        if (availability.length >= 5) break;
      }
    }

    return {
      watchmode_id: data.id,
      user_rating: typeof data.user_rating === 'number' ? data.user_rating : undefined,
      critic_score: typeof data.critic_score === 'number' ? data.critic_score : undefined,
      us_rating: data.us_rating || undefined,
      ratings,
      availability,
    };
  } catch {
    return null;
  }
}

/**
 * Searches TMDB for a film by title and optional year to retrieve verified metadata.
 * Complies strictly with TMDB terms: requires attribution, no scraping, graceful degradation.
 */
export async function searchTMDBMovie(
  title: string,
  year?: number | string,
  region: string = 'IN'
): Promise<TMDBEnrichedData | null> {
  const apiKey = getTMDBApiKey();
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  try {
    const url = new URL(`${TMDB_API_BASE}/search/movie`);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('query', title);
    if (year) {
      const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
      if (!isNaN(yearNum)) {
        url.searchParams.set('primary_release_year', yearNum.toString());
      }
    }

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      return null;
    }

    const topHit = data.results[0];
    const movieId = topHit.id;

    // Fetch detailed movie info from TMDB and Watchmode in parallel
    const detailUrl = new URL(`${TMDB_API_BASE}/movie/${movieId}`);
    detailUrl.searchParams.set('api_key', apiKey);
    detailUrl.searchParams.set('append_to_response', 'watch/providers');

    const [detailRes, watchmodeData] = await Promise.all([
      fetch(detailUrl.toString()),
      fetchWatchmodeMovieData(movieId, region),
    ]);

    if (!detailRes.ok) {
      return {
        poster_url: topHit.poster_path ? `${TMDB_IMAGE_BASE}${topHit.poster_path}` : undefined,
        tmdb_id: movieId,
        release_year: topHit.release_date ? parseInt(topHit.release_date.split('-')[0], 10) : undefined,
        ratings: topHit.vote_average ? [
          {
            source: 'TMDB User Score',
            value: Number(topHit.vote_average.toFixed(1)),
            scale: '10',
            retrieval_timestamp: new Date().toISOString(),
            source_url: `https://www.themoviedb.org/movie/${movieId}`,
          },
          ...(watchmodeData?.ratings || []),
        ] : watchmodeData?.ratings,
        availability: watchmodeData?.availability,
        source_attribution: 'Data provided by TMDB & Watchmode.',
      };
    }

    const details = await detailRes.json();
    const releaseYear = details.release_date ? parseInt(details.release_date.split('-')[0], 10) : undefined;
    const runtime = details.runtime && details.runtime > 0 ? details.runtime : undefined;
    const genres = Array.isArray(details.genres) ? details.genres.map((g: { name: string }) => g.name) : undefined;

    const ratings: RatingData[] = [];
    if (details.vote_average && details.vote_count > 0) {
      ratings.push({
        source: 'TMDB User Score',
        value: Number(details.vote_average.toFixed(1)),
        scale: '10',
        retrieval_timestamp: new Date().toISOString(),
        source_url: `https://www.themoviedb.org/movie/${movieId}`,
      });
    }
    if (watchmodeData?.ratings?.length) {
      ratings.push(...watchmodeData.ratings);
    }

    // Parse watch providers for the requested region
    const availabilityList: AvailabilityData[] = [];
    const providersData = details['watch/providers']?.results?.[region.toUpperCase()];
    if (providersData) {
      const nowIso = new Date().toISOString();
      const tmdbWatchUrl = providersData.link || `https://www.themoviedb.org/movie/${movieId}/watch`;

      if (Array.isArray(providersData.flatrate)) {
        for (const p of providersData.flatrate.slice(0, 3)) {
          availabilityList.push({
            provider: p.provider_name,
            region: region.toUpperCase(),
            availability_type: 'flatrate',
            source_url: tmdbWatchUrl,
            checked_timestamp: nowIso,
          });
        }
      }

      if (Array.isArray(providersData.rent)) {
        for (const p of providersData.rent.slice(0, 2)) {
          availabilityList.push({
            provider: p.provider_name,
            region: region.toUpperCase(),
            availability_type: 'rent',
            source_url: tmdbWatchUrl,
            checked_timestamp: nowIso,
          });
        }
      }
    }

    if (availabilityList.length === 0 && watchmodeData?.availability?.length) {
      availabilityList.push(...watchmodeData.availability);
    }

    return {
      poster_url: details.poster_path ? `${TMDB_IMAGE_BASE}${details.poster_path}` : undefined,
      tmdb_id: movieId,
      release_year: releaseYear,
      runtime_minutes: runtime,
      genres,
      ratings: ratings.length > 0 ? ratings : undefined,
      availability: availabilityList.length > 0 ? availabilityList : undefined,
      source_attribution: 'Data & images provided by TMDB & Watchmode.',
    };
  } catch {
    return null;
  }
}

/**
 * Fetches notable films released after January 2025 directly from TMDB's live discover endpoint.
 */
export async function discover2025Films(region: string = 'IN'): Promise<FilmCardData[]> {
  const apiKey = getTMDBApiKey();
  if (!apiKey || apiKey.trim() === '') {
    return [];
  }

  try {
    const url = new URL(`${TMDB_API_BASE}/discover/movie`);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('primary_release_date.gte', '2025-01-01');
    url.searchParams.set('sort_by', 'popularity.desc');
    url.searchParams.set('vote_count.gte', '10');

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];

    const results: FilmCardData[] = [];
    for (const movie of data.results.slice(0, 6)) {
      const releaseYear = movie.release_date ? parseInt(movie.release_date.split('-')[0], 10) : 2025;
      results.push({
        title: movie.title,
        release_year: releaseYear,
        poster_url: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : undefined,
        short_synopsis: movie.overview,
        original_language: movie.original_language?.toUpperCase(),
        tmdb_id: movie.id,
        match_reason: `Live 2025+ verified release from TMDB catalog (Release date: ${movie.release_date || '2025'}).`,
        ratings: movie.vote_average ? [
          {
            source: 'TMDB User Score',
            value: Number(movie.vote_average.toFixed(1)),
            scale: '10',
            retrieval_timestamp: new Date().toISOString(),
            source_url: `https://www.themoviedb.org/movie/${movie.id}`,
          }
        ] : undefined,
        confidence_note: 'Live TMDB 2025+ Entry',
      });
    }

    return results;
  } catch {
    return [];
  }
}

export interface LiveMovieLookup {
  contextPrompt: string;
  matchedMovie?: FilmCardData;
}

/**
 * Cleans conversational prefixes and suffixes from an extracted movie title candidate.
 */
function cleanMovieTitleCandidate(raw: string): string {
  return raw
    .replace(/\(\s*(?:19\d\d|20\d\d)\s*\)/g, ' ')
    .replace(/\[\s*(?:19\d\d|20\d\d)\s*\]/g, ' ')
    .replace(/\b(19\d\d|20\d\d)\b/g, ' ')
    // Strip leading quotes or asterisks
    .replace(/^["'“”‘’*]+|["'“”‘’*]+$/g, '')
    // Strip leading conversational articles/adjectives like "the new ", "the upcoming ", "a standalone ", "the latest "
    .replace(
      /^(?:(?:the|a|an|this|that)\s+)?(?:(?:new|upcoming|latest|recent|standalone|live-action|animated|official|original|next|classic|italian|indian|korean|french|japanese)\s+)+(?:(?:film|movie|project|picture|release|series|flick)\s+(?:titled|called|named)?\s*)?/i,
      ''
    )
    .replace(
      /^(?:(?:the|a|an|this|that)\s+)?(?:film|movie|project|picture|release|series|flick)\s+(?:titled|called|named)?\s*/i,
      ''
    )
    // Strip trailing conversational suffixes like "movie? How is it?", "film", "release date", "should I watch it"
    .replace(
      /\b(?:film|movie|project|picture|release date|releasing|review|reviews|cast|plot|synopsis|reception|trailer|news|in india|right now|and its|with that|which|that|how is it|how was it|is it good|should i watch|worth watching|worth a watch|worth it)\b.*$/i,
      ''
    )
    .replace(/^["'“”‘’*]+|["'“”‘’*]+$/g, '')
    .replace(/[?!.,;:()[\]]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detects whether a prompt is a conversational follow-up referring to the movie already being discussed
 * via pronouns (e.g., "how is it?", "how was it?", "is it worth watching?", "should I watch it?", "what's your opinion on it?").
 */
export function isFollowUpQuery(prompt: string): boolean {
  const trimmed = prompt.trim();
  if (!trimmed) return false;
  // Explicit double-quoted or boundary single-quoted title means not a pure pronoun follow-up
  if (/["“][^"”\n]{2,}["”]/.test(trimmed)) return false;
  if (/(?:^|[\s([{"“])['‘](?:[^'’\n]|['’](?=[A-Za-z])){2,}?['’](?=$|[\s.,?!;:)\]}"”])/.test(trimmed)) return false;
  if (/\b(19\d\d|20\d\d)\b/.test(trimmed)) return false;
  if (/\b(?:of|for|on|about|called|titled|named)\s+(?:the\s+(?:movie|film)\s+)?[A-Z]/.test(trimmed)) return false;

  const followUpRegex =
    /^(?:(?:hey|hi|ok|okay|so|and|but|wait|well|also|tell me|can you tell me|do you know)\s*[!,.:;-]*\s*)?(?:how\s+(?:is|was|are|were)\s+(?:it|the\s+(?:movie|film|reviews?|ratings?|acting|plot|story|vibe)|that|this)|is\s+(?:it|that|this)\s+(?:good|worth(?:\s+watching|\s+it|\s+a\s+watch)?|any\s+good|out|released|streaming|available|scary|funny)|should\s+(?:i|we)\s+(?:watch|see|stream)\s+(?:it|this|that|the\s+(?:movie|film))|what(?:\s+is|'s|s|\s+was|\s+are)\s+(?:it|its\s+\w+|your\s+(?:opinion|thoughts?|take|verdict)\s+(?:on|about)\s+(?:it|this|that|the\s+(?:movie|film))|the\s+(?:reviews?|ratings?|score|cast|plot|story|runtime|release\s+date))|where\s+(?:can|do|to)\s+(?:i\s+)?(?:watch|stream|find|see)\s+(?:it|this|that|the\s+(?:movie|film))|who\s+(?:directed|wrote|stars\s+in|is\s+in)\s+(?:it|this|that|the\s+(?:movie|film))|do\s+you\s+recommend\s+(?:it|this|that)|was\s+it\s+good|how's\s+it|hows\s+it)\s*[?!.]*$/i;

  return followUpRegex.test(trimmed);
}

/**
 * Extracts a candidate movie title and optional explicit year from user text.
 */
export function extractCandidateTitle(prompt: string): { title: string | null; year?: string; candidates?: string[] } {
  if (isFollowUpQuery(prompt)) {
    return { title: null, candidates: [] };
  }

  let explicitYear: string | undefined;
  const yearMatch = prompt.match(/\b(19\d\d|20\d\d)\b/);
  if (yearMatch) {
    explicitYear = yearMatch[1];
  }

  const candidateSet = new Set<string>();
  const invalidSingleWords = new Set([
    'the', 'a', 'an', 'this', 'that', 'it', 'its', 'them', 'there', 'here', 'movie', 'film', 'movies', 'films',
    'new', 'upcoming', 'latest', 'good', 'great', 'bad', 'how', 'what', 'when', 'where', 'who', 'why',
    'was', 'were', 'is', 'are', 'wait', 'really', 'actually', 'honestly', 'seriously', 'well',
    'so', 'and', 'but', 'also', 'reviews', 'review', 'rating', 'ratings', 'score', 'scores',
    'watch', 'watching', 'streaming', 'stream', 'available', 'worth', 'early', 'late', 'plot', 'cast',
    'opinion', 'opinions', 'thought', 'thoughts', 'think', 'should', 'would', 'could',
  ]);
  const invalidPhrases = new Set([
    'the movie', 'the film', 'this movie', 'this film', 'that movie', 'that film', 'a movie', 'a film',
    'your opinion', 'your thoughts', 'watch it', 'watching it', 'see it', 'stream it', 'worth watching',
    'is it', 'was it', 'how is', 'how was', 'should i', 'can i',
  ]);

  const addCandidate = (raw: string | null | undefined) => {
    if (!raw) return;
    const cleaned = cleanMovieTitleCandidate(raw);
    const lower = cleaned.toLowerCase();
    if (cleaned.length >= 2 && !invalidSingleWords.has(lower) && !invalidPhrases.has(lower)) {
      candidateSet.add(cleaned);
      // If lowercase "the " is at the start of a short candidate (e.g., "the Clayface"), also add without "the "
      if (/^the\s+/i.test(cleaned) && cleaned.split(/\s+/).length <= 3) {
        const withoutThe = cleaned.replace(/^the\s+/i, '').trim();
        const withoutTheLower = withoutThe.toLowerCase();
        if (withoutThe.length >= 2 && !invalidSingleWords.has(withoutTheLower) && !invalidPhrases.has(withoutTheLower)) {
          candidateSet.add(withoutThe);
        }
      }
    }
  };

  // 1a. Check for double-quoted title: "The End of Oak Street" or “Life Is Beautiful”
  for (const m of prompt.matchAll(/["“]([^"”\n]{2,80}?)["”]/g)) {
    if (m[1]) addCandidate(m[1].trim());
  }

  // 1b. Check for boundary single-quoted title: 'life is beautiful' or 'Clayface'
  // Requires start-of-string or whitespace/punctuation before opening quote so contractions like "what's" never match as opening quotes
  for (const m of prompt.matchAll(/(?:^|[\s([{"“])['‘]((?:[^'’\n]|['’](?=[A-Za-z])){2,80}?)['’](?=$|[\s.,?!;:)\]}"”])/g)) {
    if (m[1]) addCandidate(m[1].trim());
  }

  // Normalize parenthetical year out of prompt copy for regex matching
  const promptNoYearParens = prompt.replace(/\(\s*(?:19\d\d|20\d\d)\s*\)/g, ' ');

  // 2. Check for conversational intro & question patterns (supports lowercase, mixed-case, and Title Case movie names)
  const introPatterns = [
    /(?:film|movie|project|picture|release|series|flick)\s+(?:titled|called|named)\s+([A-Za-z0-9\s:&'’!–-]{2,60})/gi,
    /\b(?:plot|synopsis|cast|story|premise|runtime|director|reviews?|details|info|information|thoughts?|opinions?|take|verdict|feelings?|ratings?|scores?|ending|reception|vibe)\s+(?:of|for|on|about|towards)\s+(?:(?:the|a|an|this|that)\s+(?:(?:upcoming|new|latest|recent|standalone|classic|20\d\d|19\d\d)\s+)*(?:film|movie|project|picture|flick)\s+|(?:the|a|an)\s+(?:(?:upcoming|new|latest|recent|standalone)\s+)+)?([A-Za-z0-9\s:&'’!–-]{2,60})/gi,
    /\b(?:tell\s+me\s+about|know\s+about|heard\s+(?:of|about)|what\s+do\s+you\s+think\s+(?:of|about)|how\s+do\s+you\s+feel\s+about|should\s+(?:i|we)\s+(?:watch|see|stream)|(?:can|could)\s+you\s+(?:review|explain|recommend|find|look\s+up)|where\s+(?:can|do|to|could)\s+(?:i\s+|we\s+)?(?:watch|stream|find|see)|(?:have\s+you|did\s+you)\s+(?:seen|watch|watched)|talk\s+about|asking\s+about|asked\s+about|about)\s+(?:(?:the|a|an|this|that)\s+(?:(?:upcoming|new|latest|recent|standalone|classic|20\d\d|19\d\d)\s+)*(?:film|movie|project|picture|flick)\s+|(?:the|a|an)\s+(?:(?:upcoming|new|latest|recent|standalone)\s+)+)?([A-Za-z0-9\s:&'’!–-]{2,60})/gi,
    /\b(?:is|was)\s+(?:the\s+(?:movie|film)\s+)?([A-Za-z0-9\s:&'’!–-]{2,60}?)\s+(?:worth\s+(?:watching|it|a\s+watch|seeing|my\s+time)|any\s+good|a\s+good\s+(?:movie|film|watch)|good\s+to\s+watch|good|great|bad|scary|sad|funny|streaming|available|out\s+yet)\b/gi,
    /\b(?:what\s+is|what's|whats)\s+(?:the\s+(?:movie|film)\s+)?([A-Za-z0-9\s:&'’!–-]{2,60}?)\s+about\b/gi,
    /\b(?:how\s+is|how's|hows|how\s+was)\s+(?:the\s+(?:movie|film)\s+)?([A-Za-z0-9\s:&'’!–-]{2,60}?)(?=[?!.,;]|$)/gi,
  ];

  for (const pattern of introPatterns) {
    for (const m of promptNoYearParens.matchAll(pattern)) {
      if (m[1]) {
        // Take only the first sentence/clause before '?' or '!' or '.' or ';'
        const firstClause = m[1].split(/[?!.;]/)[0];
        addCandidate(firstClause);
      }
    }
  }

  // 3. Extract contiguous capitalized title phrases (preserving lowercase connector words like "of", "the", "is", "in", "and", "to", "on", "a")
  const connectors = new Set([
    'of', 'the', 'in', 'and', 'to', 'for', 'on', 'at', 'with', 'from', 'by', 'a', 'an', 'vs', 'or', 'part',
    'is', 'are', 'was', 'were', 'be', 'as', 'into', 'over', 'under', 'out', 'up', 'down', 'no', 'not', 'all', 'once',
  ]);
  const stopStarts = new Set([
    'Can', 'Could', 'Would', 'Should', 'Tell', 'What', 'What\'s', 'Whats', 'Who', 'When', 'Where', 'Why', 'How', 'How\'s',
    'Is', 'Are', 'Was', 'Were', 'Do', 'Does', 'Did', 'Have', 'Has', 'Please',
    'I', 'We', 'You', 'Your', 'They', 'He', 'She', 'It', 'Its', 'This', 'That', 'These', 'Those',
    'Think', 'Gain', 'Give', 'Show', 'Find', 'Search', 'Look', 'Check', 'Explain',
    'Yes', 'No', 'Ok', 'Okay', 'Hey', 'Hi', 'Hello', 'Hellooo', 'Thanks', 'Thank',
    'Wait', 'Really', 'Actually', 'Honestly', 'So', 'And', 'But', 'Also', 'Well',
  ]);

  const rawTokens = promptNoYearParens.replace(/[?!.,;()[\]]/g, ' ').split(/\s+/).filter(Boolean);
  const phrases: string[][] = [];
  let current: string[] = [];

  for (let i = 0; i < rawTokens.length; i++) {
    const tok = rawTokens[i];
    const isCap = /^[A-Z][A-Za-z0-9'’-]*$/.test(tok);
    const isNum = /^\d+$/.test(tok) && tok !== explicitYear;
    const isConnector = connectors.has(tok.toLowerCase());

    if (current.length === 0) {
      if (isCap && !stopStarts.has(tok)) {
        current.push(tok);
      }
    } else {
      if (isCap || isNum) {
        current.push(tok);
      } else if (isConnector && i + 1 < rawTokens.length && /^[A-Z][A-Za-z0-9'’-]*$/.test(rawTokens[i + 1])) {
        current.push(tok);
      } else {
        phrases.push(current);
        current = [];
      }
    }
  }
  if (current.length > 0) {
    phrases.push(current);
  }

  if (phrases.length > 0) {
    phrases.sort((a, b) => b.length - a.length);
    for (const p of phrases) {
      addCandidate(p.join(' '));
    }
  }

  const candidates = Array.from(candidateSet);
  return {
    title: candidates[0] || null,
    year: explicitYear,
    candidates,
  };
}

/**
 * Extracts the active film subject from recent conversation history when the user asks a follow-up question
 * (such as "how is it?", "how was it?", "is it good?", "where can I watch it?").
 * Prioritizes the user's explicitly requested movie and the primary movie introduced in the opening paragraph
 * of the assistant's reply—never a secondary "similar" movie mentioned at the end of a response.
 */
export function extractSubjectFromHistory(
  history: Array<{ role: string; content: string }>
): { title: string; year?: string; candidates: string[] } | null {
  if (!history || history.length === 0) return null;

  const isCrewOrLabelMention = (textBefore: string, candidateText: string): boolean => {
    const cleaned = candidateText.trim();
    if (/^\d+(\.\d+)?\s*\/\s*\d+$/.test(cleaned)) return true;
    if (/^(?:Release Date|Runtime|Genres?|Director|Writers?|Key Cast|Cast|TMDB|Watchmode|BookMyShow)$/i.test(cleaned)) {
      return true;
    }
    const tail = textBefore.slice(-45).toLowerCase();
    return /\b(?:directed\s+by|written\s+by|script\s+by|screenplay\s+by|story\s+by|starring|stars|featuring|played\s+by|portrayed\s+by|cast\s+includes|led\s+by|alongside|reviewers?\s+like|by)\s*$/i.test(
      tail
    );
  };

  for (let i = history.length - 1; i >= Math.max(0, history.length - 6); i--) {
    const entry = history[i];
    if (!entry?.content) continue;

    if (entry.role === 'assistant') {
      // 0. First check if the preceding user turn explicitly named a movie that this assistant reply is discussing
      if (i > 0 && history[i - 1]?.role === 'user' && history[i - 1]?.content) {
        const prevUser = extractCandidateTitle(history[i - 1].content);
        if (prevUser.title && entry.content.toLowerCase().includes(prevUser.title.toLowerCase())) {
          let year = prevUser.year;
          if (!year) {
            const escaped = prevUser.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const yearNearTitle = entry.content.match(
              new RegExp(`${escaped}[*”"']{0,3}\\s*\\(\\s*(19\\d\\d|20\\d\\d)\\s*\\)`, 'i')
            );
            if (yearNearTitle && yearNearTitle[1]) {
              year = yearNearTitle[1];
            }
          }
          return {
            title: prevUser.title,
            year,
            candidates: prevUser.candidates || [prevUser.title],
          };
        }
      }

      // Inspect the FIRST paragraph first so secondary "similar movie" recommendations at the end of a reply are never prioritized
      const paragraphs = entry.content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
      const scopes = paragraphs.length > 0 ? [paragraphs[0], entry.content] : [entry.content];

      for (const scope of scopes) {
        // 1. Check for **Title** (YYYY) or *Title* (YYYY)
        for (const m of scope.matchAll(/\*{1,3}([^*\n]{2,60}?)\*{1,3}\s*\(\s*(19\d\d|20\d\d)\s*\)/g)) {
          const before = scope.slice(0, m.index || 0);
          if (isCrewOrLabelMention(before, m[1])) continue;
          const cleaned = cleanMovieTitleCandidate(m[1]);
          if (cleaned.length >= 2) {
            return { title: cleaned, year: m[2], candidates: [cleaned] };
          }
        }

        // 2. Check for **Title (YYYY)**
        for (const m of scope.matchAll(/\*{1,3}([^*\n(]{2,60}?)\s*\(\s*(19\d\d|20\d\d)\s*\)\*{1,3}/g)) {
          const before = scope.slice(0, m.index || 0);
          if (isCrewOrLabelMention(before, m[1])) continue;
          const cleaned = cleanMovieTitleCandidate(m[1]);
          if (cleaned.length >= 2) {
            return { title: cleaned, year: m[2], candidates: [cleaned] };
          }
        }

        // 3. Check for "Title" (YYYY)
        for (const m of scope.matchAll(/["“]([^"”\n]{2,60}?)["”]\s*\(\s*(19\d\d|20\d\d)\s*\)/g)) {
          const before = scope.slice(0, m.index || 0);
          if (isCrewOrLabelMention(before, m[1])) continue;
          const cleaned = cleanMovieTitleCandidate(m[1]);
          if (cleaned.length >= 2) {
            return { title: cleaned, year: m[2], candidates: [cleaned] };
          }
        }
      }

      // 4. In the opening paragraph only, check for the first **Bold Movie Title** even if the year is elsewhere in the paragraph
      if (paragraphs.length > 0) {
        const firstPara = paragraphs[0];
        const paraYearMatch = firstPara.match(/\b(19\d\d|20\d\d)\b/);
        for (const m of firstPara.matchAll(/\*\*([^*\n]{2,60}?)\*\*/g)) {
          const before = firstPara.slice(0, m.index || 0);
          if (isCrewOrLabelMention(before, m[1])) continue;
          const cleaned = cleanMovieTitleCandidate(m[1]);
          if (cleaned.length >= 2) {
            return {
              title: cleaned,
              year: paraYearMatch ? paraYearMatch[1] : undefined,
              candidates: [cleaned],
            };
          }
        }
      }
    } else if (entry.role === 'user') {
      const prevUser = extractCandidateTitle(entry.content);
      if (prevUser.title) {
        return {
          title: prevUser.title,
          year: prevUser.year,
          candidates: prevUser.candidates || [prevUser.title],
        };
      }
    }
  }

  return null;
}

/**
 * Proactively queries TMDB's live database and Watchmode API for films (including 2025, 2026, and upcoming projects)
 * mentioned in the user's prompt (or recent conversation history for follow-ups) before passing to Gemini or OpenRouter.
 */
export async function lookupLiveMovieContext(
  prompt: string,
  region: string = 'IN',
  history?: Array<{ role: string; content: string }>
): Promise<LiveMovieLookup | null> {
  const apiKey = getTMDBApiKey();
  if (!apiKey) return null;

  try {
    const isUpcomingQuery = /\b(upcoming|2025|2026|latest release|new movies?|now playing)\b/i.test(prompt);

    const extracted = extractCandidateTitle(prompt);
    let candidateList = extracted.candidates || (extracted.title ? [extracted.title] : []);
    let explicitYear = extracted.year;
    let isFollowUpTurn = false;

    const historySubject = history && history.length > 0 ? extractSubjectFromHistory(history) : null;

    // If the user is asking a follow-up question ("how is it?", "how was it?", "what is its cast?", "where can I watch it?")
    // and no title was found in the current message, resolve the active film from recent conversation history.
    if (candidateList.length === 0 && historySubject) {
      candidateList = historySubject.candidates;
      if (!explicitYear && historySubject.year) {
        explicitYear = historySubject.year;
      }
      isFollowUpTurn = true;
    } else if (candidateList.length > 0 && historySubject) {
      // If the user explicitly repeated the same film title from history in their follow-up (e.g., "what's your opinion on life is beautiful? should I watch it?")
      const normCurrent = candidateList[0].toLowerCase().trim();
      const normHistory = historySubject.title.toLowerCase().trim();
      if (normCurrent === normHistory) {
        if (!explicitYear && historySubject.year) {
          explicitYear = historySubject.year;
        }
        isFollowUpTurn = true;
      }
    }

    if (candidateList.length > 0) {
      const normalizeTitleForMatch = (s: string) =>
        s
          .toLowerCase()
          .replace(/['’":!.,?-]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

      const fetchTmdbSearch = async (queryStr: string, withYear?: string) => {
        const searchUrl = new URL(`${TMDB_API_BASE}/search/movie`);
        searchUrl.searchParams.set('api_key', apiKey);
        searchUrl.searchParams.set('query', queryStr);
        if (withYear) {
          searchUrl.searchParams.set('primary_release_year', withYear);
        }
        const r = await fetch(searchUrl.toString());
        if (!r.ok) return null;
        const d = await r.json();
        const results: any[] = Array.isArray(d.results) ? d.results : [];
        if (results.length === 0) return null;

        const normQuery = normalizeTitleForMatch(queryStr);
        // Prefer exact normalized title matches first (sorted by popularity/vote_count if multiple exact matches exist)
        const exactMatches = results.filter(
          (item) =>
            normalizeTitleForMatch(item.title || '') === normQuery ||
            normalizeTitleForMatch(item.original_title || '') === normQuery
        );
        if (exactMatches.length > 0) {
          exactMatches.sort(
            (a, b) => (b.vote_count || 0) + (b.popularity || 0) * 10 - ((a.vote_count || 0) + (a.popularity || 0) * 10)
          );
          return exactMatches[0];
        }

        // If a year filter was applied, verify the top result actually shares words with the query
        // (avoids returning an unrelated movie from that year when original release year differs by 1 year)
        if (withYear) {
          const topTitleNorm = normalizeTitleForMatch(results[0].title || '');
          if (!topTitleNorm.includes(normQuery) && !normQuery.includes(topTitleNorm)) {
            return null;
          }
        }

        return results[0];
      };

      let top: any = null;
      for (const candidate of candidateList) {
        if (candidate.length < 2) continue;
        top = await fetchTmdbSearch(candidate, explicitYear);
        if (!top && explicitYear) {
          top = await fetchTmdbSearch(candidate, undefined);
        }
        if (!top && /^the\s+/i.test(candidate)) {
          const withoutThe = candidate.replace(/^the\s+/i, '').trim();
          if (withoutThe.length >= 2) {
            top = (await fetchTmdbSearch(withoutThe, explicitYear)) || (await fetchTmdbSearch(withoutThe, undefined));
          }
        }
        if (top) break;
      }

      if (top) {
        const movieId = top.id;

        const detailUrl = new URL(`${TMDB_API_BASE}/movie/${movieId}`);
        detailUrl.searchParams.set('api_key', apiKey);
        detailUrl.searchParams.set('append_to_response', 'credits,watch/providers,reviews');

        const [detailRes, watchmodeData] = await Promise.all([
          fetch(detailUrl.toString()),
          fetchWatchmodeMovieData(movieId, region),
        ]);
        const details = detailRes.ok ? await detailRes.json() : top;

        const releaseDate = details.release_date || top.release_date || 'Upcoming';
        const releaseYear = releaseDate.startsWith('20') || releaseDate.startsWith('19')
          ? parseInt(releaseDate.split('-')[0], 10)
          : (explicitYear ? parseInt(explicitYear, 10) : 2026);

        const posterUrl = details.poster_path ? `${TMDB_IMAGE_BASE}${details.poster_path}` : undefined;
        const genresList = Array.isArray(details.genres) && details.genres.length > 0
          ? details.genres.map((g: any) => g.name)
          : ['Cinema'];
        const genresStr = genresList.join(', ');

        const runtimeMins = details.runtime && details.runtime > 0 ? details.runtime : undefined;
        const runtimeFormatted = runtimeMins
          ? `${runtimeMins} minutes (${Math.floor(runtimeMins / 60)}h ${runtimeMins % 60}m)`
          : 'Not yet listed on TMDB';

        const directors = Array.isArray(details.credits?.crew)
          ? Array.from(
              new Set(
                details.credits.crew
                  .filter((c: any) => c.job === 'Director')
                  .map((c: any) => c.name)
              )
            ).join(', ')
          : '';

        const writers = Array.isArray(details.credits?.crew)
          ? Array.from(
              new Set(
                details.credits.crew
                  .filter((c: any) => ['Writer', 'Screenplay', 'Story'].includes(c.job))
                  .map((c: any) => c.name)
              )
            )
              .slice(0, 4)
              .join(', ')
          : '';

        const castList = Array.isArray(details.credits?.cast)
          ? details.credits.cast
              .slice(0, 10)
              .map((c: any) => (c.character ? `${c.name} (as ${c.character})` : c.name))
              .join(', ')
          : '';

        const countries = Array.isArray(details.production_countries) && details.production_countries.length > 0
          ? details.production_countries.map((c: any) => c.name).join(', ')
          : (Array.isArray(details.origin_country) ? details.origin_country.join(', ') : 'United States');

        const language = (details.original_language || 'en').toUpperCase();

        // Parse watch providers from TMDB and Watchmode for the requested region
        const availabilityList: AvailabilityData[] = [];
        const providersData = details['watch/providers']?.results?.[region.toUpperCase()];
        if (providersData) {
          const nowIso = new Date().toISOString();
          const tmdbWatchUrl = providersData.link || `https://www.themoviedb.org/movie/${movieId}/watch`;

          if (Array.isArray(providersData.flatrate)) {
            for (const p of providersData.flatrate.slice(0, 3)) {
              availabilityList.push({
                provider: p.provider_name,
                region: region.toUpperCase(),
                availability_type: 'flatrate',
                source_url: tmdbWatchUrl,
                checked_timestamp: nowIso,
              });
            }
          }
          if (Array.isArray(providersData.rent)) {
            for (const p of providersData.rent.slice(0, 2)) {
              availabilityList.push({
                provider: p.provider_name,
                region: region.toUpperCase(),
                availability_type: 'rent',
                source_url: tmdbWatchUrl,
                checked_timestamp: nowIso,
              });
            }
          }
        }

        // Merge Watchmode streaming sources if available
        if (watchmodeData?.availability?.length) {
          const existingKeys = new Set(
            availabilityList.map((a) => `${a.provider.toLowerCase()}-${a.availability_type}`)
          );
          for (const wmSource of watchmodeData.availability) {
            const key = `${wmSource.provider.toLowerCase()}-${wmSource.availability_type}`;
            if (!existingKeys.has(key)) {
              availabilityList.push(wmSource);
              existingKeys.add(key);
            }
          }
        }

        const providerSummary = availabilityList.length > 0
          ? availabilityList.map((a) => `${a.provider} (${a.availability_type} in ${a.region})`).join(', ')
          : `No streaming providers currently indexed on TMDB or Watchmode in ${region.toUpperCase()} (check theatrical listings / BookMyShow for release date: ${releaseDate})`;

        const ratings: RatingData[] = [];
        const ratingParts: string[] = [];
        if (details.vote_average && details.vote_count > 0) {
          const scoreVal = Number(details.vote_average.toFixed(1));
          ratings.push({
            source: 'TMDB User Score',
            value: scoreVal,
            scale: '10',
            retrieval_timestamp: new Date().toISOString(),
            source_url: `https://www.themoviedb.org/movie/${movieId}`,
          });
          ratingParts.push(`${scoreVal} / 10 on TMDB (from ${details.vote_count} verified user ratings)`);
        }

        if (watchmodeData?.ratings?.length) {
          ratings.push(...watchmodeData.ratings);
          if (watchmodeData.user_rating) {
            ratingParts.push(`${watchmodeData.user_rating.toFixed(1)} / 10 on Watchmode (User Rating)`);
          }
          if (watchmodeData.critic_score) {
            ratingParts.push(`${Math.round(watchmodeData.critic_score)} / 100 on Watchmode (Critic Score)`);
          }
        }

        const ratingLine =
          ratingParts.length > 0
            ? `${ratingParts.join(' • ')} (retrieved live today)`
            : 'No user or critic ratings recorded yet on TMDB or Watchmode';

        // Extract live TMDB user/critic review snippets for answering "how is it?" / "how was it?" / "is it good?"
        const rawReviews = Array.isArray(details.reviews?.results) ? details.reviews.results : [];
        const reviewSnippets = rawReviews.slice(0, 4).map((rev: any) => {
          const author = rev.author || 'TMDB Reviewer';
          const authorRating = rev.author_details?.rating
            ? ` (Rated ${rev.author_details.rating}/10)`
            : '';
          const cleanExcerpt = String(rev.content || '')
            .replace(/https?:\/\/\S+/g, '')
            .replace(/#{1,6}\s*/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 260);
          return `  • ${author}${authorRating}: "${cleanExcerpt}${cleanExcerpt.length >= 260 ? '...' : ''}"`;
        });

        const reviewsBlock =
          reviewSnippets.length > 0
            ? `- Live Verified TMDB Audience & Critic Reviews (${rawReviews.length} total reviews on TMDB):\n${reviewSnippets.join('\n')}`
            : `- Live Verified TMDB Reviews: No written user reviews posted yet on TMDB; rely on the verified TMDB & Watchmode scores (${ratingLine}) and creative team details.`;

        const followUpDirective = isFollowUpTurn
          ? `\n6. FOLLOW-UP CONTEXT LOCK: The user's message ("${prompt}") is a follow-up question about "${details.title}" (${releaseYear}), which was discussed in the conversation. Stay 100% focused on "${details.title}" (${releaseYear})—NEVER switch to or prioritize another movie (such as secondary similar movies or other projects by ${writers || directors || 'the crew'}). Answer their follow-up directly and warmly using the live TMDB & Watchmode ratings (${ratingLine}), the real TMDB viewer review highlights above, and its regional streaming/theatrical status (${providerSummary}).`
          : '';

        const contextPrompt = `AUTHORITATIVE LIVE TMDB & WATCHMODE API DATA (SERVER-VERIFIED GROUND TRUTH)
The Plotline server just queried the official TMDB v3 API and Watchmode v1 API in real time and verified the following film record:
- Official Title: "${details.title}" (${releaseYear})
- TMDB ID: ${movieId} (https://www.themoviedb.org/movie/${movieId})${watchmodeData?.watchmode_id ? ` • Watchmode ID: ${watchmodeData.watchmode_id}` : ''}
- Official Release Date: ${releaseDate}
- Production / Release Status: ${details.status || 'Confirmed on TMDB'}
- Runtime: ${runtimeFormatted}
- Genres: ${genresStr}
- Original Language: ${language}
- Origin / Production Country: ${countries}
- Verified TMDB & Watchmode Ratings / Reception: ${ratingLine}
${details.tagline ? `- Official Tagline: "${details.tagline}"\n` : ''}- Verified Plot Synopsis (TMDB Overview): "${details.overview || 'Plot synopsis currently under wraps on TMDB.'}"
- Director(s): ${directors || 'Not yet listed on TMDB'}
${writers ? `- Writer(s): ${writers}\n` : ''}- Verified Cast & Characters (TMDB Credits): ${castList || 'Cast list not yet populated on TMDB'}
${reviewsBlock}
- Regional Streaming & Theatrical Availability (${region.toUpperCase()} via TMDB & Watchmode): ${providerSummary}

MANDATORY RESPONSE RULES FOR "${details.title}" (${releaseYear}):
1. In your conversational text response, weave these exact verified TMDB and Watchmode facts—its plot synopsis, release date (${releaseDate}), runtime (${runtimeFormatted}), genres (${genresStr}), director (${directors || 'TBA'}), writers (${writers || 'TBA'}), key cast (${castList || 'TBA'}), live TMDB & Watchmode scores (${ratingLine}), and real audience/critic review takeaways—naturally into 2 to 3 warm, engaging, conversational paragraphs like a friendly movie companion.
2. DO NOT use any hashtags (#, ##, ###) or robotic section headers in your reply. Keep the prose clean, precise, and conversational.
3. NEVER say "I do not have verified information in my records", "I am unable to verify live details", or "there is no verified or official announcement". You HAVE the live verified TMDB & Watchmode records right here!
4. EXCLUSIVE SUBJECT FOCUS: Keep your entire answer focused exclusively on "${details.title}" (${releaseYear}). NEVER claim there is a "mix-up with the titles" and NEVER pivot to or prioritize a different "similar" movie that the user did not ask for unless the user explicitly asks for recommendations of other similar films.
5. Include ONLY "${details.title}" (${releaseYear}) in your \`\`\`plotline_films\`\`\` JSON block (unless the user explicitly asked for similar movies) with "release_year": ${releaseYear}, "runtime_minutes": ${runtimeMins || null}, "genres": ${JSON.stringify(genresList)}, "short_synopsis": ${JSON.stringify(details.overview || '')}, and "confidence_note": "Verified TMDB Live Catalog".${followUpDirective}`;

        const matchedMovie: FilmCardData = {
          title: details.title,
          release_year: releaseYear,
          poster_url: posterUrl,
          short_synopsis: details.overview,
          genres: genresList,
          runtime_minutes: runtimeMins,
          original_language: language,
          origin_country: countries,
          ratings: ratings.length > 0 ? ratings : undefined,
          availability: availabilityList.length > 0 ? availabilityList : undefined,
          tmdb_id: movieId,
          match_reason: `Live verified catalog entry from TMDB & Watchmode (Release date: ${releaseDate}${directors ? ` • Directed by ${directors}` : ''}).`,
          confidence_note: 'Verified TMDB Live Catalog',
        };

        return { contextPrompt, matchedMovie };
      }
    }

    if (isUpcomingQuery) {
      const upcomingUrl = new URL(`${TMDB_API_BASE}/movie/upcoming`);
      upcomingUrl.searchParams.set('api_key', apiKey);
      upcomingUrl.searchParams.set('region', region.toUpperCase());

      const res = await fetch(upcomingUrl.toString());
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const topList = data.results.slice(0, 5).map((m: any) =>
            `- "${m.title}" (Release date: ${m.release_date || 'Upcoming 2025/2026'}): ${m.overview?.slice(0, 160)}...`
          ).join('\n');

          const contextPrompt = `AUTHORITATIVE LIVE TMDB API DATA (SERVER-VERIFIED UPCOMING RELEASES IN ${region.toUpperCase()})
${topList}
Use these verified live TMDB upcoming releases directly in your conversational response without any markdown hashtags (#).`;

          return { contextPrompt };
        }
      }
    }

    return null;
  } catch (err) {
    console.warn('lookupLiveMovieContext warning:', err);
    return null;
  }
}
