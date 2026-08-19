"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, PlayCircle, Clock, CheckCircle2, XCircle, Search } from "lucide-react";

export default function HistoryPage() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/spiderfoot/scans");
        if (!res.ok) throw new Error("Failed to fetch scan history");
        const data = await res.json();
        setScans(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusIcon = (status: string) => {
    if (status.includes("RUNNING") || status.includes("STARTING")) {
      return <PlayCircle className="w-4 h-4 text-blue-400" />;
    }
    if (status.includes("FINISHED")) {
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    }
    if (status.includes("ERROR") || status.includes("ABORTED")) {
      return <XCircle className="w-4 h-4 text-red-400" />;
    }
    return <Clock className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-500" />
            Scan History
          </h1>
          <p className="text-slate-400 mt-1">Review past intelligence gathering operations</p>
        </div>
        <Link 
          href="/investigations/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] font-medium"
        >
          <Search className="w-4 h-4" />
          New Investigation
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="text-red-400 mb-2">Failed to load history</div>
            <div className="text-slate-500 text-sm">{error}</div>
          </div>
        ) : scans.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-slate-400 mb-2">No historical investigations found.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800">
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Investigation Name</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Target</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Elements</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {scans.map((scan) => (
                  <tr key={scan.scanId} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="p-4">
                      <div className="font-medium text-slate-200">{scan.name.replace("Dashboard Scan: ", "")}</div>
                      <div className="text-xs text-slate-500 font-mono mt-1">{scan.scanId}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        {scan.target}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(scan.status)}
                        <span className="text-sm font-medium text-slate-300">{scan.status}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-300">{scan.created}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-slate-300">{scan.elements}</div>
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/investigations/${scan.scanId}`}
                        className="inline-flex items-center justify-center text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-900/20 hover:bg-blue-900/40 px-3 py-1.5 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        View Details &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
