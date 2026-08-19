"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface InvestigationContextType {
  activeScanId: string | null;
  setActiveScanId: (id: string | null) => void;
  recentScans: Array<{ id: string, name: string }>;
  setRecentScans: (scans: Array<{ id: string, name: string }>) => void;
}

const InvestigationContext = createContext<InvestigationContextType | undefined>(undefined);

export function InvestigationProvider({ children }: { children: ReactNode }) {
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<Array<{ id: string, name: string }>>([]);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sf_active_scan");
      if (stored) setActiveScanId(stored);
      
      const storedScans = localStorage.getItem("sf_recent_scans");
      if (storedScans) setRecentScans(JSON.parse(storedScans));
    } catch (e) {
      console.error("Failed to load investigation state", e);
    }
  }, []);

  // Save to local storage when changed
  useEffect(() => {
    if (activeScanId) {
      localStorage.setItem("sf_active_scan", activeScanId);
    } else {
      localStorage.removeItem("sf_active_scan");
    }
  }, [activeScanId]);

  useEffect(() => {
    if (recentScans.length > 0) {
      localStorage.setItem("sf_recent_scans", JSON.stringify(recentScans));
    }
  }, [recentScans]);

  return (
    <InvestigationContext.Provider value={{ activeScanId, setActiveScanId, recentScans, setRecentScans }}>
      {children}
    </InvestigationContext.Provider>
  );
}

export function useInvestigation() {
  const context = useContext(InvestigationContext);
  if (context === undefined) {
    throw new Error("useInvestigation must be used within an InvestigationProvider");
  }
  return context;
}
