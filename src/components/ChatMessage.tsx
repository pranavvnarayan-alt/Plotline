/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Message } from '../types';
import { FilmCard } from './FilmCard';
import { Film, User, Volume2, VolumeX, HelpCircle, AlertCircle, Globe, ExternalLink } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onPlayTTS?: (text: string) => void;
  playingAudioId?: string | null;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onPlayTTS,
  playingAudioId,
}) => {
  const isUser = message.role === 'user';
  const isPlayingThis = playingAudioId === message.id;

  const handleListenClick = () => {
    if (onPlayTTS) {
      onPlayTTS(message.content);
    }
  };

  // Helper to format assistant markdown-like bold and bullet text simply and cleanly
  const renderFormattedText = (text: string) => {
    const paragraphs = text.split('\n\n').filter(Boolean);

    return paragraphs.map((para, pIdx) => {
      // Check if this paragraph is a list of lines
      if (para.includes('\n- ') || para.startsWith('- ') || para.startsWith('* ')) {
        const lines = para.split('\n');
        return (
          <ul key={pIdx} className="list-disc list-inside space-y-1.5 my-2 text-stone-300">
            {lines.map((line, lIdx) => {
              const cleanLine = line.replace(/^[-*]\s*/, '');
              return (
                <li key={lIdx} className="text-sm leading-relaxed">
                  <span dangerouslySetInnerHTML={{ __html: formatInline(cleanLine) }} />
                </li>
              );
            })}
          </ul>
        );
      }

      return (
        <p
          key={pIdx}
          className="text-sm leading-relaxed my-2 text-stone-200"
          dangerouslySetInnerHTML={{ __html: formatInline(para) }}
        />
      );
    });
  };

  const formatInline = (str: string): string => {
    // Escape HTML first for safety
    const safe = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Replace bold **text** with styled strong
    let formatted = safe.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="text-amber-300 font-semibold">$1</strong>'
    );
    // Replace italic *text* with styled em
    formatted = formatted.replace(
      /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g,
      '<em class="italic text-stone-100">$1</em>'
    );
    // Format quote lines
    if (formatted.startsWith('&gt; ')) {
      formatted = `<span class="border-l-2 border-amber-500/60 pl-3 italic text-stone-400 block my-1">${formatted.replace('&gt; ', '')}</span>`;
    }

    return formatted;
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-4 animate-fade-in">
        <div className="max-w-xl flex items-start gap-2.5 flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-stone-800 border border-white/10 flex items-center justify-center shrink-0 text-stone-300">
            <User className="w-4 h-4" />
          </div>
          <div className="rounded-2xl rounded-tr-sm bg-[#1c1f24] border border-white/10 px-4 py-3 text-sm text-stone-100 shadow-md">
            {message.image_preview && (
              <div className="mb-2.5 rounded-lg overflow-hidden border border-white/10 max-w-xs bg-black/50">
                <img
                  src={message.image_preview}
                  alt="Uploaded film clue or poster"
                  className="w-full h-auto max-h-56 object-cover"
                />
                <div className="bg-black/80 px-2.5 py-1.5 flex items-center justify-between gap-2 border-t border-white/10">
                  <span className="text-[10px] text-stone-400 font-mono">
                    Visual Clue
                  </span>
                  <a
                    href="https://lens.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 transition-colors font-medium bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30"
                    title="Open Google Lens in new tab for visual search"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Search Google Lens</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            )}
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            <span className="text-[10px] text-stone-400 block text-right mt-1.5 font-mono">
              {message.timestamp}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 animate-fade-in">
      <div className="flex items-start gap-3">
        {/* Plotline Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shrink-0 text-white shadow-sm border border-amber-400/30">
          <Film className="w-4 h-4 text-amber-100" />
        </div>

        {/* Assistant Content Box */}
        <div className="flex-1 max-w-3xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-ticket text-xs font-semibold tracking-wider text-amber-400 uppercase">
              Plotline
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-stone-400 font-mono">
                {message.timestamp}
              </span>
              {onPlayTTS && (
                <button
                  onClick={handleListenClick}
                  className={`p-1 rounded text-stone-400 hover:text-amber-300 hover:bg-white/5 transition-colors ${
                    isPlayingThis ? 'text-amber-400 animate-pulse' : ''
                  }`}
                  title={isPlayingThis ? 'Playing spoken answer' : 'Listen to Plotline response'}
                  aria-label="Listen to Plotline response"
                >
                  {isPlayingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* Web Reverse Image Matches Banner (if verified by Apify Google Lens actor) */}
          {message.reverse_search_matches && message.reverse_search_matches.length > 0 && (
            <div className="mb-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-300 mb-1 font-mono text-[11px] uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5" />
                <span>Web Reverse Image Matches ({message.reverse_search_engine || 'Google Lens'}):</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {message.reverse_search_matches.slice(0, 5).map((match, mIdx) => (
                  <span
                    key={mIdx}
                    className="inline-flex items-center gap-1 text-[11px] bg-black/50 border border-emerald-500/20 px-2 py-0.5 rounded text-stone-200"
                  >
                    <span>{match.title}</span>
                    {match.sourceUrl && (
                      <a
                        href={match.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-200 ml-0.5"
                        title="View source"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Clarification banner if discriminating question asked */}
          {message.is_clarification && (
            <div className="mb-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-300">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Discriminating Question:</strong> Answer with any detail you remember to narrow the candidates.
              </span>
            </div>
          )}

          {/* Formatted Text Content */}
          <div className="prose prose-invert prose-stone max-w-none">
            {renderFormattedText(message.content)}
          </div>

          {/* Film Result Cards (if present) */}
          {message.films && message.films.length > 0 && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                  Recommended Matches ({message.films.length})
                </span>
                <span className="text-[11px] text-stone-400 font-mono">
                  Sourced via TMDB & Gemini 3.8
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {message.films.map((film, idx) => (
                  <FilmCard
                    key={`${film.title}-${idx}`}
                    film={film}
                    onPlayTTS={onPlayTTS}
                    isPlayingAudio={playingAudioId === `${message.id}-film-${idx}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Optional source or error note */}
          {message.source_note && (
            <div className="mt-3 text-[11px] text-stone-400 font-mono border-t border-white/5 pt-2 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 text-stone-400" />
              <span>{message.source_note}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
