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

    const results = await getScanResults(scanId);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error(`Error getting results for scan ${await params.then(p => p.scanId)}:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to get scan results" },
      { status: 500 }
    );
  }
}
