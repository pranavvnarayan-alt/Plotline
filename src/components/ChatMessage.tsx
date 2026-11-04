/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Message } from '../types';
import { FilmCard } from './FilmCard';
import { PlotlineLogo } from './PlotlineLogo';
import { User, Volume2, VolumeX, HelpCircle, AlertCircle, Globe, ExternalLink } from 'lucide-react';

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

  // Helper to format assistant markdown-like bold and bullet text simply and cleanly without raw hashtags
  const renderFormattedText = (text: string) => {
    const cleanedText = text
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/(?<=\n|\s)#{1,6}\s+/g, '');

    const paragraphs = cleanedText.split('\n\n').filter(Boolean);

    return paragraphs.map((para, pIdx) => {
      const lines = para
        .split('\n')
        .map((l) => l.replace(/^#{1,6}\s+/, '').trim())
        .filter(Boolean);

      // Check if this paragraph contains bullet lines
      const hasBullets = lines.some((l) => /^[-*•]\s+/.test(l));
      if (hasBullets) {
        const introLines = lines.filter((l) => !/^[-*•]\s+/.test(l));
        const bulletLines = lines.filter((l) => /^[-*•]\s+/.test(l));

        return (
          <div key={pIdx} className="my-3 space-y-2">
            {introLines.map((intro, iIdx) => (
              <p
                key={`intro-${iIdx}`}
                className="text-sm sm:text-[15px] leading-relaxed text-neutral-900 dark:text-neutral-100"
                dangerouslySetInnerHTML={{ __html: formatInline(intro) }}
              />
            ))}
            <ul className="list-disc list-inside space-y-1.5 text-neutral-800 dark:text-neutral-200">
              {bulletLines.map((line, lIdx) => {
                const cleanLine = line.replace(/^[-*•]\s*/, '');
                return (
                  <li key={lIdx} className="text-sm sm:text-[15px] leading-relaxed">
                    <span dangerouslySetInnerHTML={{ __html: formatInline(cleanLine) }} />
                  </li>
                );
              })}
            </ul>
          </div>
        );
      }

      return (
        <p
          key={pIdx}
          className="text-sm sm:text-[15px] leading-relaxed my-3 text-neutral-900 dark:text-neutral-100"
          dangerouslySetInnerHTML={{ __html: formatInline(lines.join(' ')) }}
        />
      );
    });
  };

  const formatInline = (str: string): string => {
    // Escape HTML first for safety and strip any stray heading # markers
    const safe = str
      .replace(/^#{1,6}\s+/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Normalize ***bold italic*** first
    let formatted = safe.replace(
      /\*\*\*(.*?)\*\*\*/g,
      '<strong class="font-semibold italic text-black dark:text-[#E7FE55] bg-[#E7FE55]/40 dark:bg-transparent px-1 dark:px-0 rounded">$1</strong>'
    );
    // Replace bold **text** with styled strong
    formatted = formatted.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold text-black dark:text-[#E7FE55] bg-[#E7FE55]/45 dark:bg-transparent px-1 dark:px-0 rounded">$1</strong>'
    );
    // Replace italic *text* with styled em
    formatted = formatted.replace(
      /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g,
      '<em class="italic text-neutral-900 dark:text-[#F8D4FE]">$1</em>'
    );
    // Format quote lines without thick left border
    if (formatted.startsWith('&gt; ')) {
      formatted = `<span class="italic text-neutral-600 dark:text-neutral-400 block my-1.5">${formatted.replace('&gt; ', '')}</span>`;
    }

    return formatted;
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-5 animate-fade-in">
        <div className="max-w-xl flex items-start gap-3 flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-[#F8D4FE] text-black flex items-center justify-center shrink-0 border border-black/10">
            <User className="w-4 h-4" />
          </div>
          <div className="rounded-[24px] rounded-tr-md bg-black text-white dark:bg-[#141519] dark:text-white border border-black/10 dark:border-white/15 px-5 py-3.5 text-sm shadow-sm">
            {message.image_preview && (
              <div className="mb-3 rounded-2xl overflow-hidden border border-white/15 max-w-xs bg-black/50">
                <img
                  src={message.image_preview}
                  alt="Uploaded film clue or poster"
                  className="w-full h-auto max-h-56 object-cover"
                />
                <div className="bg-black/90 px-3 py-2 flex items-center justify-between gap-2 border-t border-white/10">
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Visual Clue
                  </span>
                  <a
                    href="https://lens.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-black bg-[#E7FE55] hover:opacity-90 transition-opacity font-medium px-2.5 py-0.5 rounded-full"
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
            <span className="text-[10px] text-neutral-400 block text-right mt-1.5 font-mono">
              {message.timestamp}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 animate-fade-in">
      <div className="flex items-start gap-3.5">
        {/* Plotline Avatar */}
        <div className="w-9 h-9 rounded-xl bg-[#000000] dark:bg-[#E7FE55] text-[#E7FE55] dark:text-[#000000] flex items-center justify-center shrink-0 shadow-xs border border-black/10 dark:border-white/15">
          <PlotlineLogo className="w-4 h-4" />
        </div>

        {/* Assistant Content Box */}
        <div className="flex-1 max-w-3xl bg-white dark:bg-[#0D0E11] border border-black/10 dark:border-white/10 rounded-[28px] p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-tight text-black dark:text-[#E7FE55]">
              Plotline
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                {message.timestamp}
              </span>
              {onPlayTTS && (
                <button
                  onClick={handleListenClick}
                  className={`p-1.5 rounded-full transition-colors ${
                    isPlayingThis
                      ? 'bg-[#E7FE55] text-black'
                      : 'text-neutral-500 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
                  }`}
                  title={isPlayingThis ? 'Playing spoken answer' : 'Listen to Plotline response'}
                  aria-label="Listen to Plotline response"
                >
                  {isPlayingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* Web Reverse Image Matches Banner */}
          {message.reverse_search_matches && message.reverse_search_matches.length > 0 && (
            <div className="mb-3 p-3 rounded-2xl bg-[#F2F4FE] dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-black dark:text-white">
              <div className="flex items-center gap-1.5 font-semibold mb-1.5 font-mono text-[11px]">
                <Globe className="w-3.5 h-3.5" />
                <span>Web Reverse Image Matches ({message.reverse_search_engine || 'Google Lens'}):</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1 text-[11px]">
                {message.reverse_search_matches.slice(0, 5).map((match, mIdx) => (
                  <span key={mIdx} className="inline-flex items-center gap-1">
                    <span>{match.title}</span>
                    {match.sourceUrl && (
                      <a
                        href={match.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-80 ml-0.5"
                        title="View source"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {mIdx < Math.min(message.reverse_search_matches!.length, 5) - 1 && (
                      <span aria-hidden="true" className="text-neutral-400 ml-1">&bull;</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Clarification banner if discriminating question asked */}
          {message.is_clarification && (
            <div className="mb-3 p-3 rounded-2xl bg-[#F8D4FE] text-black flex items-center gap-2 text-xs">
              <HelpCircle className="w-4 h-4 text-black shrink-0" />
              <span>
                <strong>Discriminating Question:</strong> Answer with any detail you remember to narrow the candidates.
              </span>
            </div>
          )}

          {/* Formatted Text Content */}
          <div className="max-w-none">
            {renderFormattedText(message.content)}
          </div>

          {/* Film Result Cards (if present) */}
          {message.films && message.films.length > 0 && (
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2">
                <span className="text-xs font-mono font-semibold text-black dark:text-[#E7FE55]">
                  Recommended Matches ({message.films.length})
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                  Sourced via TMDB &amp; Watchmode
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
            <div className="mt-4 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono border-t border-black/5 dark:border-white/5 pt-2.5 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{message.source_note}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

