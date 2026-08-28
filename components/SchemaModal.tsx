"use client";

import React from "react";
import { X, Network, Database, Sparkles, AlertTriangle, Layers, GitBranch, ArrowRight } from "lucide-react";

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaModal: React.FC<SchemaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] bg-surface-100 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-surface-200/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Graph Data Model &amp; Technical Architecture
              </h3>
              <p className="text-xs text-slate-400">
                Entity relationships, schema topology, and &ldquo;Why a Graph Database?&rdquo;
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs leading-relaxed">
          {/* Why Graph Database Section */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-purple-950/40 border border-sky-800/40 space-y-2">
            <div className="flex items-center gap-2 text-sky-300 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Why a Graph Database for AML &amp; Financial Crime?</span>
            </div>
            <p className="text-slate-300">
              Financial crime topology is inherently a <strong>network problem</strong>. Criminal syndicates intentionally obscure illicit fund flows by layering transactions through multi-hop chains, synthesizing fake identities across shared identifiers, routing smurfed funds through mule hubs, and hiding ultimate ownership behind offshore holding trees.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-2 border-t border-slate-800">
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/40 space-y-1">
                <span className="font-bold text-rose-300">Relational SQL Limitations:</span>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  <li>N-hop path traversal requires N self-joins, causing exponential execution time.</li>
                  <li>Cycle detection in SQL requires recursive CTEs that explode in memory.</li>
                  <li>Bipartite identity matching generates massive intermediate Cartesian products.</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/40 space-y-1">
                <span className="font-bold text-emerald-300">CognoDB / openCypher Advantage:</span>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  <li>Index-free adjacency provides \(O(1)\) pointer chasing per relationship step.</li>
                  <li>Native cycle matching <code className="text-emerald-300 font-mono">(a)-[:TRANSFERRED*3..6]-&gt;(a)</code> runs in milliseconds.</li>
                  <li>Built-in <code className="text-emerald-300 font-mono">shortestPath()</code> algorithms find sanction proximity instantly.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Graph Schema Topology Visualization */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-sky-400" />
              <span>Graph Schema Topology &amp; Node Labels</span>
            </h4>

            {/* Visual ASCII / Diagram Schema */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto space-y-2">
              <div className="text-sky-400 font-bold">// Visual Schema Diagram:</div>
              <div className="text-slate-300">
                {`  (:Person) ──[:CONTROLS]──────────> (:Account) ──[:TRANSFERRED]──> (:Account)`}
              </div>
              <div className="text-slate-300">
                {`      │                                   │                           │`}
              </div>
              <div className="text-slate-300">
                {` [:HAS_IDENTIFIER / USES_DEVICE]    [:OWNED_BY]                 [:TRANSFERRED]`}
              </div>
              <div className="text-slate-300">
                {`      ▼                                   ▼                           ▼`}
              </div>
              <div className="text-slate-300">
                {`(:SSN / :Phone / :Device)            (:Company) ──[:OWNED_BY*]──> (:Person [UBO])`}
              </div>
              <div className="text-slate-300">
                {`                                          ▲`}
              </div>
              <div className="text-slate-300">
                {`                                   [:BENEFICIAL_OWNER_OF]`}
              </div>
              <div className="text-slate-300">
                {`                                          │`}
              </div>
              <div className="text-slate-300">
                {`                                 (:SanctionedEntity)`}
              </div>
            </div>
          </div>

          {/* Labeled Nodes & Relationships Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Node Labels</h5>
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-2.5">Label</th>
                      <th className="p-2.5">Key Properties</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-200">
                    <tr>
                      <td className="p-2.5 font-bold text-sky-400">:Account</td>
                      <td className="p-2.5 text-slate-400 font-mono text-[10px]">account_id, balance, risk_score, status, country</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-purple-400">:Person</td>
                      <td className="p-2.5 text-slate-400 font-mono text-[10px]">person_id, name, synthetic_prob, pep_status</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-amber-400">:Company</td>
                      <td className="p-2.5 text-slate-400 font-mono text-[10px]">company_id, name, jurisdiction, tax_haven</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-emerald-400">:Identifier</td>
                      <td className="p-2.5 text-slate-400 font-mono text-[10px]">ssn, phone_number, device_fingerprint, ip</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-rose-400">:SanctionedEntity</td>
                      <td className="p-2.5 text-slate-400 font-mono text-[10px]">entity_id, name, sanction_program, country</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Typed Relationships</h5>
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Topology &amp; Properties</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-200">
                    <tr>
                      <td className="p-2.5 font-bold text-sky-400">-[:TRANSFERRED]-&gt;</td>
                      <td className="p-2.5 text-slate-400 font-mono text-[10px]">amount, currency, timestamp, tx_id</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-amber-400">-[:OWNED_BY]-&gt;</td>
                      <td className="p-2.5 text-slate-400 font-mono text-[10px]">equity_percent, role</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-emerald-400">-[:HAS_IDENTIFIER]-&gt;</td>
                      <td className="p-2.5 text-slate-400 font-mono text-[10px]">verified, primary</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-purple-400">-[:CONTROLS]-&gt;</td>
                      <td className="p-2.5 text-slate-400 font-mono text-[10px]">since, ownership_percent</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-rose-400">-[:BENEFICIAL_OWNER_OF]-&gt;</td>
                      <td className="p-2.5 text-slate-400 font-mono text-[10px]">share_pct, direct</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-surface-200/50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-sky-500 text-white hover:bg-sky-400 transition-colors"
          >
            Close Schema
          </button>
        </div>
      </div>
    </div>
  );
};
