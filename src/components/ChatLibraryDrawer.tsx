/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, MessageSquare, Search, Trash2, Clock, Sparkles } from 'lucide-react';
import { ChatSession } from '../types';
import { PlotlineLogo } from './PlotlineLogo';

interface ChatLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  hasActiveMessages: boolean;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
}

export const ChatLibraryDrawer: React.FC<ChatLibraryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  hasActiveMessages,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((session) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      session.title.toLowerCase().includes(q) ||
      session.preview.toLowerCase().includes(q) ||
      session.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  });

  const formatRelativeDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="Chat Library"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Sidebar Panel */}
      <aside className="relative z-10 w-full max-w-xs sm:max-w-sm bg-[#F2F4FE] dark:bg-[#0B0C0E] text-black dark:text-white h-full border-r border-black/15 dark:border-white/15 shadow-2xl flex flex-col justify-between animate-fade-in">
        {/* Top Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black dark:bg-[#E7FE55] text-[#E7FE55] dark:text-black flex items-center justify-center shadow-xs">
                <PlotlineLogo className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight leading-none text-black dark:text-white">
                  Chat Library
                </h2>
                <span className="text-[10px] font-mono text-neutral-500 dark:text-[#F8D4FE] uppercase tracking-wider block mt-1">
                  {sessions.length} {sessions.length === 1 ? 'Saved Thread' : 'Saved Threads'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors"
              aria-label="Close chat library"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* + New Chat Primary Action */}
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#E7FE55] text-black font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-xs border border-black/10 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Chat</span>
          </button>

          {/* Search input when sessions exist */}
          {sessions.length > 0 && (
            <div className="relative mt-3">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search past chats or films..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#141519] border border-black/10 dark:border-white/10 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-[#E7FE55] transition-colors"
              />
            </div>
          )}
        </div>

        {/* Scrollable Session List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {filteredSessions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-11 h-11 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center mb-3 text-neutral-500 dark:text-[#F8D4FE]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-black dark:text-white">
                {searchQuery.trim() ? 'No matching chats found' : 'Your Chat Library is empty'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-[230px] leading-relaxed">
                {searchQuery.trim()
                  ? 'Try another film title or keyword.'
                  : 'Every movie conversation you start is automatically saved here so you can pick up right where you left off.'}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isCurrent = session.id === activeSessionId && hasActiveMessages;
              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectSession(session.id);
                      onClose();
                    }
                  }}
                  className={`group relative w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-white dark:bg-[#181A20] border-black dark:border-[#E7FE55] shadow-sm'
                      : 'bg-white/70 dark:bg-[#121317] border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-[#181A20] hover:border-black/30 dark:hover:border-white/25'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-black dark:bg-[#E7FE55] shrink-0" />
                        )}
                        <h3 className="text-xs sm:text-sm font-semibold text-black dark:text-white truncate">
                          {session.title}
                        </h3>
                      </div>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                        {session.preview}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => onDeleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-black/5 dark:hover:bg-white/5 transition-all shrink-0"
                      title="Delete chat from library"
                      aria-label={`Delete chat ${session.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                    <span className="inline-flex items-center gap-1 uppercase tracking-wider text-black/80 dark:text-[#F8D4FE]">
                      <Sparkles className="w-2.5 h-2.5" />
                      {session.persona} &middot; {session.messages.length}{' '}
                      {session.messages.length === 1 ? 'msg' : 'msgs'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatRelativeDate(session.updatedAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer memory note */}
        <div className="p-3.5 sm:p-4 border-t border-black/10 dark:border-white/10 bg-white/60 dark:bg-[#0F1014]">
          <p className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Continuing any saved chat restores full conversation context &amp; film memory.
          </p>
        </div>
      </aside>
    </div>
  );
};
