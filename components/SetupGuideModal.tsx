"use client";

import React, { useState } from "react";
import { X, ExternalLink, Key, Database, Terminal, Check, Copy, Shield, Cloud } from "lucide-react";

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const envSnippet = `# .env.local
COGNODB_URI=bolt+s://<your-instance-id>.databases.cognodb.cloud
COGNODB_USER=cognodb
COGNODB_PASSWORD=<your-generated-password>
COGNODB_DATABASE=neo4j`;

  const seedCommand = `npm run seed
# or for Python users:
python scripts/seed.py`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[90vh] bg-surface-100 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-surface-200/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                CognoDB Cloud Setup & Connection Guide
              </h3>
              <p className="text-xs text-slate-400">
                Connect SentinelGraph directly to your free managed openCypher database
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
          {/* Step 1 */}
          <div className="flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </div>
            <div className="space-y-1.5 flex-1">
              <h4 className="text-sm font-semibold text-white">Create a Free CognoDB Account</h4>
              <p className="text-slate-300">
                Navigate to the CognoDB Cloud console. The free tier requires <strong>no credit card</strong> and provides a dedicated instance.
              </p>
              <a
                href="https://console.cognodb.com/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 font-medium transition-colors"
              >
                <span>Open CognoDB Console Signup</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </div>
            <div className="space-y-1.5 flex-1">
              <h4 className="text-sm font-semibold text-white">Provision a Free (c0) Database Instance</h4>
              <p className="text-slate-300">
                Click &ldquo;Create Database&rdquo;, select the free <strong>c0</strong> tier, and choose your preferred region. Provisioning completes in under 60 seconds.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="text-sm font-semibold text-white">Configure Environment Variables</h4>
              <p className="text-slate-300">
                Save your connection URI (<code className="text-sky-300 font-mono">bolt+s://&lt;instance-id&gt;.databases.cognodb.cloud</code>) and generated password in a <code className="text-sky-300 font-mono">.env.local</code> file:
              </p>
              <div className="relative">
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-sky-200 font-mono text-xs overflow-x-auto">
                  {envSnippet}
                </pre>
                <button
                  onClick={() => copyToClipboard(envSnippet, "env")}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Copy .env template"
                >
                  {copiedSection === "env" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              4
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="text-sm font-semibold text-white">Seed Realistic AML Graph Data</h4>
              <p className="text-slate-300">
                Execute the included automated data loading script to populate schemas, indexes, and 500+ nodes and 1,500+ edges representing circular laundering rings, synthetic identities, mule networks, and corporate holding chains:
              </p>
              <div className="relative">
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto">
                  {seedCommand}
                </pre>
                <button
                  onClick={() => copyToClipboard(seedCommand, "seed")}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Copy Seed command"
                >
                  {copiedSection === "seed" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 5: Vercel / Cloud Deployment */}
          <div className="flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              5
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="text-sm font-semibold text-white">Deploying to Vercel / Cloud Hosting</h4>
              <p className="text-slate-300">
                To host the live demo, import your GitHub repository into Vercel and add your CognoDB credentials (<code className="text-sky-300 font-mono">COGNODB_URI</code>, <code className="text-sky-300 font-mono">COGNODB_USER</code>, <code className="text-sky-300 font-mono">COGNODB_PASSWORD</code>) in <strong>Project Settings → Environment Variables</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-surface-200/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Credentials are read only on the server runtime and never committed.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-sky-500 text-white hover:bg-sky-400 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
