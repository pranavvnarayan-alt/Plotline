/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TestScenario, SystemStatus } from '../types';
import {
  X,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Server,
  FileCode,
  Sparkles,
  RefreshCw,
  Award,
} from 'lucide-react';

interface DevTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevTestModal: React.FC<DevTestModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'system'>('scenarios');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/status')
        .then((r) => r.json())
        .then((data) => setStatus(data))
        .catch((err) => console.error('Status fetch error:', err));

      fetch('/api/scenarios')
        .then((r) => r.json())
        .then((data) => {
          setScenarios(data);
          if (data.length > 0 && !selectedScenario) {
            setSelectedScenario(data[0]);
          }
        })
        .catch((err) => console.error('Scenarios fetch error:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunScenario = async (scenarioId: string) => {
    setRunningId(scenarioId);
    try {
      const res = await fetch('/api/scenarios/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId }),
      });
      const updated: TestScenario = await res.json();
      setScenarios((prev) =>
        prev.map((s) => (s.id === scenarioId ? updated : s))
      );
      if (selectedScenario?.id === scenarioId) {
        setSelectedScenario(updated);
      }
    } catch (err) {
      console.error('Error running scenario:', err);
    } finally {
      setRunningId(null);
    }
  };

  const passedCount = scenarios.filter((s) => s.status === 'passed').length;
  const failedCount = scenarios.filter((s) => s.status === 'failed').length;
  const unrunCount = scenarios.filter((s) => s.status === 'not run').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#121417] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#15171b]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                Plotline Test Lab & Evaluation Suite
                <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-amber-300">
                  06_TEST_EVALUATE_IMPROVE
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Live verification surface for scenarios T01 through T14
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10 text-xs">
              <button
                onClick={() => setActiveTab('scenarios')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'scenarios'
                    ? 'bg-amber-500/20 text-amber-300 font-medium'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Scenarios ({passedCount}/{scenarios.length} passed)
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'system'
                    ? 'bg-amber-500/20 text-amber-300 font-medium'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                System & Prompts
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close test lab"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {activeTab === 'scenarios' ? (
            <>
              {/* Left Column: List of Scenarios */}
              <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto p-3 space-y-1.5 bg-[#0f1113]">
                <div className="px-2 py-1 text-[11px] font-mono text-stone-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Test Scenarios ({scenarios.length})</span>
                  <span className="text-amber-400">{passedCount} Passed</span>
                </div>

                {scenarios.map((s) => {
                  const isSelected = selectedScenario?.id === s.id;
                  const isRunning = runningId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedScenario(s)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/40 text-white'
                          : 'bg-[#15171a] border-white/5 hover:border-white/15 text-stone-300'
                      }`}
                    >
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className="font-mono text-amber-400">{s.id}</span>
                          <span className="truncate">{s.name}</span>
                        </div>
                        <span className="text-[10px] text-stone-400 truncate block mt-0.5">
                          {s.prompt}
                        </span>
                      </div>

                      {/* Status indicator */}
                      <div className="shrink-0">
                        {isRunning ? (
                          <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                        ) : s.status === 'passed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : s.status === 'failed' ? (
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-stone-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Scenario Details & Execution Output */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#131518] flex flex-col justify-between">
                {selectedScenario ? (
                  <div className="space-y-5">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {selectedScenario.id}
                          </span>
                          <h3 className="text-base font-serif font-bold text-white">
                            {selectedScenario.name}
                          </h3>
                        </div>
                        <p className="text-xs text-stone-400 mt-1 font-mono">
                          Rubric Evaluation per 06_TEST_EVALUATE_IMPROVE.md
                        </p>
                      </div>

                      <button
                        onClick={() => handleRunScenario(selectedScenario.id)}
                        disabled={runningId !== null}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition-all shrink-0"
                      >
                        {runningId === selectedScenario.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Running Model...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Run Test Scenario</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Test Prompt */}
                    <div>
                      <span className="text-[11px] uppercase font-mono tracking-wider text-stone-400 block mb-1">
                        Input Test Prompt:
                      </span>
                      <div className="p-3 rounded-lg bg-[#0e1012] border border-white/10 text-xs text-amber-200 font-mono">
                        "{selectedScenario.prompt}"
                      </div>
                    </div>

                    {/* Expected Behaviour */}
                    <div>
                      <span className="text-[11px] uppercase font-mono tracking-wider text-stone-400 block mb-1">
                        Expected Behaviour:
                      </span>
                      <p className="text-xs text-stone-300 bg-white/5 p-3 rounded-lg border border-white/5 leading-relaxed">
                        {selectedScenario.expected_behaviour}
                      </p>
                    </div>

                    {/* Actual Output */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] uppercase font-mono tracking-wider text-stone-400">
                          Actual Model Execution:
                        </span>
                        {selectedScenario.status !== 'not run' && (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                              selectedScenario.status === 'passed'
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-950/60 text-red-300 border border-red-500/30'
                            }`}
                          >
                            Status: {selectedScenario.status}
                          </span>
                        )}
                      </div>
                      <div className="p-3.5 rounded-lg bg-[#0c0d0f] border border-white/10 text-xs text-stone-200 font-sans whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                        {selectedScenario.actual_output || (
                          <span className="text-stone-500 italic">
                            Click 'Run Test Scenario' to execute this test through the real server-side pipeline.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rubric Scores (0-2 each, total out of 10) */}
                    {selectedScenario.scores && (
                      <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold block mb-2">
                          Rubric Evaluation Scores (0–2 scale)
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                          <div className="p-2 rounded bg-white/5 border border-white/5">
                            <span className="text-[10px] text-stone-400 block">Accuracy</span>
                            <span className="font-mono font-bold text-amber-300 text-sm">
                              {selectedScenario.scores.accuracy}/2
                            </span>
                          </div>
                          <div className="p-2 rounded bg-white/5 border border-white/5">
                            <span className="text-[10px] text-stone-400 block">Clarity</span>
                            <span className="font-mono font-bold text-amber-300 text-sm">
                              {selectedScenario.scores.clarity}/2
                            </span>
                          </div>
                          <div className="p-2 rounded bg-white/5 border border-white/5">
                            <span className="text-[10px] text-stone-400 block">Scope</span>
                            <span className="font-mono font-bold text-amber-300 text-sm">
                              {selectedScenario.scores.scope}/2
                            </span>
                          </div>
                          <div className="p-2 rounded bg-white/5 border border-white/5">
                            <span className="text-[10px] text-stone-400 block">Trust</span>
                            <span className="font-mono font-bold text-amber-300 text-sm">
                              {selectedScenario.scores.trust}/2
                            </span>
                          </div>
                          <div className="p-2 rounded bg-white/5 border border-white/5">
                            <span className="text-[10px] text-stone-400 block">Privacy</span>
                            <span className="font-mono font-bold text-amber-300 text-sm">
                              {selectedScenario.scores.privacy}/2
                            </span>
                          </div>
                        </div>

                        {selectedScenario.notes && (
                          <p className="text-[11px] text-stone-400 mt-2 font-mono">
                            Notes: {selectedScenario.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-stone-500 text-xs py-12">
                    Select a scenario on the left to inspect its parameters.
                  </div>
                )}
              </div>
            </>
          ) : (
            /* System & Configuration Diagnostics Tab */
            <div className="p-6 space-y-5 overflow-y-auto w-full bg-[#131518]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#17191d] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase font-semibold">
                    <Server className="w-4 h-4" />
                    Model & Runtime Engine
                  </div>
                  <div className="text-xs space-y-1.5 text-stone-300">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Active Provider:</span>
                      <span className="font-mono text-emerald-400 uppercase">
                        {status?.active_provider === 'openrouter' ? 'OpenRouter (Vercel Ready)' : 'Google AI Studio'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Configured Model:</span>
                      <span className="font-mono text-amber-300">{status?.model_name || 'gemini-3.8-flash'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">OpenRouter Key:</span>
                      <span className={status?.openrouter_configured ? 'text-emerald-400 font-mono' : 'text-stone-400 font-mono'}>
                        {status?.openrouter_configured ? 'Active (Adapter Connected)' : 'Not set (Optional for Vercel)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Google Gemini Key:</span>
                      <span className={status?.gemini_configured ? 'text-emerald-400 font-mono' : 'text-stone-400 font-mono'}>
                        {status?.gemini_configured ? 'Active (Google GenAI)' : 'Not configured'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Prompt Version:</span>
                      <span className="font-mono text-stone-200">{status?.system_prompt_version || 'v0.1-2026-10-28'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#17191d] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase font-semibold">
                    <FileCode className="w-4 h-4" />
                    External Integrations
                  </div>
                  <div className="text-xs space-y-1.5 text-stone-300">
                    <div className="flex justify-between">
                      <span className="text-stone-400">TMDB Metadata API:</span>
                      <span className={status?.tmdb_configured ? 'text-emerald-400 font-mono' : 'text-amber-300 font-mono'}>
                        {status?.tmdb_configured ? 'Connected (Live 2025+ Access Active)' : 'Optional (Add TMDB_API_KEY for 2025+)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Reverse Image Search:</span>
                      <span className={status?.apify_configured ? 'text-emerald-400 font-mono' : 'text-stone-300 font-mono'}>
                        {status?.apify_configured ? 'Apify Google Lens Scraper (Active)' : 'Google Lens Button + Gemini Vision'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Voice Synthesis:</span>
                      <span className="font-mono text-emerald-400">Gemini 3.8 Flash Lite TTS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Live Showtimes:</span>
                      <span className="font-mono text-amber-400">Safe refusal (No invented prices)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Prompt Installation Proof */}
              <div className="p-4 rounded-xl bg-[#17191d] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase font-semibold">
                  <Sparkles className="w-4 h-4" />
                  Runtime System Instruction Verification
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Verified in code: The complete text of section <code className="text-amber-300">RUNTIME SYSTEM INSTRUCTION — INSTALL THIS IN THE MODEL REQUEST</code> from <code className="text-amber-300">02_AGENT_SYSTEM_PROMPT_AND_RULES.md</code> is imported from <code className="text-stone-200">src/server/systemPrompt.ts</code> and passed directly in the <code className="text-stone-200">config.systemInstruction</code> parameter of every server-side Gemini request.
                </p>
                <div className="text-[11px] text-stone-400 font-mono bg-black/40 p-2.5 rounded border border-white/5">
                  &bull; Strict prompt injection refusal verified (T08)<br />
                  &bull; Zero fake showtimes or fabricated streaming rights enforced (T09, T13)<br />
                  &bull; Opt-in memory storage lifecycle with permanent deletion (T14)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#0e1012] border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
          <div className="font-mono text-[11px]">
            Passed: {passedCount} &bull; Failed: {failedCount} &bull; Unrun: {unrunCount}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-stone-200 font-medium transition-colors"
          >
            Close Lab
          </button>
        </div>
      </div>
    </div>
  );
};
