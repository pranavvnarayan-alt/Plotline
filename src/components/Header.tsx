/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sliders, ShieldCheck, Plus, Sun, Moon, Menu } from 'lucide-react';
import { PersonaStyle } from '../types';
import { PlotlineLogo } from './PlotlineLogo';

interface HeaderProps {
  activePersona: PersonaStyle;
  onPersonaChange: (persona: PersonaStyle) => void;
  onOpenSettings: () => void;
  onOpenDevTest: () => void;
  onNewChat: () => void;
  onGoHome: () => void;
  onOpenChatLibrary: () => void;
  savedChatCount: number;
  messageCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePersona,
  onPersonaChange,
  onOpenSettings,
  onOpenDevTest,
  onNewChat,
  onGoHome,
  onOpenChatLibrary,
  savedChatCount,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#F2F4FE]/90 dark:bg-[#000000]/90 backdrop-blur-md border-b border-black/10 dark:border-white/10 px-4 sm:px-6 py-3.5 transition-colors duration-200">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Hamburger Menu (Chat Library) + Clickable Brand Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenChatLibrary}
            className="relative p-2 rounded-xl bg-white dark:bg-[#141518] text-black dark:text-white hover:bg-[#E7FE55] dark:hover:bg-[#E7FE55] hover:text-black dark:hover:text-black border border-black/15 dark:border-white/15 transition-colors cursor-pointer shrink-0"
            title="Open Chat Library"
            aria-label="Open Chat Library"
          >
            <Menu className="w-4 h-4" />
            {savedChatCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#F8D4FE] text-black font-mono text-[10px] font-semibold flex items-center justify-center border border-black/20">
                {savedChatCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onGoHome}
            className="group flex items-center gap-3 text-left cursor-pointer focus:outline-none"
            title="Go to Plotline Homepage"
            aria-label="Go to Plotline Homepage"
          >
            <div className="w-9 h-9 rounded-xl bg-[#000000] dark:bg-[#E7FE55] text-[#E7FE55] dark:text-[#000000] flex items-center justify-center border border-black/15 dark:border-white/15 shadow-xs transition-transform duration-150 group-hover:scale-105">
              <PlotlineLogo className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none text-black dark:text-white whitespace-nowrap group-hover:opacity-80 transition-opacity">
                Plotline
              </span>
              <span className="text-[9px] font-sans font-medium uppercase tracking-widest text-neutral-500 dark:text-[#F8D4FE] mt-0.5">
                Cinema Companion
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Persona Selector */}
        <div
          role="radiogroup"
          aria-label="Agent persona style"
          className="hidden md:flex items-center bg-white dark:bg-[#111215] p-1 rounded-full border border-black/10 dark:border-white/10 text-xs"
        >
          {(['companion', 'detective', 'cinephile'] as PersonaStyle[]).map((persona) => {
            const isActive = activePersona === persona;
            const label =
              persona === 'companion'
                ? 'Companion'
                : persona === 'detective'
                ? 'Detective'
                : 'Cinephile';
            return (
              <button
                key={persona}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onPersonaChange(persona)}
                className={`px-3.5 py-1 rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#E7FE55] text-black font-semibold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white font-normal'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Zone 3: New Chat (+), Theme Toggle & Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onNewChat}
            className="px-3 py-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-[#141518] hover:bg-[#E7FE55] dark:hover:bg-[#E7FE55] hover:text-black dark:hover:text-black rounded-full border border-black/15 dark:border-white/15 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            title="Start a new chat"
            aria-label="New Chat"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* Light / Dark Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="group px-3 py-1.5 text-xs font-medium rounded-full border border-black/15 dark:border-white/15 bg-white dark:bg-[#141518] text-black dark:text-white hover:bg-[#E7FE55] dark:hover:bg-[#E7FE55] hover:text-black dark:hover:text-black transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#E7FE55] group-hover:text-black transition-colors" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-black" />
                <span>Dark</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenDevTest}
            className="px-3 py-1.5 text-xs font-medium text-black dark:text-black bg-[#F8D4FE] hover:opacity-90 rounded-full transition-opacity flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            title="Developer Diagnostics & 06_TEST Scenarios"
            aria-label="Developer diagnostics and tests"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">Lab &amp; Specs</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 text-black dark:text-white bg-white dark:bg-[#141518] hover:bg-[#E7FE55] dark:hover:bg-[#E7FE55] dark:hover:text-black rounded-full border border-black/15 dark:border-white/15 transition-colors shrink-0 cursor-pointer"
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

