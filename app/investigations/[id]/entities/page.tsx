"use client";

import { useEffect, useState, use } from "react";
import { Database, Search } from "lucide-react";

export default function EntitiesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: scanId } = use(params);
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;
    
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/spiderfoot/results/${scanId}`);
        if (res.ok) {
          const results = await res.json();
          if (!isMounted) return;
          
          // Deduplicate entities by data
          const entityMap = new Map();
          
          results.forEach((r: any) => {
            if (!entityMap.has(r.data)) {
              entityMap.set(r.data, {
                entity: r.data,
                type: r.type,
                risk: r.risk,
                firstSeen: r.time,
                lastSeen: r.time,
                sources: new Set([r.module]),
                events: 1
              });
            } else {
              const e = entityMap.get(r.data);
              e.sources.add(r.module);
              e.events += 1;
              // update last seen (assuming chronologically ordered initially, but let's just keep firstSeen for now)
            }
          });
          
          const sorted = Array.from(entityMap.values()).sort((a, b) => b.events - a.events);
          setEntities(sorted);
        }
      } catch (e) {
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResults();
  }, [scanId]);

  const filtered = entities.filter(e => 
    e.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-400" />
          Entity Explorer
          <span className="bg-slate-800 text-slate-300 text-xs py-0.5 px-2 rounded-full ml-2">
            {entities.length} total
          </span>
        </h2>
        
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search entities..." 
            className="w-64 bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="w-8 h-8 border-2 border-slate-700 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-500">
            No entities found matching your search.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 z-10">
              <tr>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Entity</th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Risk Level</th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Sources</th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Related Events</th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">First Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map((e, i) => (
                <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-3 font-mono text-sm text-slate-200 break-all">{e.entity}</td>
                  <td className="p-3">
                    <span className="text-xs font-medium text-slate-300 bg-slate-800 px-2 py-1 rounded">
                      {e.type}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      e.risk === 'HIGH' || e.risk === 'CRITICAL' ? 'bg-red-900/30 text-red-400 border border-red-900/50' :
                      e.risk === 'MEDIUM' ? 'bg-orange-900/30 text-orange-400 border border-orange-900/50' :
                      e.risk === 'LOW' ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' :
                      'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                    }`}>
                      {e.risk}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-slate-400 truncate max-w-[200px]" title={Array.from(e.sources).join(", ")}>
                    {Array.from(e.sources).join(", ")}
                  </td>
                  <td className="p-3 text-sm text-slate-300">{e.events}</td>
                  <td className="p-3 text-sm text-slate-400 whitespace-nowrap">{e.firstSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
