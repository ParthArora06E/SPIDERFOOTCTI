"use client";

import { useState } from "react";
import { PlayCircle, Target, Shield, Settings, Server, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useInvestigation } from "@/components/InvestigationContext";

export default function NewInvestigationPage() {
  const router = useRouter();
  const { setActiveScanId, recentScans, setRecentScans } = useInvestigation();
  
  const [target, setTarget] = useState("");
  const [targetType, setTargetType] = useState("domain");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/spiderfoot/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to start investigation");
      }

      // Update context
      setActiveScanId(data.scanId);
      const newScan = { id: data.scanId, name: `Dashboard Scan: ${target}` };
      setRecentScans([newScan, ...recentScans.filter(s => s.id !== data.scanId)]);
      
      // Navigate to the active workspace
      router.push(`/investigations/${data.scanId}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">New Investigation</h1>
        <p className="text-slate-400 mt-1">Configure and launch a new OSINT discovery scan</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="border-b border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Target Definition
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="target" className="block text-sm font-medium text-slate-400 mb-2">
                  Investigation Target
                </label>
                <input
                  id="target"
                  type="text"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                  placeholder="e.g. example.com, 192.168.1.1, user@example.com"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="targetType" className="block text-sm font-medium text-slate-400 mb-2">
                  Target Type
                </label>
                <div className="relative">
                  <select
                    id="targetType"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-10 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    disabled={loading}
                  >
                    <option value="domain" className="bg-slate-900">Domain Name</option>
                    <option value="ip" className="bg-slate-900">IP Address</option>
                    <option value="email" className="bg-slate-900">Email Address</option>
                    <option value="human" className="bg-slate-900">Human Name</option>
                    <option value="network" className="bg-slate-900">Network Subnet</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6">
              <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-slate-500" />
                Scan Configuration Profiles
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="relative flex cursor-pointer rounded-lg border bg-blue-900/10 border-blue-500/50 p-4 shadow-sm focus:outline-none">
                  <input type="radio" name="profile" value="all" className="sr-only" defaultChecked />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-white mb-1">Standard OSINT (All Modules)</span>
                      <span className="block text-xs text-slate-400">Runs all available SpiderFoot modules for maximum discovery and reconnaissance.</span>
                    </span>
                  </span>
                  <Shield className="h-5 w-5 text-blue-500 ml-4" />
                </label>
                
                <label className="relative flex cursor-not-allowed opacity-50 rounded-lg border bg-slate-900 border-slate-700 p-4 shadow-sm focus:outline-none">
                  <input type="radio" name="profile" value="passive" className="sr-only" disabled />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-white mb-1">Passive Intelligence</span>
                      <span className="block text-xs text-slate-400">Does not touch the target infrastructure. Uses passive API lookups only. (Coming soon)</span>
                    </span>
                  </span>
                  <Server className="h-5 w-5 text-slate-500 ml-4" />
                </label>
              </div>
            </div>
            
            {error && (
              <div className="p-4 bg-red-950/50 border border-red-900 text-red-400 text-sm rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-300">Investigation Failed</h4>
                  <p className="mt-1 opacity-90">{error}</p>
                </div>
              </div>
            )}

            <div className="border-t border-slate-800 pt-6 flex justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 text-sm font-medium text-slate-300 hover:text-white mr-4 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !target}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <PlayCircle className="w-5 h-5" />
                )}
                {loading ? "Initializing..." : "Launch Investigation"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
