import { NextResponse } from "next/server";
import { startScan } from "@/lib/spiderfoot";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { target } = body;

    if (!target) {
      return NextResponse.json({ error: "Target is required" }, { status: 400 });
    }

    const scanId = await startScan(target);

    return NextResponse.json({
      success: true,
      scanId,
    });
  } catch (error: any) {
    console.error("Error starting scan:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to start scan" },
      { status: 500 }
    );
  }
}
