"use client";

import React, { useEffect, useRef, useState } from "react";
import cytoscape, { Core, EventObject } from "cytoscape";
import cola from "cytoscape-cola";
import { GraphData, GraphNode } from "@/lib/types";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, AlertTriangle, Layers, Eye, ShieldAlert, Cpu } from "lucide-react";

// Register cytoscape layout plugin once
if (typeof window !== "undefined") {
  try {
    cytoscape.use(cola);
  } catch (e) {}
}

interface GraphCanvasProps {
  graph: GraphData | null;
  isLoading: boolean;
  error?: string | null;
  onSelectNode: (node: GraphNode) => void;
  onRetry?: () => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graph,
  isLoading,
  error,
  onSelectNode,
  onRetry,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Initialize or update Cytoscape instance
  useEffect(() => {
    if (!containerRef.current || isLoading || error || !graph || graph.nodes.length === 0) {
      return;
    }

    // Convert GraphData into Cytoscape elements
    const elements: any[] = [];

    // Helper for node colors & shapes
    const getNodeStyle = (labels: string[], props: Record<string, any>) => {
      if (labels.includes("SanctionedEntity")) {
        return { bg: "#f43f5e", border: "#fda4af", shape: "hexagon", label: props.name || "Sanctioned" };
      }
      if (labels.includes("Person")) {
        return { bg: "#a855f7", border: "#d8b4fe", shape: "ellipse", label: props.name || "Person" };
      }
      if (labels.includes("Company")) {
        return { bg: "#f59e0b", border: "#fde68a", shape: "round-rectangle", label: props.name || props.company_name || "Company" };
      }
      if (labels.includes("SSN") || labels.includes("Phone") || labels.includes("Device") || labels.includes("IPAddress") || labels.includes("Identifier")) {
        return { bg: "#10b981", border: "#6ee7b7", shape: "diamond", label: props.ssn || props.phone_number || props.device_fingerprint || props.ip_address || "Identifier" };
      }
      // Default: Account
      const risk = props.risk_score || 0;
      const isHighRisk = risk >= 80;
      return {
        bg: isHighRisk ? "#0284c7" : "#0284c7",
        border: isHighRisk ? "#38bdf8" : "#93c5fd",
        shape: "ellipse",
        label: props.account_id || props.owner_name || "Account",
      };
    };

    // Add Nodes
    for (const node of graph.nodes) {
      const style = getNodeStyle(node.labels, node.properties);
      elements.push({
        group: "nodes",
        data: {
          id: node.id,
          label: style.label,
          fullLabel: `${style.label}\n(${node.labels.join(", ")})`,
          labels: node.labels,
          properties: node.properties,
          bgColor: style.bg,
          borderColor: style.border,
          shape: style.shape,
          risk: node.properties.risk_score || 0,
        },
      });
    }

    // Add Edges
    for (const rel of graph.relationships) {
      let edgeLabel = rel.type;
      if (rel.properties.amount) {
        edgeLabel = `$${Number(rel.properties.amount).toLocaleString()}`;
      } else if (rel.properties.equity_percent) {
        edgeLabel = `${rel.properties.equity_percent}%`;
      }

      elements.push({
        group: "edges",
        data: {
          id: rel.id,
          source: rel.startNodeId,
          target: rel.endNodeId,
          label: edgeLabel,
          type: rel.type,
          properties: rel.properties,
        },
      });
    }

    // Clean up previous instance
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "data(bgColor)",
            "border-color": "data(borderColor)",
            "border-width": 2,
            "border-opacity": 0.9,
            shape: "data(shape)" as any,
            width: 44,
            height: 44,
            label: "data(label)",
            color: "#f8fafc",
            "font-size": "10px",
            "font-weight": "bold",
            "text-valign": "bottom",
            "text-margin-y": 6,
            "text-outline-color": "#0b0f19",
            "text-outline-width": 2,
            "text-max-width": "100px",
            "text-wrap": "ellipsis",
            "transition-property": "background-color, border-color, border-width, width, height",
            "transition-duration": 0.2,
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-color": "#38bdf8",
            "border-width": 4,
            width: 52,
            height: 52,
          } as any,
        },
        {
          selector: "edge",
          style: {
            width: 2.2,
            "line-color": "#475569",
            "target-arrow-color": "#475569",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            label: "data(label)",
            color: "#94a3b8",
            "font-size": "9px",
            "text-rotation": "autorotate",
            "text-background-color": "#0b0f19",
            "text-background-opacity": 0.85,
            "text-background-padding": "2px",
            "text-background-shape": "roundrectangle",
            "arrow-scale": 1.2,
          },
        },
        {
          selector: "edge[type = 'TRANSFERRED']",
          style: {
            "line-color": "#38bdf8",
            "target-arrow-color": "#38bdf8",
            width: 2.6,
          },
        },
        {
          selector: "edge[type = 'BENEFICIAL_OWNER_OF'], edge[type = 'OWNED_BY']",
          style: {
            "line-color": "#f59e0b",
            "target-arrow-color": "#f59e0b",
            "line-style": "dashed",
          },
        },
        {
          selector: "edge[type = 'HAS_IDENTIFIER'], edge[type = 'USES_DEVICE'], edge[type = 'LOGS_FROM_IP']",
          style: {
            "line-color": "#10b981",
            "target-arrow-color": "#10b981",
          },
        },
        {
          selector: "edge:selected",
          style: {
            "line-color": "#38bdf8",
            "target-arrow-color": "#38bdf8",
            width: 4,
          },
        },
      ],
      layout: {
        name: "cola",
        animate: true,
        randomize: false,
        maxSimulationTime: 2000,
        nodeSpacing: 45,
        edgeLength: 120,
      } as any,
      minZoom: 0.2,
      maxZoom: 3.0,
      wheelSensitivity: 0.3,
    });

    // Handle node selection event
    cy.on("tap", "node", (evt: EventObject) => {
      const nodeElem = evt.target;
      const id = nodeElem.id();
      setSelectedElement(id);
      const clickedNode = graph.nodes.find((n) => n.id === id);
      if (clickedNode) {
        onSelectNode(clickedNode);
      }
    });

    cy.on("tap", (evt: EventObject) => {
      if (evt.target === cy) {
        setSelectedElement(null);
      }
    });

    cyRef.current = cy;

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [graph, isLoading, error, onSelectNode]);

  // Canvas Control Handlers
  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(undefined, 40);
  const handleResetLayout = () => {
    if (cyRef.current) {
      cyRef.current
        .layout({
          name: "cola",
          animate: true,
          nodeSpacing: 45,
          edgeLength: 120,
        } as any)
        .run();
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="relative w-full h-[520px] rounded-2xl bg-surface-100/90 border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-sky-500/30 border-t-sky-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-sky-400 animate-pulse" />
          </div>
        </div>
        <h4 className="text-sm font-semibold text-slate-200 mt-4 tracking-tight">
          Executing openCypher Graph Traversal...
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
          Querying CognoDB Cloud via Bolt protocol to isolate multi-hop risk topology.
        </p>
      </div>
    );
  }

  // 2. Error State (mid-session error)
  if (error) {
    return (
      <div className="relative w-full h-[520px] rounded-2xl bg-surface-100/90 border border-rose-500/30 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-3 rounded-full bg-rose-500/20 text-rose-400 mb-3">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h4 className="text-base font-bold text-rose-300">Graph Query Error</h4>
        <p className="text-xs text-rose-200/80 mt-1 max-w-md">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow"
          >
            Retry Query
          </button>
        )}
      </div>
    );
  }

  // 3. Empty State
  if (!graph || graph.nodes.length === 0) {
    return (
      <div className="relative w-full h-[520px] rounded-2xl bg-surface-100/90 border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-400 mb-3">
          <Layers className="w-10 h-10" />
        </div>
        <h4 className="text-base font-bold text-slate-200">No Graph Elements Found</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          The query returned 0 nodes. Try adjusting the scenario parameters or click &ldquo;Seed Data&rdquo; in the header to populate realistic AML entities.
        </p>
      </div>
    );
  }

  // 4. Interactive Canvas Render
  return (
    <div className="relative w-full h-[560px] rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/80 shadow-2xl">
      {/* Cytoscape Container */}
      <div ref={containerRef} className="cytoscape-container" />

      {/* Floating Canvas Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg shadow-lg z-10">
        <button
          onClick={handleZoomIn}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetLayout}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Recalculate Physics Layout"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Legend Badge */}
      <div className="absolute bottom-3 left-3 p-2.5 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl shadow-lg z-10 text-[11px] space-y-1.5">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Entity Legend
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-1 ring-sky-300" />
            <span className="text-slate-300">Account</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-1 ring-purple-300" />
            <span className="text-slate-300">Person</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500 ring-1 ring-amber-300" />
            <span className="text-slate-300">Company</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-1 ring-rose-300" />
            <span className="text-slate-300">Sanctioned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rotate-45 bg-emerald-500 ring-1 ring-emerald-300" />
            <span className="text-slate-300">Synthetic ID</span>
          </div>
        </div>
      </div>

      {/* Quick Topology Badge */}
      <div className="absolute top-3 left-3 px-3 py-1.5 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg text-xs text-slate-300 z-10 flex items-center gap-2">
        <span className="text-sky-400 font-mono font-bold">{graph.nodes.length}</span> nodes
        <span className="text-slate-600">•</span>
        <span className="text-emerald-400 font-mono font-bold">{graph.relationships.length}</span> edges
      </div>
    </div>
  );
};
