import { NextResponse } from "next/server";
import { getScanHistory } from "@/lib/spiderfoot";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const scans = await getScanHistory();
    return NextResponse.json(scans);
  } catch (error: any) {
    console.error("Error getting scan history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get scan history" },
      { status: 500 }
    );
  }
}
