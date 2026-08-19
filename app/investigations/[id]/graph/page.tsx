"use client";

import { useEffect, useState, use } from "react";
import EntityGraph from "@/components/EntityGraph";
import { Network } from "lucide-react";

export default function GraphPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: scanId } = use(params);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchGraph = async () => {
      try {
        const res = await fetch(`/api/spiderfoot/graph/${scanId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setNodes(data.nodes);
            setEdges(data.edges);
          }
        }
      } catch (e) {
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGraph();
    const interval = setInterval(fetchGraph, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [scanId]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[calc(100vh-12rem)]">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 flex-shrink-0">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <Network className="w-5 h-5 text-emerald-400" />
          Entity Relationship Graph
        </h2>
        <div className="text-xs text-slate-500">
          {nodes.length} Nodes &middot; {edges.length} Relationships
        </div>
      </div>

      <div className="flex-1 relative">
        {loading && nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <EntityGraph nodes={nodes} edges={edges} />
        )}
      </div>
    </div>
  );
}
