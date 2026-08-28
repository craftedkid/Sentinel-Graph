"use client";

import React, { useState } from "react";
import { Terminal, Play, RotateCcw, Copy, Check, Table, Code, Layers, AlertTriangle, Sparkles, Clock, FileCode2 } from "lucide-react";
import { CypherExecutionResult, GraphNode } from "@/lib/types";
import { GraphCanvas } from "./GraphCanvas";

const CYPHER_TEMPLATES = [
  {
    name: "1. Detect 4-Hop Money Laundering Cycles",
    cypher: `MATCH path = (a1:Account)-[:TRANSFERRED]->(a2:Account)-[:TRANSFERRED]->(a3:Account)-[:TRANSFERRED]->(a4:Account)-[:TRANSFERRED]->(a1)
RETURN path, [n IN nodes(path) | n.account_id] AS ringAccounts, reduce(total = 0, r IN relationships(path) | total + r.amount) AS totalVolume
ORDER BY totalVolume DESC
LIMIT 10`,
  },
  {
    name: "2. Uncover Synthetic Identity Clusters",
    cypher: `MATCH (p1:Person)-[r1:HAS_IDENTIFIER|USES_DEVICE]->(shared)<-[r2:HAS_IDENTIFIER|USES_DEVICE]-(p2:Person)
WHERE id(p1) < id(p2)
RETURN p1.name AS Person1, labels(shared)[0] AS SharedType, coalesce(shared.ssn, shared.device_fingerprint, shared.phone_number) AS SharedValue, p2.name AS Person2
LIMIT 20`,
  },
  {
    name: "3. Shortest Path to OFAC Sanctioned Entity",
    cypher: `MATCH (target:Account {account_id: 'ACC-TARGET-UNDER-REVIEW'})
MATCH (sanctioned:SanctionedEntity)
MATCH path = shortestPath((target)-[:TRANSFERRED|CONTROLS|BENEFICIAL_OWNER_OF*1..5]-(sanctioned))
RETURN path, length(path) AS distance`,
  },
  {
    name: "4. Multi-Tier Offshore UBO Ownership Chain",
    cypher: `MATCH path = (c:Company)-[:OWNED_BY*1..6]->(u:Person)
RETURN c.name AS OperatingCompany, [n IN nodes(path) | coalesce(n.name, n.company_name)] AS Chain, u.name AS UltimateOwner, length(path) AS Depth
ORDER BY Depth DESC
LIMIT 10`,
  },
  {
    name: "5. Label & Relationship Summary",
    cypher: `MATCH (n)
RETURN labels(n)[0] AS Label, count(n) AS EntityCount
ORDER BY EntityCount DESC`,
  },
];

interface CypherStudioProps {
  onSelectNode: (node: GraphNode) => void;
}

export const CypherStudio: React.FC<CypherStudioProps> = ({ onSelectNode }) => {
  const [cypher, setCypher] = useState(CYPHER_TEMPLATES[0].cypher);
  const [result, setResult] = useState<CypherExecutionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<"graph" | "table" | "json">("graph");
  const [copied, setCopied] = useState(false);

  const handleRunQuery = async (queryToRun?: string) => {
    const q = queryToRun || cypher;
    if (!q.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/cypher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cypher: q, params: {} }),
      });
      const data = await res.json();
      setResult(data);
      if (data.graph && data.graph.nodes.length > 0) {
        setActiveView("graph");
      } else {
        setActiveView("table");
      }
    } catch (err: any) {
      setResult({
        cypher: q,
        params: {},
        executionTimeMs: 0,
        graph: { nodes: [], relationships: [] },
        records: [],
        columns: [],
        isDemoMode: false,
        error: err.message || "Failed to execute Cypher query",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCypher = () => {
    navigator.clipboard.writeText(cypher);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectTemplate = (tplCypher: string) => {
    setCypher(tplCypher);
    handleRunQuery(tplCypher);
  };

  return (
    <div className="space-y-4">
      {/* Editor Panel */}
      <div className="p-4 rounded-2xl bg-surface-100/90 border border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">Interactive openCypher Console</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Bolt 5.x</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Templates Dropdown */}
            <div className="relative">
              <select
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>
                  💡 Load Sample Cypher Query...
                </option>
                {CYPHER_TEMPLATES.map((t, idx) => (
                  <option key={idx} value={t.cypher}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCopyCypher}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
              title="Copy Cypher Query"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            <button
              onClick={() => handleRunQuery()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-lg shadow-md shadow-sky-500/20 transition-all disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Running..." : "Execute (Ctrl+Enter)"}</span>
            </button>
          </div>
        </div>

        {/* Textarea Editor */}
        <div className="relative font-mono text-xs">
          <textarea
            value={cypher}
            onChange={(e) => setCypher(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleRunQuery();
              }
            }}
            rows={5}
            placeholder="MATCH (n) RETURN n LIMIT 25"
            className="w-full p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sky-200 font-mono text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 leading-relaxed resize-y"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Results Workspace */}
      <div className="p-4 rounded-2xl bg-surface-100/90 border border-slate-800 shadow-sm space-y-3">
        {/* Results Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Query Output</h4>
            {result && !result.error && (
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-mono text-emerald-400">
                  <Clock className="w-3 h-3" />
                  {result.executionTimeMs}ms
                </span>
                <span>•</span>
                <span className="font-mono text-sky-400">{result.records.length} records</span>
                {result.isDemoMode && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400 font-semibold">(Simulated Mode)</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveView("graph")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                activeView === "graph"
                  ? "bg-sky-500 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Graph View
            </button>
            <button
              onClick={() => setActiveView("table")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                activeView === "table"
                  ? "bg-sky-500 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Table
            </button>
            <button
              onClick={() => setActiveView("json")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                activeView === "json"
                  ? "bg-sky-500 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              JSON
            </button>
          </div>
        </div>

        {/* 1. Loading State */}
        {isLoading && (
          <div className="h-[400px] flex flex-col items-center justify-center space-y-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="w-12 h-12 rounded-full border-2 border-sky-500/30 border-t-sky-400 animate-spin" />
            <p className="text-xs text-slate-300 font-mono">Executing query on CognoDB instance...</p>
          </div>
        )}

        {/* 2. Error State */}
        {!isLoading && result?.error && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Cypher Execution Error</span>
            </div>
            <pre className="text-xs text-rose-300/90 font-mono whitespace-pre-wrap bg-slate-950/80 p-3 rounded-lg border border-rose-900/30">
              {result.error}
            </pre>
          </div>
        )}

        {/* 3. Empty State (before first run) */}
        {!isLoading && !result && (
          <div className="h-[320px] flex flex-col items-center justify-center text-center p-6 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
            <div className="p-3 rounded-xl bg-slate-800/60 text-slate-400 mb-2">
              <FileCode2 className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">No Query Executed Yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Click &ldquo;Execute&rdquo; above or choose a pre-loaded template to query the graph and inspect findings.
            </p>
          </div>
        )}

        {/* 4. Active Results View */}
        {!isLoading && result && !result.error && (
          <div>
            {activeView === "graph" && (
              <GraphCanvas
                graph={result.graph}
                isLoading={false}
                onSelectNode={onSelectNode}
              />
            )}

            {activeView === "table" && (
              <div className="max-h-[460px] overflow-auto rounded-xl border border-slate-800">
                {result.records.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">0 records returned</div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead className="bg-slate-900/90 sticky top-0 border-b border-slate-800 text-slate-300">
                      <tr>
                        {result.columns.map((col, idx) => (
                          <th key={idx} className="p-3 font-semibold text-sky-400">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/60 text-slate-200">
                      {result.records.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                          {result.columns.map((col, cIdx) => (
                            <td key={cIdx} className="p-3 truncate max-w-xs">
                              {typeof row[col] === "object" ? JSON.stringify(row[col]) : String(row[col] ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeView === "json" && (
              <pre className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-emerald-300 max-h-[460px] overflow-auto">
                {JSON.stringify(result.records, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
