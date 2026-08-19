"use client";

import { useEffect, useState, use } from "react";
import { AlertTriangle, Search, ShieldAlert, Shield } from "lucide-react";

export default function FindingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: scanId } = use(params);
  const [findings, setFindings] = useState<any[]>([]);
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
          
          // Filter only CRITICAL, HIGH, MEDIUM
          const actionable = results.filter((r: any) => 
            ['CRITICAL', 'HIGH', 'MEDIUM'].includes(r.risk)
          );
          
          // Group by type and data
          const findingsMap = new Map();
          
          actionable.forEach((r: any) => {
            const key = `${r.type}-${r.data}`;
            if (!findingsMap.has(key)) {
              findingsMap.set(key, {
                id: key,
                title: `${r.type} Discovered`,
                entity: r.data,
                type: r.type,
                risk: r.risk,
                module: r.module,
                evidence: r.source_data || r.data,
                firstSeen: r.time,
                status: 'New'
              });
            }
          });
          
          const sorted = Array.from(findingsMap.values()).sort((a, b) => {
            const riskWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2 };
            return (riskWeight[b.risk as keyof typeof riskWeight] || 0) - (riskWeight[a.risk as keyof typeof riskWeight] || 0);
          });
          
          setFindings(sorted);
        }
      } catch (e) {
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResults();
  }, [scanId]);

  const filtered = findings.filter(f => 
    f.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Security Findings
          <span className="bg-red-900/30 text-red-400 border border-red-900/50 text-xs py-0.5 px-2 rounded-full ml-2">
            {findings.length} Actionable
          </span>
        </h2>
        
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search findings..." 
            className="w-64 bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-950/50 p-6">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="w-8 h-8 border-2 border-slate-700 border-t-red-500 rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center text-slate-500">
            <Shield className="w-12 h-12 text-slate-700 mb-4" />
            <h3 className="text-lg font-medium text-slate-400">No High-Risk Findings</h3>
            <p className="text-sm mt-1">This investigation has not discovered any critical, high, or medium risk entities.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((finding) => (
              <div key={finding.id} className="bg-slate-900 border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      finding.risk === 'CRITICAL' ? 'bg-red-950 text-red-500' :
                      finding.risk === 'HIGH' ? 'bg-orange-950 text-orange-500' :
                      'bg-yellow-950 text-yellow-500'
                    }`}>
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white flex items-center gap-2">
                        {finding.title}
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                          finding.risk === 'CRITICAL' ? 'bg-red-500 text-white' :
                          finding.risk === 'HIGH' ? 'bg-orange-500 text-white' :
                          'bg-yellow-500 text-black'
                        }`}>
                          {finding.risk}
                        </span>
                      </h3>
                      <div className="text-sm text-slate-400 mt-1">
                        Discovered by <span className="font-mono text-slate-300">{finding.module}</span> on {finding.firstSeen}
                      </div>
                    </div>
                  </div>
                  <select className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-slate-600">
                    <option>New</option>
                    <option>Investigating</option>
                    <option>Confirmed</option>
                    <option>Resolved</option>
                    <option>False Positive</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 rounded border border-slate-800/50 p-3">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Entity</div>
                    <div className="font-mono text-sm text-blue-400 break-all">{finding.entity}</div>
                  </div>
                  <div className="bg-slate-950 rounded border border-slate-800/50 p-3">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Evidence / Source Data</div>
                    <div className="font-mono text-sm text-slate-300 break-all">{finding.evidence}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
