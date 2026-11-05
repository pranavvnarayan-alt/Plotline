/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUpRight, PenTool } from 'lucide-react';
import { PersonaStyle } from '../types';
import { PlotlineLogo } from './PlotlineLogo';

interface WelcomeStateProps {
  onSelectStarter: (prompt: string) => void;
  activePersona?: PersonaStyle;
  onPersonaChange?: (persona: PersonaStyle) => void;
}

export const WelcomeState: React.FC<WelcomeStateProps> = ({
  onSelectStarter,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-2 sm:py-3">
      {/* Top Editorial Header Row */}
      <div className="mb-3">
        <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-black dark:text-white">
          Cinema Guide
        </h2>
      </div>

      {/* Concise Editorial Lead Paragraph */}
      <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 max-w-xl leading-relaxed mb-5 sm:mb-6 font-normal">
        We emphasized conversational discovery with live verified catalog records and clear, readable Geist typography.
        Uncover forgotten films, check real audience reviews, and navigate Indian OTT &amp; theatrical listings with ease.
      </p>

      {/* Giant Display Wordmark + Tilted Dual-Badge Pill Motif with the Plotline Logo */}
      <div className="relative inline-flex items-center mb-6 sm:mb-7 select-none">
        <h1 className="text-6xl sm:text-7xl md:text-[5.75rem] font-semibold tracking-tighter leading-none text-black dark:text-white">
          Plotline
        </h1>

        {/* Signature Tilted Pill Widget (Electric Lime Plotline Logo + >> + Lavender Pink) */}
        <div
          className="inline-flex items-center justify-between gap-2.5 sm:gap-3.5 bg-[#222326] text-white px-2 sm:px-2.5 py-1.5 rounded-full shadow-2xl border border-white/10 -ml-4 sm:-ml-6 mt-3 sm:mt-4 -rotate-[24deg] hover:rotate-0 transition-transform duration-200 cursor-pointer"
          onClick={() =>
            onSelectStarter(
              'Recommend 3 acclaimed films under 120 minutes with a grounded social theme and tell me where to stream them in India.'
            )
          }
          title="Start discovering cinema"
        >
          <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#E7FE55] text-black flex items-center justify-center shadow-inner">
            <PlotlineLogo className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
          <span className="font-mono text-xs sm:text-sm tracking-tighter text-white/90 px-0.5">
            &gt;&gt;
          </span>
          <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#F8D4FE] text-black flex items-center justify-center shadow-inner">
            <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
          </span>
        </div>
      </div>

      {/* 5-Card Interlocking Bento Grid matching the Style Guide Swatch Layout */}
      <div className="space-y-3">
        {/* Top Row: Electric Lime (#E7FE55, Wide) + Lavender Pink (#F8D4FE) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Card 1: Electric Lime (#E7FE55) */}
          <button
            type="button"
            onClick={() =>
              onSelectStarter(
                'I want a thoughtful film under 120 minutes, not too bleak, with a grounded social theme.'
              )
            }
            className="md:col-span-7 group rounded-[26px] bg-[#E7FE55] text-[#000000] p-5 sm:p-6 min-h-[156px] sm:min-h-[168px] flex flex-col justify-between text-left transition-transform duration-200 hover:-translate-y-0.5 shadow-sm border border-black/5"
          >
            <div className="w-full flex items-start justify-between gap-4">
              <div>
                <span className="text-lg sm:text-xl font-medium tracking-tight block text-black">
                  Find a Film for My Mood
                </span>
                <p className="text-xs sm:text-sm text-black/75 mt-1 max-w-md leading-relaxed font-normal">
                  Under 2 hours, thoughtful but not depressing, tailored to your preferred pace and tone.
                </p>
              </div>
              <ArrowUpRight className="w-6 h-6 text-black shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 stroke-[1.75]" />
            </div>

            <div className="w-full flex items-center justify-between gap-2 text-[11px] font-mono text-black/80 pt-4 whitespace-nowrap">
              <span>Discovery Mode</span>
              <span className="font-medium">MOOD &amp; PACE</span>
            </div>
          </button>

          {/* Card 2: Lavender Pink (#F8D4FE) */}
          <button
            type="button"
            onClick={() =>
              onSelectStarter(
                'Can you help me identify a movie? A man keeps reliving the exact same day in a small town.'
              )
            }
            className="md:col-span-5 group rounded-[26px] bg-[#F8D4FE] text-[#000000] p-5 sm:p-6 min-h-[156px] sm:min-h-[168px] flex flex-col justify-between text-left transition-transform duration-200 hover:-translate-y-0.5 shadow-sm border border-black/5"
          >
            <div className="w-full flex items-start justify-between gap-4">
              <div>
                <span className="text-lg sm:text-xl font-medium tracking-tight block text-black">
                  Identify a Forgotten Film
                </span>
                <p className="text-xs sm:text-sm text-black/75 mt-1 leading-relaxed font-normal">
                  Trace a half-remembered scene, character clue, or poster image.
                </p>
              </div>
              <ArrowUpRight className="w-6 h-6 text-black shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 stroke-[1.75]" />
            </div>

            <div className="w-full flex items-center justify-between gap-2 text-[11px] font-mono text-black/80 pt-4 whitespace-nowrap">
              <span>Detective Mode</span>
              <span className="font-medium">CLUE MATCH</span>
            </div>
          </button>
        </div>

        {/* Bottom Row: Pearl White (#F2F4FE) + Black (#000000) + White (#FFFFFF) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 3: Pearl White (#F2F4FE) */}
          <button
            type="button"
            onClick={() =>
              onSelectStarter(
                'Recommend 3 acclaimed films exploring themes of identity and homecoming across Indian regional or international cinema.'
              )
            }
            className="group rounded-[26px] bg-[#F2F4FE] text-[#000000] p-5 min-h-[148px] sm:min-h-[156px] flex flex-col justify-between text-left transition-transform duration-200 hover:-translate-y-0.5 border border-black/15 dark:border-white/10 shadow-xs"
          >
            <div className="w-full flex items-start justify-between gap-3">
              <div>
                <span className="text-base sm:text-lg font-medium tracking-tight block text-black">
                  Indian &amp; World Cinema
                </span>
                <p className="text-xs text-black/70 mt-1 leading-relaxed">
                  Malayalam, Tamil, Hindi, Bengali &amp; global festival gems.
                </p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-black shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 stroke-[1.75]" />
            </div>

            <div className="w-full flex items-center justify-between gap-2 text-[11px] font-mono text-black/75 pt-4 whitespace-nowrap">
              <span>Curated Scope</span>
            </div>
          </button>

          {/* Card 4: Black (#000000) */}
          <button
            type="button"
            onClick={() =>
              onSelectStarter(
                'Where can I watch Aavesham or 12th Fail in India right now? Please check verified streaming platforms.'
              )
            }
            className="group rounded-[26px] bg-[#000000] text-[#FFFFFF] p-5 min-h-[148px] sm:min-h-[156px] flex flex-col justify-between text-left transition-transform duration-200 hover:-translate-y-0.5 border border-black/20 dark:border-white/20 shadow-xs"
          >
            <div className="w-full flex items-start justify-between gap-3">
              <div>
                <span className="text-base sm:text-lg font-medium tracking-tight block text-white">
                  Where to Watch in India
                </span>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  Verified JioCinema, Hotstar, Prime, Netflix &amp; BookMyShow links.
                </p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-white shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 stroke-[1.75]" />
            </div>

            <div className="w-full flex items-center justify-between gap-2 text-[11px] font-mono text-white/75 pt-4 whitespace-nowrap">
              <span>Watchmode &amp; OTT</span>
            </div>
          </button>

          {/* Card 5: White (#FFFFFF) */}
          <button
            type="button"
            onClick={() =>
              onSelectStarter(
                'Can you tell me about the new Clayface (2026) movie and how its reception looks on TMDB?'
              )
            }
            className="group rounded-[26px] bg-[#FFFFFF] text-[#000000] p-5 min-h-[148px] sm:min-h-[156px] flex flex-col justify-between text-left transition-transform duration-200 hover:-translate-y-0.5 border border-black/10 shadow-xs"
          >
            <div className="w-full flex items-start justify-between gap-3">
              <div>
                <span className="text-base sm:text-lg font-medium tracking-tight block text-black">
                  2025–2026 Live Catalog
                </span>
                <p className="text-xs text-black/70 mt-1 leading-relaxed">
                  Real-time TMDB &amp; Watchmode lookup for new and upcoming releases.
                </p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-black shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 stroke-[1.75]" />
            </div>

            <div className="w-full flex items-center justify-between gap-2 text-[11px] font-mono text-black/75 pt-4 whitespace-nowrap">
              <span>Live Verification</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

