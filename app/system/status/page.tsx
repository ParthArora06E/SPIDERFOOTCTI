"use client";

import { useEffect, useState } from "react";
import { Server, Activity, AlertTriangle, ShieldCheck } from "lucide-react";

export default function SystemStatusPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/spiderfoot/health");
        const data = await res.json();
        if (isMounted) setStatus({ connected: res.ok && data.connected, ...data });
      } catch (e) {
        if (isMounted) setStatus({ connected: false, error: "Network Error" });
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Server className="w-6 h-6 text-blue-500" />
          Platform Status
        </h1>
        <p className="text-slate-400 mt-1">System health and integration connections</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-medium text-white">Core Engine: SpiderFoot</h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="text-slate-400">Checking connection...</span>
              </div>
            ) : status?.connected ? (
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-green-950/20 border border-green-900/30 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="text-base font-medium text-green-400">Engine Online & Healthy</h3>
                    <p className="text-sm text-slate-400 mt-1">The SpiderFoot backend is reachable and accepting API requests.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">API Endpoint</div>
                    <div className="font-mono text-slate-300">{status.url || "http://127.0.0.1:8080"}</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Response Time</div>
                    <div className="font-mono text-slate-300">&lt; 100ms</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-red-950/20 border border-red-900/30 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-500 mt-0.5" />
                  <div>
                    <h3 className="text-base font-medium text-red-400">Engine Offline</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      The SpiderFoot backend is not reachable. This dashboard cannot function without the backend engine.
                    </p>
                  </div>
                </div>
                
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Troubleshooting</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-400">
                    <li>Verify SpiderFoot is running locally.</li>
                    <li>Ensure it is bound to the correct port: <code className="text-blue-400 bg-blue-900/20 px-1 rounded">python sf.py -l 127.0.0.1:8080</code></li>
                    <li>Check the <code className="text-slate-300 bg-slate-800 px-1 rounded">SPIDERFOOT_URL</code> in your <code className="text-slate-300 bg-slate-800 px-1 rounded">.env.local</code> file.</li>
                    <li>Do not route the local SpiderFoot connection through Cloudflare unless properly configured.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
