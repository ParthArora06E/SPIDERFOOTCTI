"use client";

import { useInvestigation } from "./InvestigationContext";
import Link from "next/link";
import { Search, Activity, AlertTriangle, Shield, Clock, Layers, Database } from "lucide-react";
import { useEffect, useState } from "react";
import { getScanStatus, getScanResults } from "@/lib/spiderfoot";

export default function ExecutiveDashboard() {
  const { activeScanId, recentScans } = useInvestigation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeScanId) return;
    
    let isMounted = true;
    
    const loadStats = async () => {
      setLoading(true);
      try {
        const [statusRes, resultsRes] = await Promise.all([
          fetch(`/api/spiderfoot/status/${activeScanId}`),
          fetch(`/api/spiderfoot/results/${activeScanId}`)
        ]);
        
        if (!statusRes.ok || !resultsRes.ok) throw new Error("Failed to load");
        
        const status = await statusRes.json();
        const results = await resultsRes.json();
        
        if (!isMounted) return;
        
        const entities = new Set(results.map((r: any) => r.data)).size;
        const highRisk = status.riskmatrix?.HIGH || 0;
        const criticalRisk = status.riskmatrix?.CRITICAL || 0;
        
        setStats({
          events: results.length,
          entities: entities,
          highRisk: highRisk + criticalRisk,
          status: status.status,
          target: status.name.replace("Dashboard Scan: ", ""),
          duration: "Active"
        });
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    loadStats();
    
    return () => { isMounted = false; };
  }, [activeScanId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Security Intelligence Platform</h1>
          <p className="text-slate-400 mt-1">Enterprise Open Source Intelligence & Attack Surface Discovery</p>
        </div>
        <Link 
          href="/investigations/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] font-medium"
        >
          <Search className="w-4 h-4" />
          New Investigation
        </Link>
      </div>

      {!activeScanId ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Active Investigation</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            Start a new investigation to discover attack surfaces, analyze risks, and map entity relationships.
          </p>
          <Link 
            href="/investigations/new"
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-md transition-colors font-medium border border-slate-700"
          >
            Start Investigation
          </Link>
        </div>
      ) : loading && !stats ? (
        <div className="grid grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-6 h-32"></div>
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Layers className="w-16 h-16 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Total Events</p>
              <div className="text-4xl font-light text-white">{stats.events.toLocaleString()}</div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Database className="w-16 h-16 text-purple-500" />
              </div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Entities Discovered</p>
              <div className="text-4xl font-light text-white">{stats.entities.toLocaleString()}</div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <AlertTriangle className="w-16 h-16 text-red-500" />
              </div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">High Risk Findings</p>
              <div className="text-4xl font-light text-red-400">{stats.highRisk.toLocaleString()}</div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity className="w-16 h-16 text-green-500" />
              </div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Investigation Status</p>
              <div className="text-2xl font-light text-slate-200 mt-2 truncate">{stats.status}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Investigation Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-slate-800/50">
                  <span className="text-slate-400">Target</span>
                  <span className="text-white font-mono">{stats.target}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-800/50">
                  <span className="text-slate-400">Scan ID</span>
                  <span className="text-slate-300 font-mono text-sm">{activeScanId}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-800/50">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-slate-300">{stats.duration}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <Link 
                  href={`/investigations/${activeScanId}`}
                  className="inline-flex items-center justify-center w-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md transition-colors border border-slate-700"
                >
                  Enter Active Workspace
                </Link>
              </div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Recent Investigations</h3>
              <div className="space-y-3">
                {recentScans.slice(0, 5).map(scan => (
                  <Link 
                    key={scan.id} 
                    href={`/investigations/${scan.id}`}
                    className="block p-3 rounded-lg border border-slate-800 hover:bg-slate-800/50 hover:border-slate-700 transition-colors"
                  >
                    <div className="text-sm font-medium text-slate-200 truncate">{scan.name.replace("Dashboard Scan: ", "")}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1 truncate">{scan.id}</div>
                  </Link>
                ))}
                {recentScans.length === 0 && (
                  <div className="text-sm text-slate-500 py-4 text-center">No recent investigations found.</div>
                )}
              </div>
              <div className="mt-4">
                <Link href="/investigations/history" className="text-sm text-blue-400 hover:text-blue-300">
                  View all history &rarr;
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
