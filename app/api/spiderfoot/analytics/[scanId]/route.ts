import { NextResponse } from "next/server";
import { getScanResults } from "@/lib/spiderfoot";
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

    const events = await getScanResults(scanId);

    // Calculate Top 10 Event Types
    const typeCounts: Record<string, number> = {};
    events.forEach(e => {
      typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
    });

    const topEventTypes = Object.entries(typeCounts)
      .map(([eventType, count]) => ({ eventType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate Risk Distribution
    const { total, distribution: riskDistribution } = aggregateRiskDistribution(events);

    return NextResponse.json({
      topEventTypes,
      riskDistribution,
      totalEvents: total
    });
  } catch (error: any) {
    console.error(`Error getting analytics for scan ${await params.then(p => p.scanId)}:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to get analytics" },
      { status: 500 }
    );
  }
}
