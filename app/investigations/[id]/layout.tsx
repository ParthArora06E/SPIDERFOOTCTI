"use client";

import { useInvestigation } from "@/components/InvestigationContext";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Database, Network, List, AlertTriangle, PlayCircle, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function InvestigationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: scanId } = use(params);
  const { setActiveScanId } = useInvestigation();
  const pathname = usePathname();
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    setActiveScanId(scanId);
    
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/spiderfoot/status/${scanId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setStatus(data);
        }
      } catch (e) {}
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Poll every 10s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [scanId, setActiveScanId]);

  const tabs = [
    { name: "Overview", href: `/investigations/${scanId}`, icon: LayoutDashboard },
    { name: "Entities", href: `/investigations/${scanId}/entities`, icon: Database },
    { name: "Relationships", href: `/investigations/${scanId}/graph`, icon: Network },
    { name: "Findings", href: `/investigations/${scanId}/findings`, icon: AlertTriangle },
    { name: "Events", href: `/investigations/${scanId}/events`, icon: List },
  ];

  const getStatusIcon = () => {
    if (!status) return <div className="w-4 h-4 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />;
    if (status.status.includes("RUNNING") || status.status.includes("STARTING")) {
      return <div className="flex items-center gap-1.5"><PlayCircle className="w-4 h-4 text-blue-400" /><span className="text-blue-400 text-xs font-medium animate-pulse">RUNNING</span></div>;
    }
    if (status.status.includes("FINISHED")) {
      return <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /><span className="text-green-400 text-xs font-medium">FINISHED</span></div>;
    }
    if (status.status.includes("ERROR") || status.status.includes("ABORTED")) {
      return <div className="flex items-center gap-1.5"><XCircle className="w-4 h-4 text-red-400" /><span className="text-red-400 text-xs font-medium">{status.status}</span></div>;
    }
    return <Clock className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-6">
      {/* Workspace Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-6 flex-shrink-0 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {status ? status.name.replace("Dashboard Scan: ", "") : "Loading..."}
            </h1>
            <div className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
              {getStatusIcon()}
            </div>
          </div>
          <p className="text-slate-400 font-mono text-sm">{scanId}</p>
        </div>
        
        {status && (
          <div className="flex gap-6 text-sm text-slate-400">
            <div><span className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Started</span><span className="font-mono">{status.started || '-'}</span></div>
            <div><span className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Ended</span><span className="font-mono">{status.ended || '-'}</span></div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 flex gap-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-slate-950">
        {children}
      </div>
    </div>
  );
}
