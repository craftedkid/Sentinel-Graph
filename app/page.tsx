"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { StatsOverview } from "@/components/StatsOverview";
import { ScenarioSelector } from "@/components/ScenarioSelector";
import { GraphCanvas } from "@/components/GraphCanvas";
import { CypherStudio } from "@/components/CypherStudio";
import { NodeInspectorModal } from "@/components/NodeInspectorModal";
import { SetupGuideModal } from "@/components/SetupGuideModal";
import { SchemaModal } from "@/components/SchemaModal";
import { DatabaseHealth, GraphNode, ScenarioDefinition, ScenarioExecutionResult } from "@/lib/types";
import { SCENARIO_DEFINITIONS } from "@/lib/db/queries";
import { ShieldCheck, AlertOctagon, Terminal, Network, BookOpen, Layers, Search, Sparkles, Filter, ExternalLink } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"scenarios" | "cypher" | "schema">("scenarios");
  const [health, setHealth] = useState<DatabaseHealth | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState(true);

  // Scenario execution state
  const [selectedScenario, setSelectedScenario] = useState<ScenarioDefinition>(SCENARIO_DEFINITIONS[0]);
  const [scenarioResult, setScenarioResult] = useState<ScenarioExecutionResult | null>(null);
  const [isScenarioLoading, setIsScenarioLoading] = useState(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);

  // Selected node for modal inspection
  const [inspectedNode, setInspectedNode] = useState<GraphNode | null>(null);

  // Modals
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

  // Table filter query
  const [tableFilter, setTableFilter] = useState("");

  // Fetch Database Health / Status
  const fetchHealth = useCallback(async () => {
    setIsHealthLoading(true);
    try {
      const res = await fetch("/api/health");
      const data: DatabaseHealth = await res.json();
      setHealth(data);
    } catch (err: any) {
      setHealth({
        status: "error",
        nodeCount: 0,
        relationshipCount: 0,
        nodeLabels: [],
        relationshipTypes: [],
        message: "Failed to query backend health endpoint.",
        errorDetail: err.message,
        lastChecked: new Date().toISOString(),
      });
    } finally {
      setIsHealthLoading(false);
    }
  }, []);

  // Execute scenario query
  const executeScenario = useCallback(
    async (scenario: ScenarioDefinition, params: Record<string, any>) => {
      setSelectedScenario(scenario);
      setIsScenarioLoading(true);
      setScenarioError(null);

      try {
        const res = await fetch("/api/scenarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenarioId: scenario.id, params }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to execute scenario");
        }
        setScenarioResult(data);
      } catch (err: any) {
        setScenarioError(err.message || "Failed to execute scenario");
      } finally {
        setIsScenarioLoading(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchHealth();
    executeScenario(SCENARIO_DEFINITIONS[0], SCENARIO_DEFINITIONS[0].defaultParams);
  }, [fetchHealth, executeScenario]);

  // Handle node selection from canvas
  const handleSelectNode = (node: GraphNode) => {
    setInspectedNode(node);
  };

  // Expand node neighborhood in graph
  const handleExpandNeighborhood = async (nodeId: string) => {
    try {
      const res = await fetch(`/api/graph/explore?nodeId=${encodeURIComponent(nodeId)}`);
      const data = await res.json();
      if (res.ok && data.graph && scenarioResult) {
        // Merge graph elements
        const existingNodeIds = new Set(scenarioResult.graph.nodes.map((n) => n.id));
        const newNodes = [...scenarioResult.graph.nodes];
        for (const n of data.graph.nodes) {
          if (!existingNodeIds.has(n.id)) {
            newNodes.push(n);
            existingNodeIds.add(n.id);
          }
        }

        const existingRelIds = new Set(scenarioResult.graph.relationships.map((r) => r.id));
        const newRels = [...scenarioResult.graph.relationships];
        for (const r of data.graph.relationships) {
          if (!existingRelIds.has(r.id)) {
            newRels.push(r);
            existingRelIds.add(r.id);
          }
        }

        setScenarioResult({
          ...scenarioResult,
          graph: { nodes: newNodes, relationships: newRels },
        });
      }
    } catch (e) {
      console.error("Failed to expand neighborhood:", e);
    }
  };

  const filteredTableResults = (scenarioResult?.tableResults || []).filter((row) => {
    if (!tableFilter) return true;
    const q = tableFilter.toLowerCase();
    return (
      row.id?.toLowerCase().includes(q) ||
      row.name?.toLowerCase().includes(q) ||
      row.labels?.toLowerCase().includes(q) ||
      row.status?.toLowerCase().includes(q)
    );
  });

  const isDemoModeActive = health?.status === "offline_demo" || scenarioResult?.isDemoMode;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#0b0f19]">
      {/* 1. Persistent Demo Mode Safety Warning Banner */}
      {isDemoModeActive && (
        <DemoModeBanner onOpenSetupGuide={() => setIsSetupGuideOpen(true)} />
      )}

      {/* 2. Header */}
      <Header
        health={health}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "schema") {
            setIsSchemaModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onRefreshHealth={fetchHealth}
        onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        isHealthLoading={isHealthLoading}
      />

      {/* 3. Main Dashboard Workspace */}
      <main className="max-w-7xl w-full mx-auto px-4 lg:px-6 py-6 flex-1 space-y-6">
        {/* Stats Overview Metric Cards */}
        <StatsOverview
          health={health}
          isLoading={isHealthLoading}
          onRetry={fetchHealth}
        />

        {/* Tab 1: Forensic Investigation Studio */}
        {activeTab === "scenarios" && (
          <div className="space-y-6">
            {/* Scenario Selector & Parameter Drawer */}
            <ScenarioSelector
              selectedScenarioId={selectedScenario.id}
              onSelectScenario={(sc, p) => executeScenario(sc, p)}
              isLoading={isScenarioLoading}
            />

            {/* Forensic Summary & Insight Callout */}
            {scenarioResult && !scenarioError && (
              <div className="p-4 rounded-xl bg-surface-100/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Forensic Intelligence Summary
                    </h4>
                    <div className="mt-1 space-y-1">
                      {scenarioResult.summary.insights.map((insight, idx) => (
                        <p key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                          <span className="text-sky-400 font-bold">•</span>
                          {insight}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">Risk Score</p>
                    <p className="text-lg font-black text-rose-400">{scenarioResult.summary.riskScore}/100</p>
                  </div>
                  <div className="text-right border-l border-slate-800 pl-3">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">Traversed</p>
                    <p className="text-lg font-black text-sky-400">{scenarioResult.summary.nodesFound} Nodes</p>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Graph Canvas */}
            <GraphCanvas
              graph={scenarioResult?.graph || null}
              isLoading={isScenarioLoading}
              error={scenarioError}
              onSelectNode={handleSelectNode}
              onRetry={() => executeScenario(selectedScenario, selectedScenario.defaultParams)}
            />

            {/* Tabular Findings Breakdown */}
            {scenarioResult && !scenarioError && scenarioResult.tableResults && (
              <div className="p-4 rounded-2xl bg-surface-100/90 border border-slate-800 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Flagged Entities ({filteredTableResults.length})
                    </h4>
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter entities..."
                      value={tableFilter}
                      onChange={(e) => setTableFilter(e.target.value)}
                      className="w-48 sm:w-64 pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead className="bg-slate-900 sticky top-0 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="p-2.5">Identifier</th>
                        <th className="p-2.5">Type / Label</th>
                        <th className="p-2.5">Name / Description</th>
                        <th className="p-2.5">Risk Score</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-200">
                      {filteredTableResults.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-2.5 font-bold text-sky-400">{row.id}</td>
                          <td className="p-2.5 text-purple-300">{row.labels}</td>
                          <td className="p-2.5 text-slate-200 font-sans">{row.name}</td>
                          <td className="p-2.5">
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                              {row.riskScore}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-300 font-sans">{row.status}</td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => {
                                const matched = scenarioResult.graph.nodes.find((n) => n.id === row.id);
                                if (matched) handleSelectNode(matched);
                              }}
                              className="px-2 py-1 text-[10px] font-semibold rounded bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-colors"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Cypher Studio */}
        {activeTab === "cypher" && <CypherStudio onSelectNode={handleSelectNode} />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-surface-100/60 py-4 px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            SentinelGraph • Built for <strong className="text-slate-300">Wexa AI Take-Home Assignment</strong> with{" "}
            <a
              href="https://console.cognodb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline"
            >
              CognoDB Cloud
            </a>{" "}
            (openCypher/Bolt Protocol)
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSchemaModalOpen(true)}
              className="hover:text-slate-200 transition-colors"
            >
              Schema &amp; Architecture
            </button>
            <button
              onClick={() => setIsSetupGuideOpen(true)}
              className="hover:text-slate-200 transition-colors"
            >
              Connection Guide
            </button>
            <a
              href="https://console.cognodb.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-200 transition-colors"
            >
              CognoDB Console
            </a>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <NodeInspectorModal
        node={inspectedNode}
        onClose={() => setInspectedNode(null)}
        onExpandNeighborhood={handleExpandNeighborhood}
      />

      <SetupGuideModal
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
      />

      <SchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />
    </div>
  );
}
