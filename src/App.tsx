/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Message, PersonaStyle, FilmCardData } from './types';
import { Header } from './components/Header';
import { WelcomeState } from './components/WelcomeState';
import { ChatMessage } from './components/ChatMessage';
import { Composer } from './components/Composer';
import { SettingsModal } from './components/SettingsModal';
import { DevTestModal } from './components/DevTestModal';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePersona, setActivePersona] = useState<PersonaStyle>('companion');
  const [userRegion, setUserRegion] = useState('IN');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUserPrompt, setLastUserPrompt] = useState<{
    text: string;
    image?: { mimeType: string; base64Data: string; previewUrl: string };
  } | null>(null);

  // Audio Playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDevTestOpen, setIsDevTestOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Audio cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  const handleSendMessage = async (
    text: string,
    image?: { mimeType: string; base64Data: string; previewUrl: string }
  ) => {
    setErrorMessage(null);
    setLastUserPrompt({ text, image });

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: timeStr,
      image_preview: image?.previewUrl,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Prepare history payload for server (max 8 prior turns)
    const historyPayload = messages.slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          persona: activePersona,
          userRegion,
          image: image
            ? {
                mimeType: image.mimeType,
                base64Data: image.base64Data,
              }
            : undefined,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No recommendations generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        films: data.films || [],
        is_clarification: data.isClarification,
        source_note: 'Verified with TMDB metadata & Gemini 3.8. Live showtimes/prices not simulated.',
        reverse_search_engine: data.reverseSearchEngine,
        reverse_search_matches: data.reverseSearchMatches,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request was cancelled by user');
        return;
      }
      console.error('Chat error:', err);
      setErrorMessage(
        err.message || 'Unable to connect to Plotline service. Please check network or verify GEMINI_API_KEY.'
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetryLastMessage = () => {
    if (lastUserPrompt) {
      handleSendMessage(lastUserPrompt.text, lastUserPrompt.image);
    }
  };

  const handleCancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleClearChat = () => {
    if (window.confirm('Clear current session conversation? (This resets conversation context for future answers)')) {
      setMessages([]);
      setErrorMessage(null);
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setPlayingAudioId(null);
    }
  };

  // Text-To-Speech handler
  const handlePlayTTS = async (text: string) => {
    // If audio is already playing, stop it
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setPlayingAudioId(null);
      return;
    }

    try {
      setPlayingAudioId('loading');

      // Request server-side TTS using gemini-3.8-flash-lite-tts
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          currentAudioRef.current = audio;
          setPlayingAudioId('playing');

          audio.onended = () => {
            setPlayingAudioId(null);
            currentAudioRef.current = null;
          };
          audio.onerror = () => {
            setPlayingAudioId(null);
            currentAudioRef.current = null;
          };

          await audio.play();
          return;
        }
      }

      // Browser Web Speech fallback if server TTS is unavailable
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setPlayingAudioId(null);
        utterance.onerror = () => setPlayingAudioId(null);
        setPlayingAudioId('playing');
        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingAudioId(null);
      }
    } catch (err) {
      console.warn('Audio playback error:', err);
      setPlayingAudioId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-[#e5e5e7] flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <Header
        activePersona={activePersona}
        onPersonaChange={setActivePersona}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDevTest={() => setIsDevTestOpen(true)}
        onClearChat={handleClearChat}
        messageCount={messages.length}
      />

      {/* Main Conversation Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 flex flex-col justify-start">
        {messages.length === 0 ? (
          <WelcomeState onSelectStarter={(prompt) => handleSendMessage(prompt)} />
        ) : (
          <div className="space-y-4 pb-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onPlayTTS={handlePlayTTS}
                playingAudioId={playingAudioId}
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="my-4 animate-fade-in flex items-center gap-3 text-stone-400 text-xs font-mono">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                </div>
                <span>
                  Consulting cinematic knowledge & checking verified candidate records...
                </span>
              </div>
            )}

            {/* Error Message with Retry */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center justify-between gap-3 animate-fade-in my-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                {lastUserPrompt && (
                  <button
                    onClick={handleRetryLastMessage}
                    className="px-3 py-1 bg-red-900/50 hover:bg-red-900 text-red-100 rounded-lg font-medium flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Composer */}
      <Composer
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        onCancelRequest={handleCancelRequest}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userRegion={userRegion}
        onUserRegionChange={setUserRegion}
      />

      {/* Developer Diagnostics & 06_TEST Scenarios Modal */}
      <DevTestModal
        isOpen={isDevTestOpen}
        onClose={() => setIsDevTestOpen(false)}
      />
    </div>
  );
}
