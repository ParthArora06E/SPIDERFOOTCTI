import { NextResponse } from "next/server";
import { getScanResults } from "@/lib/spiderfoot";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ scanId: string }> }
) {
  try {
    const { scanId } = await params;

    if (!scanId) {
      return NextResponse.json({ error: "scanId is required" }, { status: 400 });
    }

    const events = await getScanResults(scanId);
    
    if (!events || events.length === 0) {
      return NextResponse.json({ nodes: [], edges: [] });
    }

    const nodeMap = new Map<string, any>();
    const typeLookup = new Map<string, string>();
    const edges: any[] = [];

    // Filter out extremely noisy non-entity types that clutter the graph
    const NOISY_TYPES = new Set([
      'HTTP_HEADER', 
      'RAW_RIR_DATA', 
      'WEB_CONTENT', 
      'TCP_PORT_OPEN_BANNER',
      'SSL_CERTIFICATE_RAW',
      'SSL_CERTIFICATE_ISSUER'
    ]);

    const filteredEvents = events.filter(e => !NOISY_TYPES.has(e.type));

    // First pass: Build type lookup
    filteredEvents.forEach(e => {
      // e.data is the actual value, e.type is its type
      if (e.data && e.type) {
        typeLookup.set(e.data, e.type);
      }
    });

    // Second pass: Build nodes and edges
    let edgeCounter = 0;
    
    filteredEvents.forEach(e => {
      const source = e.source_data;
      const target = e.data;
      
      if (!source || !target || source === "ROOT" || target === "ROOT") return;

      // Add target node
      if (!nodeMap.has(target)) {
        nodeMap.set(target, {
          id: target,
          label: target,
          type: e.type || "UNKNOWN"
        });
      }

      // Add source node
      if (!nodeMap.has(source)) {
        nodeMap.set(source, {
          id: source,
          label: source,
          // Infer type from lookup, fallback to UNKNOWN
          type: typeLookup.get(source) || "UNKNOWN"
        });
      }

      // Add edge
      edges.push({
        id: `e-${edgeCounter++}`,
        source: source,
        target: target
      });
    });

    // Edge deduplication
    const uniqueEdgesMap = new Map<string, any>();
    edges.forEach(e => {
      const key = `${e.source}->${e.target}`;
      if (!uniqueEdgesMap.has(key)) {
        uniqueEdgesMap.set(key, e);
      }
    });

    const nodes = Array.from(nodeMap.values());
    const uniqueEdges = Array.from(uniqueEdgesMap.values());

    return NextResponse.json({
      nodes,
      edges: uniqueEdges
    });
  } catch (error: any) {
    console.error(`Error getting graph for scan ${await params.then(p => p.scanId)}:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to get scan graph" },
      { status: 500 }
    );
  }
}
