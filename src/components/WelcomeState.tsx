/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Film, Search, Globe, Ticket, Clock, CheckCircle2 } from 'lucide-react';

interface WelcomeStateProps {
  onSelectStarter: (prompt: string) => void;
}

export const WelcomeState: React.FC<WelcomeStateProps> = ({ onSelectStarter }) => {
  const starters = [
    {
      title: 'Find a film for my mood',
      description: 'Under 2 hours, thoughtful but not depressing, with a grounded social theme.',
      prompt: 'I want a thoughtful film under 120 minutes, not too bleak, with a grounded social theme.',
      icon: Clock,
      badge: 'Mood & Time',
    },
    {
      title: 'Help me identify a film',
      description: 'Remember a scene, actor detail, or plot premise from a forgotten movie.',
      prompt: 'Can you help me identify a movie? A man keeps reliving the exact same day in a small town.',
      icon: Search,
      badge: 'Detective',
    },
    {
      title: 'Explore Indian & World Cinema',
      description: 'Discover acclaimed Malayalam, Tamil, Hindi, Bengali, or international gems.',
      prompt: 'Recommend 3 acclaimed films exploring themes of identity and homecoming across Indian regional or international cinema.',
      icon: Globe,
      badge: 'Cinephile',
    },
    {
      title: 'Where can I watch in India?',
      description: 'Check verified Indian OTT (Hotstar, JioCinema, Prime, Netflix) or BookMyShow showtimes.',
      prompt: 'Where can I watch Aavesham or 12th Fail in India right now? Please check verified streaming platforms.',
      icon: Ticket,
      badge: 'India OTT & Theatres',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 text-center">
      {/* Visual Ticket Motif */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-widest mb-4">
        <Film className="w-3.5 h-3.5" />
        <span>CINEMATIC DISCOVERY COMPANION &bull; INDIA (IN)</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-serif text-stone-100 tracking-tight mb-3">
        Cinema discovered through conversation.
      </h1>

      <p className="text-sm sm:text-base text-stone-300 max-w-lg mx-auto leading-relaxed mb-8">
        Plotline helps you uncover forgotten films, discover Indian and global cinema tailored to your mood and language, and find where to watch across Indian OTT platforms and local cinemas via BookMyShow.
      </p>

      {/* Suggested Starter Prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-8">
        {starters.map((starter) => {
          const Icon = starter.icon;
          return (
            <button
              key={starter.title}
              onClick={() => onSelectStarter(starter.prompt)}
              className="group p-4 rounded-xl bg-[#141517] hover:bg-[#1b1d20] border border-white/5 hover:border-amber-500/30 transition-all text-left flex flex-col justify-between shadow-sm hover:shadow-md hover:shadow-black/40"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-stone-300 group-hover:text-amber-300 group-hover:bg-amber-500/10 transition-colors">
                    {starter.badge}
                  </span>
                  <Icon className="w-4 h-4 text-stone-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <h2 className="text-sm font-medium text-stone-200 group-hover:text-white transition-colors">
                  {starter.title}
                </h2>
                <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                  {starter.description}
                </p>
              </div>
              <span className="text-[11px] text-amber-500/80 font-medium mt-3 flex items-center gap-1 group-hover:text-amber-400">
                Ask Plotline &rarr;
              </span>
            </button>
          );
        })}
      </div>

      {/* Guarantees per Tech Spec */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-6 border-t border-white/5 text-left text-xs text-stone-400">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-stone-300 block">India OTT & Theatres:</strong> Verifies Hotstar, JioCinema, Prime, Netflix & links to BookMyShow without fake prices.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-stone-300 block">Deductive Detective:</strong> Asks discriminating questions when plot memories are incomplete.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-stone-300 block">Privacy By Default:</strong> Memory is strictly off until you opt in. No sensitive tracking.
          </span>
        </div>
      </div>
    </div>
  );
};
