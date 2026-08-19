export const SPIDERFOOT_URL = process.env.SPIDERFOOT_URL || "http://127.0.0.1:8080";

export interface ScanStatus {
  scanId: string;
  name: string;
  created: string;
  started: string;
  ended: string;
  status: string;
  riskmatrix: Record<string, number>;
}

export interface ScanResult {
  time: string;
  data: string;
  source_data: string;
  module: string;
  confidence: number;
  visibility: number;
  risk: string;
  hash: string;
  fp: number;
  parent_fp: number;
  type: string;
}

/**
 * Validates a target to ensure it is likely a domain, IP, or network.
 * Disallows command injection characters.
 */
export function isValidTarget(target: string): boolean {
  if (!target || target.length > 255) return false;
  // Block any characters commonly used for command injection or arbitrary execution
  const blockedChars = /[$&|;<>`'"\\]/;
  if (blockedChars.test(target)) return false;
  return true;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${SPIDERFOOT_URL}/ping`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data && data[0] === "SUCCESS";
  } catch (error) {
    return false;
  }
}

export async function startScan(target: string): Promise<string> {
  if (!isValidTarget(target)) {
    throw new Error("Invalid target format");
  }

  // startscan expects POST parameters (form data)
  const formData = new URLSearchParams();
  formData.append("scanname", `Dashboard Scan: ${target}`);
  formData.append("scantarget", target);
  formData.append("usecase", "all");
  formData.append("modulelist", "");
  formData.append("typelist", "");

  const res = await fetch(`${SPIDERFOOT_URL}/startscan`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`SpiderFoot returned status ${res.status}`);
  }

  const data = await res.json();
  if (data[0] === "ERROR") {
    throw new Error(data[1] || "Unknown error starting scan");
  }

  // Success returns ["SUCCESS", "scanId"]
  return data[1];
}

export async function getScanHistory(): Promise<any[]> {
  const res = await fetch(`${SPIDERFOOT_URL}/scanlist`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`SpiderFoot returned status ${res.status}`);
  }

  const data = await res.json();
  
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item: any[]) => ({
    scanId: item[0],
    name: item[1],
    target: item[2],
    created: item[3],
    started: item[4],
    ended: item[5],
    status: item[6],
    elements: item[7]
  }));
}

export async function getScanStatus(scanId: string): Promise<ScanStatus | null> {
  const res = await fetch(`${SPIDERFOOT_URL}/scanstatus?id=${encodeURIComponent(scanId)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`SpiderFoot returned status ${res.status}`);
  }

  const data = await res.json();
  
  if (!data || data.length === 0) {
    return null;
  }

  // [data[0], data[1], created, started, ended, data[5], riskmatrix]
  // data[0] is scanId, data[1] is name, data[5] is status string
  return {
    scanId: data[0],
    name: data[1],
    created: data[2],
    started: data[3],
    ended: data[4],
    status: data[5],
    riskmatrix: data[6] || {},
  };
}

export async function getScanResults(scanId: string): Promise<ScanResult[]> {
  const res = await fetch(`${SPIDERFOOT_URL}/scaneventresults?id=${encodeURIComponent(scanId)}&eventType=ALL`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`SpiderFoot returned status ${res.status}`);
  }

  const data = await res.json();
  
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item: any[]) => ({
    time: item[0],
    data: item[1],
    source_data: item[2],
    module: item[3],
    confidence: item[4],
    visibility: item[5],
    risk: item[6],
    hash: item[7],
    fp: item[8],
    parent_fp: item[9],
    type: item[10],
  }));
}

export async function stopScan(scanId: string): Promise<boolean> {
  const res = await fetch(`${SPIDERFOOT_URL}/stopscan?id=${encodeURIComponent(scanId)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`SpiderFoot returned status ${res.status}`);
  }

  const text = await res.text();
  if (text) {
    try {
      const data = JSON.parse(text);
      if (data && data[0] === "ERROR") {
        throw new Error(data[1] || "Failed to stop scan");
      }
    } catch (e) {
      if (e instanceof Error && e.message !== "Failed to stop scan") {
        console.error("Failed to parse JSON in stopScan:", text);
      } else {
        throw e;
      }
    }
  }

  return true;
}

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  size: string;
  color: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface ScanGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function getScanGraph(scanId: string): Promise<ScanGraph | null> {
  const res = await fetch(`${SPIDERFOOT_URL}/scanviz?id=${encodeURIComponent(scanId)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`SpiderFoot returned status ${res.status}`);
  }

  const text = await res.text();
  if (!text || text === 'None') {
    return null;
  }

  try {
    return JSON.parse(text) as ScanGraph;
  } catch (e) {
    console.error("Failed to parse JSON in getScanGraph:", text);
    return null;
  }
}
