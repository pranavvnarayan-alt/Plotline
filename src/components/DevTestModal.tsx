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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-[#0D0E12] border border-black/15 dark:border-white/15 rounded-[28px] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-[#F2F4FE] dark:bg-[#131418]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F8D4FE] text-black flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-black dark:text-white tracking-tight">
                Plotline Evaluation Lab
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Live verification surface for scenarios T01 through T14
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="flex items-center bg-white dark:bg-[#0A0B0E] rounded-full p-1 border border-black/10 dark:border-white/10 text-xs">
              <button
                onClick={() => setActiveTab('scenarios')}
                className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap ${
                  activeTab === 'scenarios'
                    ? 'bg-[#E7FE55] text-black font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Scenarios ({passedCount}/{scenarios.length})
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap ${
                  activeTab === 'system'
                    ? 'bg-[#E7FE55] text-black font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                System &amp; APIs
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
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
              <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 overflow-y-auto p-3 space-y-1.5 bg-[#F2F4FE] dark:bg-[#0A0B0E]">
                <div className="px-2 py-1 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 flex items-center justify-between tabular-nums">
                  <span>Test Scenarios ({scenarios.length})</span>
                  <span className="font-semibold text-black dark:text-[#E7FE55]">{passedCount} Passed</span>
                </div>

                {scenarios.map((s) => {
                  const isSelected = selectedScenario?.id === s.id;
                  const isRunning = runningId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedScenario(s)}
                      className={`w-full text-left p-2.5 rounded-2xl border transition-all text-xs flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#E7FE55] border-black/20 text-black font-medium'
                          : 'bg-white dark:bg-[#131418] border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className="font-mono font-bold">{s.id}</span>
                          <span className="truncate">{s.name}</span>
                        </div>
                        <span className={`text-[10px] truncate block mt-0.5 ${isSelected ? 'text-black/75' : 'text-neutral-500 dark:text-neutral-400'}`}>
                          {s.prompt}
                        </span>
                      </div>

                      {/* Status indicator */}
                      <div className="shrink-0">
                        {isRunning ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : s.status === 'passed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : s.status === 'failed' ? (
                          <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 opacity-50" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Scenario Details & Execution Output */}
              <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#0D0E12] flex flex-col justify-between">
                {selectedScenario ? (
                  <div className="space-y-5">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F8D4FE] text-black">
                            {selectedScenario.id}
                          </span>
                          <h3 className="text-base font-semibold text-black dark:text-white">
                            {selectedScenario.name}
                          </h3>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRunScenario(selectedScenario.id)}
                        disabled={runningId !== null}
                        className="px-4 py-1.5 rounded-full bg-[#E7FE55] hover:opacity-90 disabled:opacity-40 text-black font-semibold text-xs flex items-center gap-1.5 transition-opacity shrink-0"
                      >
                        {runningId === selectedScenario.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Running...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Run Scenario</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Test Prompt */}
                    <div>
                      <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 block mb-1">
                        Input Test Prompt:
                      </span>
                      <div className="p-3 rounded-2xl bg-[#F2F4FE] dark:bg-[#141519] border border-black/10 dark:border-white/10 text-xs text-black dark:text-[#E7FE55] font-mono">
                        "{selectedScenario.prompt}"
                      </div>
                    </div>

                    {/* Expected Behaviour */}
                    <div>
                      <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 block mb-1">
                        Expected Behaviour:
                      </span>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 bg-[#F2F4FE] dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5 leading-relaxed">
                        {selectedScenario.expected_behaviour}
                      </p>
                    </div>

                    {/* Actual Output */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                          Actual Model Execution:
                        </span>
                        {selectedScenario.status !== 'not run' && (
                          <span
                            className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold ${
                              selectedScenario.status === 'passed'
                                ? 'bg-[#E7FE55] text-black'
                                : 'bg-red-500 text-white'
                            }`}
                          >
                            {selectedScenario.status}
                          </span>
                        )}
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#F2F4FE] dark:bg-[#0A0B0E] border border-black/10 dark:border-white/10 text-xs text-black dark:text-neutral-200 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                        {selectedScenario.actual_output || (
                          <span className="text-neutral-500 italic">
                            Click 'Run Scenario' to execute this test through the server pipeline.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rubric Scores */}
                    {selectedScenario.scores && (
                      <div className="p-4 rounded-2xl bg-[#F2F4FE] dark:bg-[#141519] border border-black/10 dark:border-white/10">
                        <span className="text-[11px] font-mono font-semibold text-black dark:text-[#E7FE55] block mb-2.5">
                          Rubric Evaluation Scores (0–2 scale)
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs tabular-nums">
                          {(['accuracy', 'clarity', 'scope', 'trust', 'privacy'] as const).map((key) => (
                            <div key={key} className="p-2 rounded-xl bg-white dark:bg-black/40 border border-black/5 dark:border-white/5">
                              <span className="text-[10px] text-neutral-500 capitalize block">{key}</span>
                              <span className="font-mono font-bold text-black dark:text-[#E7FE55] text-sm">
                                {selectedScenario.scores![key]}/2
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-neutral-500 text-xs py-12">
                    Select a scenario on the left to inspect its parameters.
                  </div>
                )}
              </div>
            </>
          ) : (
            /* System & Configuration Diagnostics Tab */
            <div className="p-6 space-y-5 overflow-y-auto w-full bg-white dark:bg-[#0D0E12]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#F2F4FE] dark:bg-[#141519] border border-black/10 dark:border-white/10 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-black dark:text-[#E7FE55]">
                    <Server className="w-4 h-4" />
                    Model &amp; Runtime Engine
                  </div>
                  <div className="text-xs space-y-1.5 text-neutral-700 dark:text-neutral-300">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Active Provider:</span>
                      <span className="font-mono font-semibold text-black dark:text-white">
                        {status?.active_provider === 'openrouter' ? 'OpenRouter' : 'Google AI Studio'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Configured Model:</span>
                      <span className="font-mono text-black dark:text-[#E7FE55]">{status?.model_name || 'gemini-3-flash-preview'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Google Gemini Key:</span>
                      <span className="font-mono text-black dark:text-white">
                        {status?.gemini_configured ? 'Active' : 'Not configured'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#F2F4FE] dark:bg-[#141519] border border-black/10 dark:border-white/10 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-black dark:text-[#E7FE55]">
                    <FileCode className="w-4 h-4" />
                    External Integrations
                  </div>
                  <div className="text-xs space-y-1.5 text-neutral-700 dark:text-neutral-300">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">TMDB &amp; Watchmode API:</span>
                      <span className="font-mono font-semibold text-black dark:text-[#E7FE55]">
                        {status?.tmdb_configured ? 'Connected (Live 2026+ Access)' : 'Optional'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Voice Synthesis:</span>
                      <span className="font-mono text-black dark:text-white">Gemini TTS + Web Speech</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#F2F4FE] dark:bg-[#131418] border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
          <div className="font-mono text-[11px] tabular-nums">
            Passed: {passedCount} &middot; Failed: {failedCount} &middot; Unrun: {unrunCount}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-full bg-black text-white dark:bg-[#E7FE55] dark:text-black font-semibold transition-opacity hover:opacity-90"
          >
            Close Lab
          </button>
        </div>
      </div>
    </div>
  );
};

