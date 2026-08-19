import { NextResponse } from "next/server";
import { checkHealth, SPIDERFOOT_URL } from "@/lib/spiderfoot";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const isOnline = await checkHealth();
    if (isOnline) {
      return NextResponse.json({
        connected: true,
        url: SPIDERFOOT_URL,
      });
    } else {
      return NextResponse.json(
        { connected: false, error: "SpiderFoot is not reachable" },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { connected: false, error: "Internal server error during health check" },
      { status: 500 }
    );
  }
}
