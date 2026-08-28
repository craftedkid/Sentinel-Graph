"use client";

import React, { useState } from "react";
import { SCENARIO_DEFINITIONS } from "@/lib/db/queries";
import { ScenarioDefinition } from "@/lib/types";
import { Play, Sliders, ChevronDown, ChevronUp, AlertCircle, Sparkles, Database, Layers, ArrowRight } from "lucide-react";

interface ScenarioSelectorProps {
  selectedScenarioId: string;
  onSelectScenario: (scenario: ScenarioDefinition, params: Record<string, any>) => void;
  isLoading: boolean;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  selectedScenarioId,
  onSelectScenario,
  isLoading,
}) => {
  const selectedScenario =
    SCENARIO_DEFINITIONS.find((s) => s.id === selectedScenarioId) || SCENARIO_DEFINITIONS[0];

  const [params, setParams] = useState<Record<string, any>>(selectedScenario.defaultParams);
  const [showRelationalComparison, setShowRelationalComparison] = useState(false);

  const handleScenarioClick = (scenario: ScenarioDefinition) => {
    setParams(scenario.defaultParams);
    onSelectScenario(scenario, scenario.defaultParams);
  };

  const handleParamChange = (key: string, value: any, type: string) => {
    const parsed = type === "number" ? Number(value) : value;
    const updated = { ...params, [key]: parsed };
    setParams(updated);
  };

  const handleExecute = () => {
    onSelectScenario(selectedScenario, params);
  };

  return (
    <div className="space-y-4">
      {/* Scenario Pills / Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {SCENARIO_DEFINITIONS.map((scenario) => {
          const isSelected = scenario.id === selectedScenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => handleScenarioClick(scenario)}
              className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? "bg-surface-200 border-sky-500 shadow-md shadow-sky-500/10 ring-1 ring-sky-500/50"
                  : "bg-surface-100/70 border-slate-800 hover:border-slate-700 hover:bg-surface-100"
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-12 h-12 bg-sky-500/10 rounded-bl-full pointer-events-none" />
              )}
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      scenario.riskLevel === "CRITICAL"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {scenario.badge}
                  </span>
                  <span className="text-[10px] text-slate-400">{scenario.category}</span>
                </div>
                <h4
                  className={`text-xs font-bold line-clamp-2 leading-snug ${
                    isSelected ? "text-sky-300" : "text-slate-200"
                  }`}
                >
                  {scenario.title}
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{scenario.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Scenario Active Panel */}
      <div className="p-4 rounded-xl bg-surface-100/90 border border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {selectedScenario.title}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium">
                {selectedScenario.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{selectedScenario.description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowRelationalComparison(!showRelationalComparison)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>{showRelationalComparison ? "Hide SQL vs Graph" : "Why Graph vs SQL?"}</span>
              {showRelationalComparison ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={handleExecute}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-lg shadow-md shadow-sky-500/20 transition-all disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Traversing..." : "Run Cypher Query"}</span>
            </button>
          </div>
        </div>

        {/* Relational SQL vs openCypher Deep Dive Collapse */}
        {showRelationalComparison && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs animate-fadeIn">
            <div className="p-3 rounded bg-rose-950/20 border border-rose-900/40 text-rose-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-rose-300">
                <AlertCircle className="w-4 h-4" />
                <span>The Relational SQL Bottleneck</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{selectedScenario.relationalProblem}</p>
            </div>

            <div className="p-3 rounded bg-emerald-950/20 border border-emerald-900/40 text-emerald-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
                <Sparkles className="w-4 h-4" />
                <span>The openCypher / CognoDB Superpower</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{selectedScenario.graphSuperpower}</p>
            </div>
          </div>
        )}

        {/* Parameter Adjusters */}
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold uppercase tracking-wider text-slate-300">Query Parameters:</span>
          </div>

          {Object.entries(selectedScenario.paramDescriptions).map(([key, desc]) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <label htmlFor={key} className="text-slate-400 whitespace-nowrap font-medium">
                {desc.label}:
              </label>
              <input
                id={key}
                type={desc.type === "number" ? "number" : "text"}
                value={params[key] !== undefined ? params[key] : desc.default}
                onChange={(e) => handleParamChange(key, e.target.value, desc.type)}
                className="w-24 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
