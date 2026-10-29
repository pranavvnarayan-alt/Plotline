/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FilmCardData } from '../types';
import { formatRuntime } from '../utils/filmValidation';
import {
  Film,
  Clock,
  Globe2,
  Sparkles,
  ExternalLink,
  Volume2,
  VolumeX,
  AlertCircle,
  Tv,
  CheckCircle,
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

  return (
    <div className="group relative rounded-xl bg-[#141518] border border-white/10 hover:border-amber-500/40 transition-all duration-200 overflow-hidden shadow-lg shadow-black/50 flex flex-col md:flex-row">
      {/* Poster Image / Fallback Container */}
      <div className="relative w-full md:w-44 h-56 md:h-auto shrink-0 bg-[#0d0e10] overflow-hidden flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
        {film.poster_url && !imageFailed ? (
          <img
            src={film.poster_url}
            alt={`Official poster for ${film.title}`}
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="p-4 text-center flex flex-col items-center justify-center h-full">
            <Film className="w-8 h-8 text-amber-500/50 mb-2" />
            <span className="text-xs font-serif font-semibold text-stone-300 line-clamp-2 px-2">
              {film.title}
            </span>
            <span className="text-[10px] text-stone-400 mt-1">
              {film.release_year || 'Classic Cinema'}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-amber-400/80 mt-2 bg-amber-500/10 px-2 py-0.5 rounded">
              Verified Title
            </span>
          </div>
        )}

        {/* Confidence or Era Badge */}
        {film.confidence_note && (
          <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 border border-amber-500/30">
            {film.confidence_note}
          </div>
        )}
      </div>

      {/* Film Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row: Title, Year, Runtime, Language */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight">
                  {film.title}
                </h3>
                {film.release_year && (
                  <span className="text-xs font-mono text-stone-400">
                    ({film.release_year})
                  </span>
                )}
              </div>

              {/* Badges: Runtime, Country/Language */}
              <div className="flex items-center gap-2.5 mt-1.5 flex-wrap text-xs text-stone-400">
                {film.runtime_minutes && film.runtime_minutes > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-white/5 px-2 py-0.5 rounded text-stone-300 border border-white/5">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {formatRuntime(film.runtime_minutes)}
                  </span>
                ) : null}

                {(film.original_language || film.origin_country) && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-white/5 px-2 py-0.5 rounded text-stone-300 border border-white/5">
                    <Globe2 className="w-3 h-3 text-stone-400" />
                    {[film.original_language, film.origin_country].filter(Boolean).join(' • ')}
                  </span>
                )}

                {/* Genre chips */}
                {film.genres && film.genres.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {film.genres.slice(0, 3).map((genre) => (
                      <span
                        key={genre}
                        className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Audio Listen Button */}
            {onPlayTTS && (
              <button
                onClick={handleListenClick}
                className={`p-2 rounded-lg border transition-all ${
                  isPlayingAudio
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                    : 'bg-white/5 border-white/10 text-stone-400 hover:text-amber-300 hover:bg-white/10'
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
            <p className="text-xs text-stone-300 leading-relaxed mb-3 line-clamp-3">
              {film.short_synopsis}
            </p>
          )}

          {/* Match Reason Quote Box */}
          {film.match_reason && (
            <div className="mb-3.5 p-2.5 rounded-lg bg-amber-500/5 border-l-2 border-amber-500 text-xs text-stone-300 leading-relaxed flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-300 font-medium mr-1">Why it fits:</strong>
                {film.match_reason}
              </span>
            </div>
          )}

          {/* Ratings with verifiable scale */}
          {film.ratings && film.ratings.length > 0 && (
            <div className="flex items-center gap-3 mb-3 text-xs">
              {film.ratings.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-stone-300 bg-white/5 px-2.5 py-1 rounded-md border border-white/5"
                >
                  <span className="text-[11px] text-stone-400">{r.source}:</span>
                  <span className="font-mono font-bold text-amber-300">{r.value}</span>
                  <span className="text-[10px] text-stone-500">/{r.scale}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Where to watch & navigation links */}
        <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          {/* Availability details */}
          <div>
            {hasWatchData ? (
              <div className="flex items-center gap-1.5 text-stone-300">
                <Tv className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium text-stone-200">Watch on:</span>
                <span className="text-amber-200 font-medium">
                  {film.availability!.map((a) => a.provider).join(', ')}
                </span>
                <span className="text-[10px] text-stone-500">
                  ({film.availability![0].region})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>Live availability varies by territory. Check official listings:</span>
              </div>
            )}
          </div>

          {/* Sourced links (External navigation only, no transactions) */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={bookMyShowUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] bg-amber-500/10 text-amber-300 hover:text-amber-200 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 font-medium transition-colors"
              title="Search BookMyShow for Indian theatrical showtimes in your city"
            >
              <span>BookMyShow (Theatres)</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            <a
              href={film.availability?.[0]?.source_url || tmdbSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-stone-300 hover:text-white font-medium transition-colors"
            >
              <span>{hasWatchData ? 'OTT Providers' : 'TMDB Watch'}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            <span className="text-stone-700 hidden sm:inline">•</span>

            <a
              href={indiaOttSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-200 transition-colors"
              title="Search OTT streaming options in India"
            >
              <span>Stream in India</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
