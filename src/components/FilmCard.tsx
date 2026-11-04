/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FilmCardData } from '../types';
import { formatRuntime } from '../utils/filmValidation';
import {
  Film,
  ArrowUpRight,
  Volume2,
  VolumeX,
  AlertCircle,
  Tv,
} from 'lucide-react';

interface FilmCardProps {
  film: FilmCardData;
  onPlayTTS?: (text: string) => void;
  isPlayingAudio?: boolean;
}

export const FilmCard: React.FC<FilmCardProps> = ({
  film,
  onPlayTTS,
  isPlayingAudio = false,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const handleListenClick = () => {
    if (onPlayTTS) {
      const speechSummary = `${film.title}, ${film.release_year || ''}. ${film.short_synopsis || ''}. Why it fits: ${film.match_reason || ''}`;
      onPlayTTS(speechSummary);
    }
  };

  const hasWatchData = film.availability && film.availability.length > 0;
  const tmdbSearchUrl = `https://www.themoviedb.org/search?query=${encodeURIComponent(film.title)}`;
  const bookMyShowUrl = `https://in.bookmyshow.com/search?q=${encodeURIComponent(film.title)}`;
  const indiaOttSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${film.title} ${film.release_year || ''} movie watch online india ott`)}`;

  // Assemble clean unboxed metadata items
  const metaParts: string[] = [];
  if (film.runtime_minutes && film.runtime_minutes > 0) {
    metaParts.push(formatRuntime(film.runtime_minutes));
  }
  if (film.original_language || film.origin_country) {
    metaParts.push([film.original_language, film.origin_country].filter(Boolean).join(' / '));
  }
  if (film.genres && film.genres.length > 0) {
    metaParts.push(film.genres.slice(0, 3).join(', '));
  }
  if (film.confidence_note) {
    metaParts.push(film.confidence_note);
  }

  return (
    <div className="group relative rounded-[24px] bg-[#F2F4FE] dark:bg-[#131418] border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-[#E7FE55]/50 transition-all duration-200 overflow-hidden flex flex-col md:flex-row">
      {/* Poster Image / Fallback Container */}
      <div className="relative w-full md:w-44 h-56 md:h-auto shrink-0 bg-black overflow-hidden flex items-center justify-center border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10">
        {film.poster_url && !imageFailed ? (
          <img
            src={film.poster_url}
            alt={`Official poster for ${film.title}`}
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="p-4 text-center flex flex-col items-center justify-center h-full bg-[#141519] text-white">
            <div className="w-10 h-10 rounded-full bg-[#E7FE55] text-black flex items-center justify-center mb-2.5">
              <Film className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white line-clamp-2 px-2">
              {film.title}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 mt-1 tabular-nums">
              {film.release_year || 'Verified Film'}
            </span>
          </div>
        )}
      </div>

      {/* Film Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row: Title, Year, Clean Unboxed Metadata */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-black dark:text-white tracking-tight">
                  {film.title}
                </h3>
                {film.release_year && (
                  <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 tabular-nums">
                    ({film.release_year})
                  </span>
                )}
              </div>

              {/* Unboxed Metadata Line with · separators */}
              {metaParts.length > 0 && (
                <div className="flex items-center gap-2 mt-1 flex-wrap text-xs font-mono text-neutral-600 dark:text-neutral-400">
                  {metaParts.map((part, idx) => (
                    <React.Fragment key={idx}>
                      <span>{part}</span>
                      {idx < metaParts.length - 1 && (
                        <span aria-hidden="true" className="text-neutral-400 dark:text-neutral-600">
                          &middot;
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Audio Listen Button */}
            {onPlayTTS && (
              <button
                onClick={handleListenClick}
                className={`p-2 rounded-full border transition-all shrink-0 ${
                  isPlayingAudio
                    ? 'bg-[#E7FE55] border-black/20 text-black'
                    : 'bg-white dark:bg-white/5 border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-[#E7FE55] hover:text-black dark:hover:bg-[#E7FE55] dark:hover:text-black'
                }`}
                title={isPlayingAudio ? 'Playing recommendation audio' : 'Listen to film match readout'}
                aria-label={`Listen to match description for ${film.title}`}
              >
                {isPlayingAudio ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Synopsis */}
          {film.short_synopsis && (
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3.5 line-clamp-3">
              {film.short_synopsis}
            </p>
          )}

          {/* Match Reason Box (No thick left border; clean Lavender/Surface tint) */}
          {film.match_reason && (
            <div className="mb-3.5 p-3 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
              <strong className="text-black dark:text-[#E7FE55] font-semibold mr-1.5">
                Why it fits:
              </strong>
              <span>{film.match_reason}</span>
            </div>
          )}

          {/* Ratings with verifiable scale & tabular numerals */}
          {film.ratings && film.ratings.length > 0 && (
            <div className="flex items-center gap-3 mb-3 text-xs font-mono tabular-nums flex-wrap">
              {film.ratings.map((r, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                    <span className="text-neutral-500 dark:text-neutral-400">{r.source}:</span>
                    <span className="font-bold text-black dark:text-[#E7FE55]">{r.value}</span>
                    <span className="text-neutral-400 dark:text-neutral-500">/{r.scale}</span>
                  </div>
                  {i < film.ratings!.length - 1 && (
                    <span aria-hidden="true" className="text-neutral-400 dark:text-neutral-600">
                      &middot;
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Where to watch & navigation links */}
        <div className="pt-3 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          {/* Availability details */}
          <div>
            {hasWatchData ? (
              <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                <Tv className="w-3.5 h-3.5 text-black dark:text-[#E7FE55]" />
                <span className="font-medium">Watch on:</span>
                <span className="font-semibold text-black dark:text-[#E7FE55]">
                  {film.availability!.map((a) => a.provider).join(', ')}
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  ({film.availability![0].region})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Live availability varies by territory. Check official listings:</span>
              </div>
            )}
          </div>

          {/* Sourced links */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <a
              href={bookMyShowUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] bg-[#E7FE55] text-black hover:opacity-90 px-3 py-1 rounded-full font-semibold transition-opacity whitespace-nowrap shrink-0"
              title="Search BookMyShow for Indian theatrical showtimes in your city"
            >
              <span>BookMyShow</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>

            <a
              href={film.availability?.[0]?.source_url || tmdbSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] bg-[#F8D4FE] text-black hover:opacity-90 px-3 py-1 rounded-full font-medium transition-opacity whitespace-nowrap shrink-0"
            >
              <span>{hasWatchData ? 'OTT Providers' : 'TMDB Watch'}</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>

            <a
              href={indiaOttSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              title="Search OTT streaming options in India"
            >
              <span>Stream in India</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

