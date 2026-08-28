"use client";

import React from "react";
import { AlertTriangle, ExternalLink, Key } from "lucide-react";

interface DemoModeBannerProps {
  onOpenSetupGuide: () => void;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({ onOpenSetupGuide }) => {
  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-amber-200 text-sm flex flex-wrap items-center justify-between gap-3 shadow-inner z-50">
      <div className="flex items-center gap-2.5 font-medium">
        <div className="p-1 rounded bg-amber-500/20 text-amber-300">
          <AlertTriangle className="w-4 h-4 animate-pulse" />
        </div>
        <span>
          <strong className="font-semibold uppercase tracking-wider text-amber-300">Demo Mode Active:</strong>{" "}
          Not connected to CognoDB Cloud. Showing high-fidelity simulated AML graph dataset.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSetupGuide}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-900 bg-amber-400 hover:bg-amber-300 rounded shadow transition-colors"
        >
          <Key className="w-3.5 h-3.5" />
          Connect Live CognoDB Instance
        </button>
        <a
          href="https://console.cognodb.com/signup"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-amber-300/80 hover:text-amber-200 underline transition-colors"
        >
          Create Free c0 Instance
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
