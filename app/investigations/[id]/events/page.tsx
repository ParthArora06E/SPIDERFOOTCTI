"use client";

import { use } from "react";
import ResultsTable from "@/components/ResultsTable";

export default function EventsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: scanId } = use(params);

  return (
    <div className="h-[calc(100vh-12rem)]">
      <ResultsTable scanId={scanId} />
    </div>
  );
}
