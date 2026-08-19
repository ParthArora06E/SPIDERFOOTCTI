import { NextResponse } from "next/server";
import { stopScan } from "@/lib/spiderfoot";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ scanId: string }> }
) {
  try {
    const { scanId } = await params;

    if (!scanId) {
      return NextResponse.json({ error: "scanId is required" }, { status: 400 });
    }

    await stopScan(scanId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Error stopping scan ${await params.then(p => p.scanId)}:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to stop scan" },
      { status: 500 }
    );
  }
}
