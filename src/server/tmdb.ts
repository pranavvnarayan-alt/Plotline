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
 * Searches TMDB for a film by title and optional year to retrieve verified metadata.
 * Complies strictly with TMDB terms: requires attribution, no scraping, graceful degradation.
 */
export async function searchTMDBMovie(
  title: string,
  year?: number | string,
  region: string = 'IN'
): Promise<TMDBEnrichedData | null> {
  const apiKey = process.env.TMDB_API_KEY;
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

    // Fetch detailed movie info for runtime and genres
    const detailUrl = new URL(`${TMDB_API_BASE}/movie/${movieId}`);
    detailUrl.searchParams.set('api_key', apiKey);
    detailUrl.searchParams.set('append_to_response', 'watch/providers');

    const detailRes = await fetch(detailUrl.toString());
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
          }
        ] : undefined,
        source_attribution: 'Data provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.',
      };
    }

    const details = await detailRes.json();
    const releaseYear = details.release_date ? parseInt(details.release_date.split('-')[0], 10) : undefined;
    const runtime = details.runtime && details.runtime > 0 ? details.runtime : undefined;
    const genres = Array.isArray(details.genres) ? details.genres.map((g: { name: string }) => g.name) : undefined;

    const ratings: RatingData[] = [];
    if (details.vote_average && details.vote_count > 10) {
      ratings.push({
        source: 'TMDB User Score',
        value: Number(details.vote_average.toFixed(1)),
        scale: '10',
        retrieval_timestamp: new Date().toISOString(),
        source_url: `https://www.themoviedb.org/movie/${movieId}`,
      });
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

    return {
      poster_url: details.poster_path ? `${TMDB_IMAGE_BASE}${details.poster_path}` : undefined,
      tmdb_id: movieId,
      release_year: releaseYear,
      runtime_minutes: runtime,
      genres,
      ratings: ratings.length > 0 ? ratings : undefined,
      availability: availabilityList.length > 0 ? availabilityList : undefined,
      source_attribution: 'Data & images provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.',
    };
  } catch {
    return null;
  }
}

/**
 * Fetches notable films released after January 2025 directly from TMDB's live discover endpoint.
 */
export async function discover2025Films(region: string = 'IN'): Promise<FilmCardData[]> {
  const apiKey = process.env.TMDB_API_KEY;
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
