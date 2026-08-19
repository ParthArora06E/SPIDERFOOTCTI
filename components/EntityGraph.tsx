"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { ZoomIn, ZoomOut, Maximize, Search, Filter } from "lucide-react";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export interface Node {
  id: string;
  label: string;
  type: string;
  x?: number;
  y?: number;
}

export interface Edge {
  id: string;
  source: string | Node;
  target: string | Node;
}

interface EntityGraphProps {
  nodes: Node[];
  edges: Edge[];
}

const TYPE_COLORS: Record<string, string> = {
  DOMAIN: "#3b82f6",
  SUBDOMAIN: "#60a5fa",
  IP: "#ef4444",
  EMAILADDR: "#f59e0b",
  URL: "#10b981",
  USERNAME: "#8b5cf6",
  SSL_CERTIFICATE: "#ec4899",
  UNKNOWN: "#94a3b8"
};

const getColor = (type: string) => {
  // Try exact match
  if (TYPE_COLORS[type]) return TYPE_COLORS[type];
  // Try partial match
  for (const [key, color] of Object.entries(TYPE_COLORS)) {
    if (type.includes(key)) return color;
  }
  return TYPE_COLORS.UNKNOWN;
};

export default function EntityGraph({ nodes, edges }: EntityGraphProps) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const types = useMemo(() => {
    const t = new Set(nodes.map(n => n.type));
    return Array.from(t).sort();
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      const matchSearch = n.label.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = activeFilter === "ALL" || n.type === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [nodes, searchTerm, activeFilter]);

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

  // Filter edges to only those connecting visible nodes
  const filteredEdges = useMemo(() => {
    return edges.filter(e => {
      const s = typeof e.source === 'object' ? e.source.id : e.source;
      const t = typeof e.target === 'object' ? e.target.id : e.target;
      return filteredNodeIds.has(s) && filteredNodeIds.has(t);
    });
  }, [edges, filteredNodeIds]);

  const [hoverNode, setHoverNode] = useState<Node | null>(null);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node as Node);
    
    // Calculate connected nodes
    const connections = edges.filter(e => {
      const s = typeof e.source === 'object' ? e.source.id : e.source;
      const t = typeof e.target === 'object' ? e.target.id : e.target;
      return s === node.id || t === node.id;
    }).length;

    // Extend node with connections count for the panel
    (node as any).connections = connections;

    // Center on node
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(2, 1000);
    }
  }, [edges]);

  const handleZoomIn = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.zoom(currentZoom * 1.5, 400);
    }
  };

  const handleZoomOut = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.zoom(currentZoom / 1.5, 400);
    }
  };

  const handleFit = () => {
    if (fgRef.current) fgRef.current.zoomToFit(400);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Adjust force graph properties on mount to spread nodes out
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-150);
      fgRef.current.d3Force('link').distance(60);
    }
  }, [filteredNodes]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full transition-all duration-300 ${isFullscreen ? 'h-screen rounded-none border-none' : 'h-[600px] border border-slate-800 rounded-lg'} bg-slate-950 overflow-hidden flex`}
    >
      {/* Controls Bar */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex flex-col gap-2 shadow-lg">
          <button onClick={handleZoomIn} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleZoomOut} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={toggleFullscreen} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors" title="Toggle Fullscreen">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-3 items-end">
        <div className="relative w-64 shadow-lg">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search entities..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 backdrop-blur-sm"
          />
        </div>
        
        <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-2 shadow-lg backdrop-blur-sm flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 ml-1" />
          <select 
            value={activeFilter} 
            onChange={e => setActiveFilter(e.target.value)}
            className="bg-transparent text-sm text-white focus:outline-none pr-2 max-w-[200px] truncate"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Types</option>
            {types.map(t => (
              <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Force Graph */}
      <div className="flex-grow h-full w-full">
        {filteredNodes.length > 0 ? (
          <ForceGraph2D
            ref={fgRef}
            graphData={{ nodes: filteredNodes, links: filteredEdges }}
            nodeLabel="" // We draw labels manually
            nodeColor={(node: any) => getColor(node.type)}
            nodeRelSize={4}
            linkColor={() => '#1e293b'} // Darker links to reduce noise
            onNodeClick={handleNodeClick}
            onNodeHover={(node: any) => setHoverNode(node as Node | null)}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor="#020617"
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.label;
              const isSelected = selectedNode && selectedNode.id === node.id;
              const isHovered = hoverNode && hoverNode.id === node.id;
              
              // Draw node
              ctx.beginPath();
              ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
              ctx.fillStyle = getColor(node.type);
              
              if (isSelected || isHovered) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2 / globalScale;
                ctx.stroke();
              }
              
              ctx.fill();

              // Draw label if zoomed in, or if explicitly hovered/selected
              const shouldDrawLabel = globalScale > 1.2 || isSelected || isHovered;

              if (shouldDrawLabel) {
                const fontSize = (isSelected || isHovered ? 14 : 10) / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Truncate long labels
                let displayLabel = label || "";
                if (displayLabel.length > 30) {
                  displayLabel = displayLabel.substring(0, 27) + '...';
                }
                
                // Add a small background for readability
                const textWidth = ctx.measureText(displayLabel).width;
                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);
                
                ctx.fillStyle = 'rgba(2, 6, 23, 0.7)';
                ctx.fillRect(
                  node.x - bckgDimensions[0] / 2, 
                  node.y + 6 - bckgDimensions[1] / 2, 
                  bckgDimensions[0], 
                  bckgDimensions[1]
                );
                
                ctx.fillStyle = isSelected || isHovered ? '#ffffff' : '#cbd5e1';
                ctx.fillText(displayLabel, node.x, node.y + 6);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            No entities match current filters.
          </div>
        )}
      </div>

      {/* Details Panel */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 z-10 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
            <h4 className="text-sm font-bold text-white">Entity Details</h4>
            <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white text-xs">
              Close
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Type</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor(selectedNode.type) }}></div>
                <p className="text-sm text-slate-300 font-mono">{selectedNode.type}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Value</p>
              <p className="text-sm text-white break-all">{selectedNode.label}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Connections</p>
              <p className="text-sm text-slate-300">{(selectedNode as any).connections} edges</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
