import { NextResponse } from "next/server";
import { getScanStatus, getScanResults } from "@/lib/spiderfoot";
import { aggregateRiskDistribution } from "@/lib/risk";

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

    const status = await getScanStatus(scanId);

    if (!status) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    try {
      // SpiderFoot's native scaninfo doesn't return a risk matrix, so we dynamically generate it
      const events = await getScanResults(scanId);
      const { distribution } = aggregateRiskDistribution(events);
      
      const matrix: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
      distribution.forEach(d => {
        matrix[d.risk] = d.count;
      });
      // Merge CRITICAL into HIGH for the 4-box display
      if (distribution.find(d => d.risk === 'CRITICAL')) {
        matrix.HIGH += distribution.find(d => d.risk === 'CRITICAL')!.count;
      }
      
      status.riskmatrix = matrix;
    } catch (e) {
      console.error("Failed to aggregate risk for status:", e);
    }

    return NextResponse.json(status);
  } catch (error: any) {
    console.error(`Error getting status for scan ${await params.then(p => p.scanId)}:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to get scan status" },
      { status: 500 }
    );
  }
}
