/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SavedPreferences } from '../types';
import {
  X,
  Shield,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Sliders,
  Database,
  Lock,
  Globe,
  ExternalLink,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRegion: string;
  onUserRegionChange: (region: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userRegion,
  onUserRegionChange,
}) => {
  const [preferences, setPreferences] = useState<SavedPreferences>({
    memory_enabled: false,
    preferred_languages: [],
    preferred_genres: [],
    themes_of_interest: [],
    usual_runtime_max_minutes: null,
    subtitle_or_dubbing_preference: null,
    spoiler_preference: 'avoid_by_default',
    content_avoidances: [],
    updated_at: new Date().toISOString(),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newGenre, setNewGenre] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  // Fetch preferences from server when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch('/api/preferences')
        .then((res) => res.json())
        .then((data) => {
          setPreferences(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load preferences:', err);
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSavePreferences = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      const data = await res.json();
      setPreferences(data);
      setStatusMessage({ type: 'success', text: 'Preferences saved to secure store successfully.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save preferences.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllPreferences = async () => {
    if (!window.confirm('Are you sure you want to delete all saved preferences and disable cross-session memory?')) {
      return;
    }
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/preferences', { method: 'DELETE' });
      await res.json();
      setPreferences({
        memory_enabled: false,
        preferred_languages: [],
        preferred_genres: [],
        themes_of_interest: [],
        usual_runtime_max_minutes: null,
        subtitle_or_dubbing_preference: null,
        spoiler_preference: 'avoid_by_default',
        content_avoidances: [],
        updated_at: new Date().toISOString(),
      });
      setStatusMessage({ type: 'success', text: 'All saved preferences permanently deleted from storage.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Deletion failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const addGenre = () => {
    const trimmed = newGenre.trim();
    if (trimmed && !preferences.preferred_genres.includes(trimmed)) {
      setPreferences((prev) => ({
        ...prev,
        preferred_genres: [...prev.preferred_genres, trimmed],
      }));
      setNewGenre('');
    }
  };

  const removeGenre = (genre: string) => {
    setPreferences((prev) => ({
      ...prev,
      preferred_genres: prev.preferred_genres.filter((g) => g !== genre),
    }));
  };

  const addLanguage = () => {
    const trimmed = newLanguage.trim();
    if (trimmed && !preferences.preferred_languages.includes(trimmed)) {
      setPreferences((prev) => ({
        ...prev,
        preferred_languages: [...prev.preferred_languages, trimmed],
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (lang: string) => {
    setPreferences((prev) => ({
      ...prev,
      preferred_languages: prev.preferred_languages.filter((l) => l !== lang),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#131518] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold text-white">Settings & Privacy Controls</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-stone-300">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Section 1: Territory & Streaming Region */}
          <div className="space-y-3 pb-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-mono tracking-wider text-amber-400 font-semibold">
                Territory & Availability Region
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Primary: India (IN)
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Catering towards Indian cinephiles. Verified streaming tracks <strong>JioCinema, Disney+ Hotstar, Prime Video India, Netflix, ZEE5, SonyLIV, Aha, and ManoramaMAX</strong>. Theatrical showtimes link directly to <strong>BookMyShow</strong> across Indian cities.
            </p>
            <div className="flex items-center gap-3">
              <label htmlFor="user-region-select" className="text-xs text-stone-300 font-medium">
                Country / Region:
              </label>
              <select
                id="user-region-select"
                value={userRegion}
                onChange={(e) => onUserRegionChange(e.target.value)}
                className="bg-[#1c1f24] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="IN">India (IN) — Default & Primary</option>
                <option value="US">United States (US)</option>
                <option value="GB">United Kingdom (GB)</option>
                <option value="CA">Canada (CA)</option>
                <option value="AU">Australia (AU)</option>
                <option value="FR">France (FR)</option>
                <option value="DE">Germany (DE)</option>
                <option value="JP">Japan (JP)</option>
                <option value="KR">South Korea (KR)</option>
                <option value="BR">Brazil (BR)</option>
                <option value="MX">Mexico (MX)</option>
              </select>
            </div>
          </div>

          {/* Section 2: Spoilers & Content Preferences */}
          <div className="space-y-3 pb-5 border-b border-white/10">
            <h3 className="text-xs uppercase font-mono tracking-wider text-amber-400 font-semibold">
              Spoiler Sensitivity
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="spoiler_pref"
                  checked={preferences.spoiler_preference === 'avoid_by_default'}
                  onChange={() =>
                    setPreferences((prev) => ({ ...prev, spoiler_preference: 'avoid_by_default' }))
                  }
                  className="text-amber-500 focus:ring-0"
                />
                <span className="text-xs text-stone-200">
                  <strong>Avoid spoilers by default (Recommended)</strong> — Summaries are strictly spoiler-free.
                </span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="spoiler_pref"
                  checked={preferences.spoiler_preference === 'allow'}
                  onChange={() =>
                    setPreferences((prev) => ({ ...prev, spoiler_preference: 'allow' }))
                  }
                  className="text-amber-500 focus:ring-0"
                />
                <span className="text-xs text-stone-200">
                  <strong>Allow detailed plot twists</strong> — Plotline may discuss key turns or endings if asked.
                </span>
              </label>
            </div>
          </div>

          {/* Section 3: Opt-in Memory & Saved Preferences */}
          <div className="space-y-4 pb-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs uppercase font-mono tracking-wider text-amber-400 font-semibold flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Opt-In Saved Preferences (Memory)
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Strictly off by default. Storing preferences allows Plotline to remember your favorite genres, languages, and runtime ceilings across visits.
                </p>
              </div>

              {/* Memory Toggle */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                <input
                  type="checkbox"
                  checked={preferences.memory_enabled}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, memory_enabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {/* When Memory is enabled, reveal editable fields */}
            {preferences.memory_enabled ? (
              <div className="p-4 rounded-xl bg-[#181a1d] border border-amber-500/20 space-y-4 animate-fade-in">
                {/* Max Runtime */}
                <div>
                  <label htmlFor="pref-runtime" className="text-xs font-medium text-stone-300 block mb-1">
                    Usual Max Runtime (Minutes):
                  </label>
                  <input
                    id="pref-runtime"
                    type="number"
                    min="30"
                    max="300"
                    placeholder="e.g. 100"
                    value={preferences.usual_runtime_max_minutes || ''}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        usual_runtime_max_minutes: e.target.value ? parseInt(e.target.value, 10) : null,
                      }))
                    }
                    className="w-full sm:w-48 bg-[#101214] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Preferred Languages */}
                <div>
                  <label htmlFor="pref-language" className="text-xs font-medium text-stone-300 block mb-1">
                    Preferred Languages:
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      id="pref-language"
                      type="text"
                      placeholder="e.g. Hindi, Malayalam, Tamil, Telugu, Kannada, Bengali, Gujarati, English..."
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                      className="bg-[#101214] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500 flex-1"
                    />
                    <button
                      type="button"
                      onClick={addLanguage}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-stone-200 rounded-lg text-xs"
                    >
                      Add
                    </button>
                  </div>
                  {/* Quick-add Indian language chips */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    <span className="text-[10px] text-stone-400 font-mono">Quick add:</span>
                    {['Hindi', 'Malayalam', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Gujarati', 'Marathi', 'English'].map((quickLang) => {
                      const alreadyAdded = preferences.preferred_languages.includes(quickLang);
                      return (
                        <button
                          key={quickLang}
                          type="button"
                          onClick={() => {
                            if (!alreadyAdded) {
                              setPreferences((prev) => ({
                                ...prev,
                                preferred_languages: [...prev.preferred_languages, quickLang],
                              }));
                            }
                          }}
                          disabled={alreadyAdded}
                          className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                            alreadyAdded
                              ? 'bg-white/5 text-stone-500 cursor-default'
                              : 'bg-white/10 text-stone-300 hover:bg-amber-500/20 hover:text-amber-300'
                          }`}
                        >
                          + {quickLang}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {preferences.preferred_languages.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => removeLanguage(lang)}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preferred Genres */}
                <div>
                  <label htmlFor="pref-genre" className="text-xs font-medium text-stone-300 block mb-1">
                    Preferred Genres / Formats:
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      id="pref-genre"
                      type="text"
                      placeholder="e.g. Social Drama, Psychological Thriller, Film Noir..."
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                      className="bg-[#101214] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500 flex-1"
                    />
                    <button
                      type="button"
                      onClick={addGenre}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-stone-200 rounded-lg text-xs"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {preferences.preferred_genres.map((genre) => (
                      <span
                        key={genre}
                        className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20"
                      >
                        {genre}
                        <button
                          type="button"
                          onClick={() => removeGenre(genre)}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <button
                    onClick={handleSavePreferences}
                    disabled={isLoading}
                    className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Preferences</span>
                  </button>

                  <button
                    onClick={handleDeleteAllPreferences}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-lg text-stone-400 hover:text-red-300 hover:bg-red-950/30 text-xs flex items-center gap-1 transition-all border border-transparent hover:border-red-900/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete All Saved Data</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-white/5 text-stone-400 text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 text-stone-500 shrink-0" />
                <span>Memory is disabled. Plotline only tracks the ongoing active conversation in this browser session.</span>
              </div>
            )}
          </div>

          {/* Section 4: Extending Access for Films After January 2025 */}
          <div className="space-y-3 pb-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-mono tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                <Database className="w-4 h-4" />
                Live Access & Films After January 2025
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-stone-300">
                TMDB Live Catalog
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              To discover films released after January 2025 with real-time metadata, posters, runtimes, and local streaming providers, connect <strong>The Movie Database (TMDB)</strong>:
            </p>

            <div className="p-3.5 rounded-xl bg-[#17191d] border border-white/10 space-y-2.5 text-xs">
              <div className="font-semibold text-stone-200">How to extend access:</div>
              <ol className="list-decimal list-inside space-y-1.5 text-stone-300">
                <li>
                  Create a free developer account at{' '}
                  <a
                    href="https://www.themoviedb.org/settings/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 underline hover:text-amber-300"
                  >
                    themoviedb.org/settings/api
                  </a>{' '}
                  and generate an API Key.
                </li>
                <li>
                  In <strong>Google AI Studio</strong>, open the <strong>Secrets</strong> panel (Settings &gt; Secrets).
                </li>
                <li>
                  Add a secret named <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded font-mono">TMDB_API_KEY</code> with your key value.
                </li>
                <li>
                  Restart or refresh the applet. Plotline will automatically query the live TMDB database for all 2025, 2026, and upcoming worldwide releases!
                </li>
              </ol>
            </div>
          </div>

          {/* Section 5: Reverse Image Search & Google Lens Access */}
          <div className="space-y-3 pb-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-mono tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                Reverse Image Search & Google Lens
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Visual Web Search
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Plotline supports two ways to perform reverse image search on uploaded movie stills, scenes, and posters:
            </p>

            <div className="p-3.5 rounded-xl bg-[#17191d] border border-white/10 space-y-3 text-xs">
              <div className="space-y-1">
                <div className="font-semibold text-stone-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Method 1: Direct 1-Click Google Lens (Instant & No Token Required)
                </div>
                <p className="text-stone-300 text-[11px] pl-3.5">
                  Whenever you upload an image clue in the chat, click the <strong className="text-amber-300">"Search Google Lens"</strong> button on your message card. It immediately opens Google Lens in a new tab where you can inspect web matches.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="font-semibold text-stone-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Method 2: Automated Background Search via Apify Google Lens Actor
                </div>
                <p className="text-stone-300 text-[11px] pl-3.5">
                  To have the server automatically scrape Google Lens web matches and inject the visual clues directly into the Gemini model prompt:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-stone-300 text-[11px] pl-3.5">
                  <li>
                    Get an API token from your Apify console at{' '}
                    <a
                      href="https://console.apify.com/account/integrations"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 underline hover:text-amber-300"
                    >
                      console.apify.com
                    </a>.
                  </li>
                  <li>
                    In <strong>Google AI Studio</strong>, open <strong>Settings &gt; Secrets</strong>.
                  </li>
                  <li>
                    Add a secret named <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded font-mono">APIFY_API_TOKEN</code> with your Apify token.
                  </li>
                  <li className="text-amber-200/90 font-medium">
                    ⚠️ <em>Important:</em> Do <strong>NOT</strong> put your Apify token into <code className="text-stone-300 bg-black/40 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code>. <code className="text-stone-300 bg-black/40 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code> is exclusively for the Google Gemini vision model.
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Section 6: OpenRouter & Vercel Deployment */}
          <div className="space-y-3 pb-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-mono tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                Vercel & OpenRouter Deployment
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Multi-Provider Adapter
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Pushing code to GitHub and deploying to <strong>Vercel</strong>? Plotline has a built-in OpenRouter adapter:
            </p>

            <div className="p-3.5 rounded-xl bg-[#17191d] border border-white/10 space-y-2 text-xs">
              <div className="font-semibold text-stone-200">How to configure on Vercel:</div>
              <ul className="space-y-1.5 text-stone-300 list-disc list-inside">
                <li>
                  In your Vercel Project Settings under <strong>Environment Variables</strong>, add either:
                  <div className="ml-4 mt-1 font-mono text-[11px] space-y-0.5">
                    <div><span className="text-amber-300">OPENROUTER_API_KEY</span> = <span className="text-stone-400">sk-or-v1-...</span></div>
                    <span className="text-stone-400 text-[10px]">or simply put your <code className="text-amber-200">sk-or-...</code> key in <span className="text-amber-300">GEMINI_API_KEY</span> (auto-detected!)</span>
                  </div>
                </li>
                <li>
                  <strong className="text-stone-200">Model selection:</strong> Defaults to <code className="text-amber-300 font-mono">google/gemini-2.5-flash</code>. You can optionally set <code className="text-amber-300 font-mono">OPENROUTER_MODEL</code> to any OpenRouter model.
                </li>
                <li>
                  <strong className="text-stone-200">Zero-config Vercel Serverless:</strong> <code className="text-stone-200 font-mono">vercel.json</code> and <code className="text-stone-200 font-mono">api/index.ts</code> are already generated and ready for instant deployment.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 7: Privacy & Attribution Notice */}
          <div className="space-y-2 text-xs text-stone-400">
            <h3 className="uppercase font-mono tracking-wider text-stone-400 font-semibold flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-400" />
              Privacy & Sources Declaration
            </h3>
            <p>
              • <strong>Attribution:</strong> Film metadata and poster assets are provided by The Movie Database (TMDB). This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
            <p>
              • <strong>Conversational Model:</strong> Powered by Google Gemini 3.8 Flash via server-side API calls. User conversations and uploads are never stored permanently or used for public training.
            </p>
            <p>
              • <strong>Audio Safety:</strong> Raw microphone audio is processed locally for dictation and is never retained on the server.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#0e1012] border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
