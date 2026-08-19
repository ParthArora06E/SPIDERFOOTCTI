import { ScanResult } from "./spiderfoot";

// Deterministic fallback mapping of event types to risks if SpiderFoot doesn't provide them.
// This ensures that we have a professional SOC-level classification.
const EVENT_RISK_MAPPING: Record<string, string> = {
  // CRITICAL
  "VULNERABILITY_GENERAL": "CRITICAL",
  "VULNERABILITY_CVE": "CRITICAL",
  "DATA_BREACH": "CRITICAL",
  "LEAKED_PASSWORD": "CRITICAL",
  "PASSWORD_COMPROMISED": "CRITICAL",
  
  // HIGH
  "OPEN_TCP_PORT": "HIGH",
  "OPEN_UDP_PORT": "HIGH",
  "MALICIOUS_IP": "HIGH",
  "MALICIOUS_DOMAIN": "HIGH",
  "BLACKLISTED_IP": "HIGH",
  "BLACKLISTED_SUBNET": "HIGH",
  "WEAK_SSL_CERT": "HIGH",

  // MEDIUM
  "EMAILADDR": "MEDIUM",
  "EMAILADDR_COMPROMISED": "MEDIUM",
  "PHONE_NUMBER": "MEDIUM",
  "USERNAME": "MEDIUM",
  "SOCIAL_MEDIA_PROFILE": "MEDIUM",
  "SOFTWARE_USED": "MEDIUM",
  "HTTP_HEADER_VULN": "MEDIUM",

  // LOW
  "DOMAIN_NAME": "LOW",
  "SUBDOMAIN": "LOW",
  "DNS_NAME": "LOW",
  "DNS_RECORD": "LOW",
  "IP_ADDRESS": "LOW",
  "NETBLOCK": "LOW",
  "BGP_AS": "LOW",
  "GEOINFO": "LOW",
  "COMPANY_NAME": "LOW",
  
  // INFO (Default)
  "SSL_CERTIFICATE": "INFO",
  "WEB_CONTENT": "INFO",
  "HTTP_CODE": "INFO",
  "LINKED_URL": "INFO",
  "TCP_PORT_OPEN": "INFO", // Sometimes named this way
};

export interface RiskDistributionEntry {
  risk: string;
  count: number;
  percentage: number;
  color: string;
}

const RISK_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444", // Red
  HIGH: "#f97316", // Orange
  MEDIUM: "#eab308", // Yellow
  LOW: "#3b82f6", // Blue
  INFO: "#64748b", // Slate
};

export function classifyEventRisk(event: ScanResult): string {
  // Always prefer native risk if it is a valid string and not "UNKNOWN"
  if (event.risk && typeof event.risk === "string" && event.risk.trim() !== "" && event.risk !== "UNKNOWN") {
    const r = event.risk.toUpperCase();
    if (["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"].includes(r)) {
      return r;
    }
  }

  // Fallback to our application-level mapping
  const mappedRisk = EVENT_RISK_MAPPING[event.type];
  if (mappedRisk) {
    return mappedRisk;
  }

  // Default to INFO for unmapped events
  return "INFO";
}

export function aggregateRiskDistribution(events: ScanResult[]): { total: number, distribution: RiskDistributionEntry[] } {
  const counts: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    INFO: 0
  };

  events.forEach(event => {
    const risk = classifyEventRisk(event);
    counts[risk] = (counts[risk] || 0) + 1;
  });

  const total = events.length;

  if (total === 0) {
    return { total: 0, distribution: [] };
  }

  const distribution = Object.entries(counts)
    .filter(([_, count]) => count > 0)
    .map(([risk, count]) => ({
      risk,
      count,
      percentage: Math.round((count / total) * 100),
      color: RISK_COLORS[risk] || RISK_COLORS.INFO
    }))
    .sort((a, b) => {
      // Sort by severity (CRITICAL -> INFO)
      const order = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
      return order.indexOf(a.risk) - order.indexOf(b.risk);
    });

  return { total, distribution };
}
