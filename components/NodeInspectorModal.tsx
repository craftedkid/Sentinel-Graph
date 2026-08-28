"use client";

import React, { useEffect, useState } from "react";
import { GraphNode, GraphData } from "@/lib/types";
import { X, ShieldAlert, User, Building, CreditCard, Cpu, Hash, Phone, Globe, ExternalLink, Network, CheckCircle, AlertTriangle } from "lucide-react";

interface NodeInspectorModalProps {
  node: GraphNode | null;
  onClose: () => void;
  onExpandNeighborhood?: (nodeId: string) => void;
}

export const NodeInspectorModal: React.FC<NodeInspectorModalProps> = ({
  node,
  onClose,
  onExpandNeighborhood,
}) => {
  const [neighborData, setNeighborData] = useState<GraphData | null>(null);
  const [isLoadingNeighbors, setIsLoadingNeighbors] = useState(false);
  const [flaggedStatus, setFlaggedStatus] = useState<boolean>(false);

  useEffect(() => {
    if (!node) {
      setNeighborData(null);
      setFlaggedStatus(false);
      return;
    }

    // Fetch 1-hop connected neighbors
    const fetchNeighbors = async () => {
      setIsLoadingNeighbors(true);
      try {
        const res = await fetch(`/api/graph/explore?nodeId=${encodeURIComponent(node.id)}`);
        const data = await res.json();
        if (res.ok && data.graph) {
          setNeighborData(data.graph);
        }
      } catch (e) {
        console.error("Failed to fetch neighborhood:", e);
      } finally {
        setIsLoadingNeighbors(false);
      }
    };

    fetchNeighbors();
  }, [node]);

  if (!node) return null;

  const props = node.properties;
  const labels = node.labels;
  const riskScore = props.risk_score || (props.synthetic_probability ? Math.round(props.synthetic_probability * 100) : 15);
  const isHighRisk = riskScore >= 75 || labels.includes("SanctionedEntity");

  const getNodeIcon = () => {
    if (labels.includes("SanctionedEntity")) return <ShieldAlert className="w-5 h-5 text-rose-400" />;
    if (labels.includes("Person")) return <User className="w-5 h-5 text-purple-400" />;
    if (labels.includes("Company")) return <Building className="w-5 h-5 text-amber-400" />;
    if (labels.includes("Device")) return <Cpu className="w-5 h-5 text-emerald-400" />;
    if (labels.includes("SSN") || labels.includes("Identifier")) return <Hash className="w-5 h-5 text-emerald-400" />;
    if (labels.includes("Phone")) return <Phone className="w-5 h-5 text-emerald-400" />;
    if (labels.includes("IPAddress")) return <Globe className="w-5 h-5 text-emerald-400" />;
    return <CreditCard className="w-5 h-5 text-sky-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md h-full bg-surface-100 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-surface-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-700">
              {getNodeIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {labels.join(", ")}
                </span>
                {isHighRisk && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    CRITICAL RISK
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white mt-0.5 truncate max-w-[240px]">
                {props.name || props.owner_name || props.company_name || props.account_id || node.id}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Risk Score Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Compliance Risk Score</p>
              <h4
                className={`text-2xl font-black mt-0.5 ${
                  riskScore >= 80 ? "text-rose-400" : riskScore >= 50 ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {riskScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </h4>
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  riskScore >= 80
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                {riskScore >= 80 ? "SAR Required" : "Monitored"}
              </span>
            </div>
          </div>

          {/* Key Properties Grid */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Entity Properties
            </h4>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 font-mono">
              {Object.entries(props).map(([key, val]) => (
                <div key={key} className="flex items-start justify-between gap-2 border-b border-slate-800/60 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-slate-400 font-medium">{key}:</span>
                  <span className="text-slate-200 text-right truncate max-w-[200px]">
                    {typeof val === "object" ? JSON.stringify(val) : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Relationships Subgraph */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Hop Connected Neighbors ({neighborData?.nodes.length || 0})
              </h4>
              {isLoadingNeighbors && <span className="text-[10px] text-sky-400">Loading...</span>}
            </div>

            {neighborData && neighborData.relationships.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {neighborData.relationships.map((rel) => {
                  const targetId = rel.startNodeId === node.id ? rel.endNodeId : rel.startNodeId;
                  const direction = rel.startNodeId === node.id ? "OUTFLOW" : "INFLOW";
                  return (
                    <div
                      key={rel.id}
                      className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            direction === "OUTFLOW"
                              ? "bg-sky-500/20 text-sky-300"
                              : "bg-purple-500/20 text-purple-300"
                          }`}
                        >
                          {rel.type}
                        </span>
                        <span className="text-slate-300 font-mono">{targetId}</span>
                      </div>
                      {rel.properties.amount && (
                        <span className="font-mono text-emerald-400 font-semibold">
                          ${Number(rel.properties.amount).toLocaleString()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 italic text-[11px]">No direct 1-hop links found.</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-surface-200/50 flex items-center justify-between gap-3">
          <button
            onClick={() => setFlaggedStatus(!flaggedStatus)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              flaggedStatus
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
            }`}
          >
            {flaggedStatus ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            <span>{flaggedStatus ? "Flagged for SAR" : "Flag for Escalation"}</span>
          </button>

          {onExpandNeighborhood && (
            <button
              onClick={() => onExpandNeighborhood(node.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-sky-500 text-white hover:bg-sky-400 transition-colors shadow"
            >
              <Network className="w-3.5 h-3.5" />
              <span>Expand in Canvas</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
