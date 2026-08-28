"use client";

import React, { useState } from "react";
import { ShieldAlert, Database, RefreshCw, BookOpen, Terminal, Network, Info, CheckCircle2, AlertCircle, Cpu } from "lucide-react";
import { ConnectionStatus, DatabaseHealth } from "@/lib/types";

interface HeaderProps {
  health: DatabaseHealth | null;
  activeTab: "scenarios" | "cypher" | "schema";
  onTabChange: (tab: "scenarios" | "cypher" | "schema") => void;
  onRefreshHealth: () => void;
  onOpenSetupGuide: () => void;
  onOpenSchemaModal: () => void;
  isHealthLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  activeTab,
  onTabChange,
  onRefreshHealth,
  onOpenSetupGuide,
  onOpenSchemaModal,
  isHealthLoading,
}) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const handleSeedDatabase = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    setSeedMessage(null);

    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setSeedMessage("✅ Database successfully seeded!");
        onRefreshHealth();
      } else {
        setSeedMessage(`❌ ${data.message || data.error || "Seed failed"}`);
      }
    } catch (err: any) {
      setSeedMessage(`❌ Seed error: ${err.message}`);
    } finally {
      setIsSeeding(false);
      setTimeout(() => setSeedMessage(null), 5000);
    }
  };

  const status: ConnectionStatus = health?.status || "offline_demo";

  return (
    <header className="bg-surface-100/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20 text-white">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Sentinel<span className="text-sky-400">Graph</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 rounded border border-slate-700">
                CognoDB Edition
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Anti-Money Laundering & Financial Crime Graph Intelligence
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => onTabChange("scenarios")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "scenarios"
                ? "bg-sky-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Forensics Studio
          </button>
          <button
            onClick={() => onTabChange("cypher")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "cypher"
                ? "bg-sky-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Cypher Studio
          </button>
          <button
            onClick={() => onTabChange("schema")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "schema"
                ? "bg-sky-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Schema & Why Graph
          </button>
        </nav>

        {/* Status Indicators & Action Tools */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          {/* 3-State Connection Status Badge */}
          {status === "connected" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CognoDB Connected</span>
              {health?.latencyMs !== undefined && (
                <span className="text-[10px] text-emerald-300/70 font-mono">({health.latencyMs}ms)</span>
              )}
            </div>
          )}

          {status === "offline_demo" && (
            <div
              onClick={onOpenSetupGuide}
              className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-colors"
              title="Click to view instructions for connecting live CognoDB instance"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Demo Mode (Offline)</span>
              <Info className="w-3 h-3 text-amber-400/80" />
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Connection Error</span>
              <button
                onClick={onRefreshHealth}
                className="ml-1 px-1.5 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-[10px] uppercase tracking-wider font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Seed Button */}
          <button
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors disabled:opacity-50"
            title="Seed CognoDB database with realistic AML graph data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? "animate-spin text-sky-400" : ""}`} />
            <span>{isSeeding ? "Seeding..." : "Seed Data"}</span>
          </button>

          {/* Setup Guide Button */}
          <button
            onClick={onOpenSetupGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-medium transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>Setup Guide</span>
          </button>
        </div>
      </div>

      {seedMessage && (
        <div className="max-w-7xl mx-auto mt-2 px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center justify-between animate-fadeIn">
          <span>{seedMessage}</span>
          <button onClick={() => setSeedMessage(null)} className="text-slate-400 hover:text-slate-200">
            ×
          </button>
        </div>
      )}
    </header>
  );
};
