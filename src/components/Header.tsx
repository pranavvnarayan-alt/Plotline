/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Film, Sliders, ShieldCheck, Trash2, Sparkles, Compass, Search } from 'lucide-react';
import { PersonaStyle } from '../types';

interface HeaderProps {
  activePersona: PersonaStyle;
  onPersonaChange: (persona: PersonaStyle) => void;
  onOpenSettings: () => void;
  onOpenDevTest: () => void;
  onClearChat: () => void;
  messageCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activePersona,
  onPersonaChange,
  onOpenSettings,
  onOpenDevTest,
  onClearChat,
  messageCount,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#0c0d0e]/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-950/40 border border-amber-400/30">
            <Film className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-ticket text-sm font-semibold tracking-widest text-amber-400 uppercase">
                PLOTLINE
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-stone-300">
                Beta
              </span>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block">
              Conversational movie discovery companion
            </p>
          </div>
        </div>

        {/* Persona Selector (Presentation only, per system prompt rules) */}
        <div
          role="radiogroup"
          aria-label="Agent persona style"
          className="hidden md:flex items-center bg-[#181a1c] p-1 rounded-lg border border-white/10 text-xs"
        >
          <button
            role="radio"
            aria-checked={activePersona === 'companion'}
            onClick={() => onPersonaChange('companion')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              activePersona === 'companion'
                ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Warm, natural and welcoming conversational guide"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Companion</span>
          </button>
          <button
            role="radio"
            aria-checked={activePersona === 'detective'}
            onClick={() => onPersonaChange('detective')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              activePersona === 'detective'
                ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Deductive, clue-driven film investigator for forgotten movies"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Detective</span>
          </button>
          <button
            role="radio"
            aria-checked={activePersona === 'cinephile'}
            onClick={() => onPersonaChange('cinephile')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              activePersona === 'cinephile'
                ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Curated, international, and independent film enthusiast"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Cinephile</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {messageCount > 0 && (
            <button
              onClick={onClearChat}
              className="px-2.5 py-1.5 text-xs text-stone-400 hover:text-red-300 hover:bg-red-950/30 rounded-md border border-transparent hover:border-red-900/40 transition-colors flex items-center gap-1"
              title="Clear current session messages"
              aria-label="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

          <button
            onClick={onOpenDevTest}
            className="px-2.5 py-1.5 text-xs text-stone-300 hover:text-amber-300 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 transition-colors flex items-center gap-1.5"
            title="Developer Diagnostics & 06_TEST Scenarios"
            aria-label="Developer diagnostics and tests"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-[11px] hidden sm:inline">Lab & Specs</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-md border border-white/10 transition-colors"
            title="Preferences & Privacy Settings"
            aria-label="Open settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
