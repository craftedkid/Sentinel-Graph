"use client";

import React from "react";
import { DatabaseHealth } from "@/lib/types";
import { Network, Link2, ShieldCheck, Zap, AlertTriangle, RefreshCw } from "lucide-react";

interface StatsOverviewProps {
  health: DatabaseHealth | null;
  isLoading: boolean;
  onRetry: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ health, isLoading, onRetry }) => {
  // 1. Loading State (Skeletons)
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-surface-100/60 border border-slate-800/80 animate-pulse flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-700/60 rounded"></div>
              <div className="h-6 w-16 bg-slate-700 rounded"></div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-700/50"></div>
          </div>
        ))}
      </div>
    );
  }

  // 2. Error State
  if (health?.status === "error") {
    return (
      <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-rose-300">CognoDB Connection Error</h4>
            <p className="text-xs text-rose-300/80">
              {health.errorDetail || "Could not connect to the specified Bolt instance. Verify credentials and network access."}
            </p>
          </div>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
      </div>
    );
  }

  // 3. Normal / Demo Mode State
  const nodeCount = health?.nodeCount ?? 0;
  const relCount = health?.relationshipCount ?? 0;
  const latency = health?.latencyMs !== undefined ? `${health.latencyMs}ms` : "Simulated (12ms)";
  const isDemo = health?.status === "offline_demo";

  const cards = [
    {
      label: "Graph Entities",
      value: nodeCount > 0 ? nodeCount.toLocaleString() : isDemo ? "29 Nodes" : "0 Nodes",
      sub: "Accounts, Persons, Devices, Companies",
      icon: Network,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
    {
      label: "Graph Relationships",
      value: relCount > 0 ? relCount.toLocaleString() : isDemo ? "38 Edges" : "0 Edges",
      sub: "Transfers, Ownerships, Device Links",
      icon: Link2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Forensic Patterns",
      value: "5 Typologies",
      sub: "Cycles, Synthetics, Mules, Sanctions, UBO",
      icon: ShieldCheck,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "Bolt Query Latency",
      value: latency,
      sub: isDemo ? "In-Memory Simulation Mode" : "Live CognoDB Bolt Protocol",
      icon: Zap,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-xl bg-surface-100/80 border ${c.border} flex items-center justify-between hover:border-slate-700 transition-colors shadow-sm`}
          >
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{c.label}</p>
              <h3 className="text-xl font-bold text-white mt-1 tracking-tight">{c.value}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[140px] sm:max-w-[180px]">{c.sub}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${c.bg} ${c.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
