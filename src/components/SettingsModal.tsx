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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-[#0D0E12] border border-black/15 dark:border-white/15 rounded-[28px] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-[#F2F4FE] dark:bg-[#131418]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#E7FE55] text-black flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-black dark:text-white tracking-tight">
              Settings &amp; Privacy Controls
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-neutral-700 dark:text-neutral-300">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-[#E7FE55] border-black/15 text-black'
                  : 'bg-[#F8D4FE] border-black/15 text-black'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span className="font-medium">{statusMessage.text}</span>
            </div>
          )}

          {/* Section 1: Territory & Streaming Region */}
          <div className="space-y-3 pb-5 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold text-black dark:text-[#E7FE55]">
                01. Territory &amp; Availability Region
              </h3>
              <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                Primary: India (IN)
              </span>
            </div>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Configured for Indian cinephiles. Verified streaming tracks <strong>JioCinema, Disney+ Hotstar, Prime Video India, Netflix, ZEE5, SonyLIV, Aha, and ManoramaMAX</strong>. Theatrical showtimes link directly to <strong>BookMyShow</strong> across Indian cities.
            </p>
            <div className="flex items-center gap-3">
              <label htmlFor="user-region-select" className="text-xs text-black dark:text-white font-medium">
                Country / Region:
              </label>
              <select
                id="user-region-select"
                value={userRegion}
                onChange={(e) => onUserRegionChange(e.target.value)}
                className="bg-[#F2F4FE] dark:bg-[#16181D] border border-black/15 dark:border-white/15 rounded-xl px-3 py-1.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-[#E7FE55] font-medium"
              >
                <option value="IN">India (IN) — Default &amp; Primary</option>
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
          <div className="space-y-3 pb-5 border-b border-black/10 dark:border-white/10">
            <h3 className="text-xs font-mono font-semibold text-black dark:text-[#E7FE55]">
              02. Spoiler Sensitivity
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
                  className="accent-black dark:accent-[#E7FE55]"
                />
                <span className="text-xs text-neutral-800 dark:text-neutral-200">
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
                  className="accent-black dark:accent-[#E7FE55]"
                />
                <span className="text-xs text-neutral-800 dark:text-neutral-200">
                  <strong>Allow detailed plot twists</strong> — Plotline may discuss key turns or endings if asked.
                </span>
              </label>
            </div>
          </div>

          {/* Section 3: Opt-in Memory & Saved Preferences */}
          <div className="space-y-4 pb-5 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono font-semibold text-black dark:text-[#E7FE55] flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  03. Opt-In Saved Preferences (Memory)
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
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
                <div className="w-11 h-6 bg-neutral-300 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-black dark:after:bg-white peer-checked:after:bg-black after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E7FE55]"></div>
              </label>
            </div>

            {/* When Memory is enabled, reveal editable fields */}
            {preferences.memory_enabled ? (
              <div className="p-4 rounded-2xl bg-[#F2F4FE] dark:bg-[#141519] border border-black/10 dark:border-white/15 space-y-4 animate-fade-in">
                {/* Max Runtime */}
                <div>
                  <label htmlFor="pref-runtime" className="text-xs font-medium text-black dark:text-white block mb-1">
                    Usual Max Runtime (Minutes):
                  </label>
                  <input
                    id="pref-runtime"
                    type="number"
                    min="30"
                    max="300"
                    placeholder="e.g. 120"
                    value={preferences.usual_runtime_max_minutes || ''}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        usual_runtime_max_minutes: e.target.value ? parseInt(e.target.value, 10) : null,
                      }))
                    }
                    className="w-full sm:w-48 bg-white dark:bg-[#0D0E11] border border-black/15 dark:border-white/15 rounded-xl px-3 py-1.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-[#E7FE55]"
                  />
                </div>

                {/* Preferred Languages */}
                <div>
                  <label htmlFor="pref-language" className="text-xs font-medium text-black dark:text-white block mb-1">
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
                      className="bg-white dark:bg-[#0D0E11] border border-black/15 dark:border-white/15 rounded-xl px-3 py-1.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-[#E7FE55] flex-1"
                    />
                    <button
                      type="button"
                      onClick={addLanguage}
                      className="px-3.5 py-1.5 bg-black text-white dark:bg-[#E7FE55] dark:text-black font-medium rounded-xl text-xs"
                    >
                      Add
                    </button>
                  </div>
                  {/* Quick-add Indian language buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    <span className="text-[10px] text-neutral-500 font-mono">Quick add:</span>
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
                          className={`text-[10px] px-2.5 py-0.5 rounded-full transition-colors ${
                            alreadyAdded
                              ? 'bg-black/5 dark:bg-white/5 text-neutral-400 cursor-default'
                              : 'bg-white dark:bg-white/10 text-black dark:text-white border border-black/10 dark:border-white/10 hover:bg-[#E7FE55] dark:hover:bg-[#E7FE55] dark:hover:text-black'
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
                        className="inline-flex items-center gap-1 text-xs bg-[#E7FE55] text-black font-medium px-2.5 py-0.5 rounded-full"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => removeLanguage(lang)}
                          className="hover:opacity-70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preferred Genres */}
                <div>
                  <label htmlFor="pref-genre" className="text-xs font-medium text-black dark:text-white block mb-1">
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
                      className="bg-white dark:bg-[#0D0E11] border border-black/15 dark:border-white/15 rounded-xl px-3 py-1.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-[#E7FE55] flex-1"
                    />
                    <button
                      type="button"
                      onClick={addGenre}
                      className="px-3.5 py-1.5 bg-black text-white dark:bg-[#E7FE55] dark:text-black font-medium rounded-xl text-xs"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {preferences.preferred_genres.map((genre) => (
                      <span
                        key={genre}
                        className="inline-flex items-center gap-1 text-xs bg-[#F8D4FE] text-black font-medium px-2.5 py-0.5 rounded-full"
                      >
                        {genre}
                        <button
                          type="button"
                          onClick={() => removeGenre(genre)}
                          className="hover:opacity-70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10">
                  <button
                    onClick={handleSavePreferences}
                    disabled={isLoading}
                    className="px-4 py-1.5 rounded-full bg-[#E7FE55] hover:opacity-90 text-black font-semibold text-xs flex items-center gap-1.5 transition-opacity"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Preferences</span>
                  </button>

                  <button
                    onClick={handleDeleteAllPreferences}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-full text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Saved Data</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-[#F2F4FE] dark:bg-white/5 text-neutral-600 dark:text-neutral-400 text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Memory is disabled. Plotline only tracks the ongoing active conversation in this browser session.</span>
              </div>
            )}
          </div>

          {/* Section 4: Privacy & Sources Declaration */}
          <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
            <h3 className="font-mono font-semibold text-black dark:text-white flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-black dark:text-[#E7FE55]" />
              04. Privacy &amp; Sources Declaration
            </h3>
            <p>
              &bull; <strong>Attribution:</strong> Film metadata, reviews, and streaming availability are provided live by The Movie Database (TMDB) and Watchmode APIs.
            </p>
            <p>
              &bull; <strong>Conversational Model:</strong> Powered by Google Gemini via server-side API calls. User conversations and uploads are never stored permanently.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#F2F4FE] dark:bg-[#131418] border-t border-black/10 dark:border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-full bg-black text-white dark:bg-[#E7FE55] dark:text-black text-xs font-semibold transition-opacity hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

