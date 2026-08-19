"use client";

import { use } from "react";
import ScanVisualizations from "@/components/ScanVisualizations";

export default function WorkspaceOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id: scanId } = use(params);

  return (
    <div className="space-y-6">
      <ScanVisualizations scanId={scanId} />
    </div>
  );
}
