"use client";

import { useEffect, useState } from "react";
import { Search, Database, RefreshCcw, AlertTriangle } from "lucide-react";
import type { ScanResult } from "@/lib/spiderfoot";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { classifyEventRisk } from "@/lib/risk";

interface ResultsTableProps {
  scanId: string;
}

export default function ResultsTable({ scanId }: ResultsTableProps) {
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use state or ref to track seen hashes so we don't double-alert
  const [seenHashes, setSeenHashes] = useState<Set<string>>(new Set());

  const fetchResults = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/spiderfoot/results/${scanId}`);
      if (!res.ok) throw new Error("Failed to fetch results");
      const data: ScanResult[] = await res.json();
      
      // Determine new events
      setSeenHashes(prev => {
        const next = new Set(prev);
        let alertTriggered = false;
        
        // If prev is empty, it's initial load, so don't flood notifications
        const isInitialLoad = prev.size === 0;

        data.forEach(r => {
          if (!next.has(r.hash)) {
            next.add(r.hash);
            
            // Only evaluate and alert if not initial load
            if (!isInitialLoad) {
              const riskLevel = classifyEventRisk(r);
              if (riskLevel === "CRITICAL" || riskLevel === "HIGH") {
                toast.error(`New ${riskLevel} Risk: ${r.type}`, {
                  icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
                  duration: 5000,
                });
                alertTriggered = true;
              }
            }
          }
        });
        
        return next;
      });

      setResults(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(() => {
      fetchResults();
    }, 10000); // Poll every 10s for new results
    return () => clearInterval(interval);
  }, [scanId]);

  const filteredResults = results.filter(r => 
    r.type?.toLowerCase().includes(search.toLowerCase()) ||
    r.data?.toLowerCase().includes(search.toLowerCase()) ||
    r.module?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl w-full">
        <div className="h-6 w-48 bg-slate-800 rounded mb-4 animate-pulse"></div>
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-10 bg-slate-800 rounded w-full animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-red-900/50 rounded-xl p-6 shadow-xl w-full">
        <h2 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Error Loading Results
        </h2>
        <p className="text-slate-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl w-full flex flex-col h-full min-h-[500px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          Scan Results
          <span className="bg-blue-500/10 text-blue-400 text-xs py-1 px-2 rounded-full border border-blue-500/20">
            {results.length} found
          </span>
        </h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search results..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => fetchResults(true)}
            disabled={isRefreshing}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 disabled:opacity-50"
            title="Refresh Results"
          >
            <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-auto border border-slate-800 rounded-lg bg-slate-950/50">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="text-xs uppercase bg-slate-900 text-slate-300 sticky top-0 border-b border-slate-800 shadow-sm">
            <tr>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Module</th>
              <th className="px-4 py-3 font-medium w-1/2">Data</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap hidden md:table-cell">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredResults.length > 0 ? (
              filteredResults.map((result, i) => (
                <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 align-top">
                    <span className="inline-block truncate max-w-[150px] font-medium text-slate-300" title={result.type}>
                      {result.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top hidden sm:table-cell text-slate-500">
                    {result.module}
                  </td>
                  <td className="px-4 py-3 align-top break-all font-mono text-[13px] text-blue-200">
                    {result.data}
                  </td>
                  <td className="px-4 py-3 align-top hidden md:table-cell text-xs text-slate-500 whitespace-nowrap">
                    {result.time}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                  {results.length === 0 ? "No results found yet. Scan might still be starting." : "No results match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
