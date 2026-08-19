"use client";

import { useInvestigation } from "./InvestigationContext";
import { Server, Search, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { checkHealth } from "@/lib/spiderfoot";

export default function TopHeader() {
  const { activeScanId, recentScans } = useInvestigation();
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  const activeScan = recentScans.find(s => s.id === activeScanId);

  useEffect(() => {
    const doCheck = async () => {
      try {
        const res = await fetch("/api/spiderfoot/health");
        if (res.ok) {
          const data = await res.json();
          setIsOnline(data.connected);
        } else {
          setIsOnline(false);
        }
      } catch (e) {
        setIsOnline(false);
      }
    };
    doCheck();
    const interval = setInterval(doCheck, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-slate-950/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 flex items-center justify-between px-6 ml-64">
      <div className="flex items-center gap-4">
        {activeScan ? (
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Workspace</span>
            <span className="text-sm font-medium text-slate-200">{activeScan.name.replace("Dashboard Scan: ", "")}</span>
          </div>
        ) : (
          <div className="text-slate-500 text-sm font-medium">
            No active workspace selected
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Global search (coming soon)..." 
            disabled
            className="w-64 bg-slate-900 border border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 opacity-50 cursor-not-allowed"
          />
        </div>

        <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors relative">
          <Bell className="w-5 h-5" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
        </button>

        <div className="h-6 w-px bg-slate-800"></div>

        {isOnline === null ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-full">
            <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></div>
            <span className="text-xs font-medium text-slate-400">Checking...</span>
          </div>
        ) : isOnline ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-950/30 border border-green-900/50 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-xs font-medium text-green-400">Connected</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-950/30 border border-red-900/50 rounded-full">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-xs font-medium text-red-400">Offline</span>
          </div>
        )}
      </div>
    </header>
  );
}
