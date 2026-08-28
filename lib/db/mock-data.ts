import { GraphData, GraphNode, GraphRelationship, ScenarioExecutionResult } from "../types";

export const MOCK_GRAPH_DATA: GraphData = {
  nodes: [
    // -------------------------------------------------------------
    // Circular Ring 1 (4-hop cycle)
    // -------------------------------------------------------------
    { id: "ACC-RING-101", labels: ["Account"], properties: { account_id: "ACC-RING-101", owner_name: "Elena Rostova", balance: 145000, risk_score: 92, status: "Flagged", country: "CY" } },
    { id: "ACC-RING-102", labels: ["Account"], properties: { account_id: "ACC-RING-102", owner_name: "Lumina Trading Ltd", balance: 82000, risk_score: 88, status: "Flagged", country: "MT" } },
    { id: "ACC-RING-103", labels: ["Account"], properties: { account_id: "ACC-RING-103", owner_name: "Silvergate Logistics", balance: 91000, risk_score: 89, status: "Flagged", country: "AE" } },
    { id: "ACC-RING-104", labels: ["Account"], properties: { account_id: "ACC-RING-104", owner_name: "Zeta Consulting FZE", balance: 138000, risk_score: 94, status: "Flagged", country: "PA" } },

    // Circular Ring 2 (5-hop cycle)
    { id: "ACC-RING-201", labels: ["Account"], properties: { account_id: "ACC-RING-201", owner_name: "Marcus Vance", balance: 210000, risk_score: 96, status: "Critical", country: "GB" } },
    { id: "ACC-RING-202", labels: ["Account"], properties: { account_id: "ACC-RING-202", owner_name: "Aegis Premier Capital", balance: 195000, risk_score: 85, status: "Flagged", country: "LU" } },
    { id: "ACC-RING-203", labels: ["Account"], properties: { account_id: "ACC-RING-203", owner_name: "Boreal Horizon SA", balance: 180000, risk_score: 87, status: "Flagged", country: "CH" } },
    { id: "ACC-RING-204", labels: ["Account"], properties: { account_id: "ACC-RING-204", owner_name: "Krypton Global Trade", balance: 172000, risk_score: 91, status: "Flagged", country: "SG" } },
    { id: "ACC-RING-205", labels: ["Account"], properties: { account_id: "ACC-RING-205", owner_name: "Helios Management Corp", balance: 205000, risk_score: 95, status: "Critical", country: "VG" } },

    // -------------------------------------------------------------
    // Synthetic Identity Cluster
    // -------------------------------------------------------------
    { id: "PER-SYN-01", labels: ["Person"], properties: { person_id: "PER-SYN-01", name: "David K. Miller", synthetic_probability: 0.94, risk_score: 95 } },
    { id: "PER-SYN-02", labels: ["Person"], properties: { person_id: "PER-SYN-02", name: "D. Keith Miller", synthetic_probability: 0.91, risk_score: 92 } },
    { id: "PER-SYN-03", labels: ["Person"], properties: { person_id: "PER-SYN-03", name: "David Kyle-Miller", synthetic_probability: 0.89, risk_score: 90 } },
    { id: "SSN-992-01-4432", labels: ["SSN", "Identifier"], properties: { ssn: "992-01-4432", issued_state: "NV", flagged_synthetic: true } },
    { id: "PHN-555-0184", labels: ["Phone", "Identifier"], properties: { phone_number: "+1-202-555-0184", carrier: "VoIP Provider (Twilio)", burner: true } },
    { id: "DEV-FP-99A", labels: ["Device", "Identifier"], properties: { device_fingerprint: "FP-88910-CHROME-WIN", emulator: true, proxy: true } },
    { id: "IP-198-51-100-24", labels: ["IPAddress", "Identifier"], properties: { ip_address: "198.51.100.24", asn: "AS13335 (Tor Exit Node)", vpn: true } },
    { id: "ACC-SYN-801", labels: ["Account"], properties: { account_id: "ACC-SYN-801", owner_name: "David K. Miller", balance: 34000, risk_score: 88, status: "Frozen" } },
    { id: "ACC-SYN-802", labels: ["Account"], properties: { account_id: "ACC-SYN-802", owner_name: "D. Keith Miller", balance: 41000, risk_score: 87, status: "Frozen" } },

    // -------------------------------------------------------------
    // Mule Fan-In / Fan-Out Network
    // -------------------------------------------------------------
    { id: "ACC-MULE-HUB", labels: ["Account"], properties: { account_id: "ACC-MULE-HUB", owner_name: "Jordan Lee (Mule)", balance: 14000, risk_score: 98, status: "Mule", type: "Mule" } },
    { id: "ACC-FEEDER-01", labels: ["Account"], properties: { account_id: "ACC-FEEDER-01", owner_name: "Micro Feeder A", balance: 2500, risk_score: 65, type: "Feeder" } },
    { id: "ACC-FEEDER-02", labels: ["Account"], properties: { account_id: "ACC-FEEDER-02", owner_name: "Micro Feeder B", balance: 1800, risk_score: 62, type: "Feeder" } },
    { id: "ACC-FEEDER-03", labels: ["Account"], properties: { account_id: "ACC-FEEDER-03", owner_name: "Micro Feeder C", balance: 3100, risk_score: 64, type: "Feeder" } },
    { id: "ACC-FEEDER-04", labels: ["Account"], properties: { account_id: "ACC-FEEDER-04", owner_name: "Micro Feeder D", balance: 2200, risk_score: 67, type: "Feeder" } },
    { id: "ACC-SINK-OFFSHORE", labels: ["Account"], properties: { account_id: "ACC-SINK-OFFSHORE", owner_name: "Crestview Crypto Custody", balance: 890000, risk_score: 95, status: "High Risk", type: "Sink" } },
    { id: "ACC-SINK-CASH", labels: ["Account"], properties: { account_id: "ACC-SINK-CASH", owner_name: "Hawala Broker Dubai", balance: 450000, risk_score: 97, status: "Sanctioned Watchlist", type: "Sink" } },

    // -------------------------------------------------------------
    // Sanctioned Entity Proximity Chain
    // -------------------------------------------------------------
    { id: "SANCTION-OFAC-77", labels: ["SanctionedEntity"], properties: { entity_id: "SANCTION-OFAC-77", name: "Al-Baraka Syndicate Assets", sanction_program: "SDNTK / OFAC Global", country: "SY", designation_date: "2023-04-12" } },
    { id: "ACC-TARGET-UNDER-REVIEW", labels: ["Account"], properties: { account_id: "ACC-TARGET-UNDER-REVIEW", owner_name: "Prime Atlantic Commodities", balance: 320000, risk_score: 84, status: "Under Review" } },
    { id: "COMP-INTERMEDIARY-1", labels: ["Company"], properties: { company_id: "COMP-INTERMEDIARY-1", name: "Levant Shipping FZE", jurisdiction: "Cyprus", risk_score: 89 } },
    { id: "ACC-BRIDGE-44", labels: ["Account"], properties: { account_id: "ACC-BRIDGE-44", owner_name: "Nexus Port Services", balance: 110000, risk_score: 91 } },

    // -------------------------------------------------------------
    // UBO Corporate Shell Chain
    // -------------------------------------------------------------
    { id: "COMP-SHELL-01", labels: ["Company"], properties: { company_id: "COMP-SHELL-01", name: "Vanguard Maritime Holdings", jurisdiction: "British Virgin Islands", tax_haven: true, incorporation_year: 2019 } },
    { id: "COMP-SHELL-02", labels: ["Company"], properties: { company_id: "COMP-SHELL-02", name: "Zephyr Nominee Trust Ltd", jurisdiction: "Cayman Islands", tax_haven: true, incorporation_year: 2020 } },
    { id: "COMP-SHELL-03", labels: ["Company"], properties: { company_id: "COMP-SHELL-03", name: "Pacific Meridian Offshore SA", jurisdiction: "Panama", tax_haven: true, incorporation_year: 2018 } },
    { id: "COMP-OPERATING-01", labels: ["Company"], properties: { company_id: "COMP-OPERATING-01", name: "Alpha Steel & Logistics LLC", jurisdiction: "United Kingdom", tax_haven: false, incorporation_year: 2015 } },
    { id: "PER-UBO-BENEFICIARY", labels: ["Person"], properties: { person_id: "PER-UBO-BENEFICIARY", name: "Viktor V. Chernov", citizenship: "Saint Kitts & Nevis (CBI)", pep_status: true, risk_score: 96 } },
  ],
  relationships: [
    // Circular Ring 1 (4 hops)
    { id: "REL-R1-1", type: "TRANSFERRED", startNodeId: "ACC-RING-101", endNodeId: "ACC-RING-102", properties: { amount: 65000, currency: "USD", timestamp: "2026-08-10T14:20:00Z", tx_id: "TX-7701" } },
    { id: "REL-R1-2", type: "TRANSFERRED", startNodeId: "ACC-RING-102", endNodeId: "ACC-RING-103", properties: { amount: 63500, currency: "USD", timestamp: "2026-08-10T15:10:00Z", tx_id: "TX-7702" } },
    { id: "REL-R1-3", type: "TRANSFERRED", startNodeId: "ACC-RING-103", endNodeId: "ACC-RING-104", properties: { amount: 61800, currency: "USD", timestamp: "2026-08-10T16:05:00Z", tx_id: "TX-7703" } },
    { id: "REL-R1-4", type: "TRANSFERRED", startNodeId: "ACC-RING-104", endNodeId: "ACC-RING-101", properties: { amount: 59500, currency: "USD", timestamp: "2026-08-10T17:00:00Z", tx_id: "TX-7704" } },

    // Circular Ring 2 (5 hops)
    { id: "REL-R2-1", type: "TRANSFERRED", startNodeId: "ACC-RING-201", endNodeId: "ACC-RING-202", properties: { amount: 120000, currency: "EUR", timestamp: "2026-08-14T09:30:00Z", tx_id: "TX-8801" } },
    { id: "REL-R2-2", type: "TRANSFERRED", startNodeId: "ACC-RING-202", endNodeId: "ACC-RING-203", properties: { amount: 118000, currency: "EUR", timestamp: "2026-08-14T11:00:00Z", tx_id: "TX-8802" } },
    { id: "REL-R2-3", type: "TRANSFERRED", startNodeId: "ACC-RING-203", endNodeId: "ACC-RING-204", properties: { amount: 115000, currency: "EUR", timestamp: "2026-08-14T13:45:00Z", tx_id: "TX-8803" } },
    { id: "REL-R2-4", type: "TRANSFERRED", startNodeId: "ACC-RING-204", endNodeId: "ACC-RING-205", properties: { amount: 112000, currency: "EUR", timestamp: "2026-08-14T15:20:00Z", tx_id: "TX-8804" } },
    { id: "REL-R2-5", type: "TRANSFERRED", startNodeId: "ACC-RING-205", endNodeId: "ACC-RING-201", properties: { amount: 109000, currency: "EUR", timestamp: "2026-08-14T18:00:00Z", tx_id: "TX-8805" } },

    // Synthetic Identity Cluster
    { id: "REL-SYN-1", type: "HAS_IDENTIFIER", startNodeId: "PER-SYN-01", endNodeId: "SSN-992-01-4432", properties: { verified: false } },
    { id: "REL-SYN-2", type: "HAS_IDENTIFIER", startNodeId: "PER-SYN-02", endNodeId: "SSN-992-01-4432", properties: { verified: false } },
    { id: "REL-SYN-3", type: "HAS_IDENTIFIER", startNodeId: "PER-SYN-01", endNodeId: "PHN-555-0184", properties: { primary: true } },
    { id: "REL-SYN-4", type: "HAS_IDENTIFIER", startNodeId: "PER-SYN-03", endNodeId: "PHN-555-0184", properties: { primary: true } },
    { id: "REL-SYN-5", type: "USES_DEVICE", startNodeId: "PER-SYN-01", endNodeId: "DEV-FP-99A", properties: { sessions: 42 } },
    { id: "REL-SYN-6", type: "USES_DEVICE", startNodeId: "PER-SYN-02", endNodeId: "DEV-FP-99A", properties: { sessions: 38 } },
    { id: "REL-SYN-7", type: "LOGS_FROM_IP", startNodeId: "PER-SYN-02", endNodeId: "IP-198-51-100-24", properties: { last_login: "2026-08-20" } },
    { id: "REL-SYN-8", type: "LOGS_FROM_IP", startNodeId: "PER-SYN-03", endNodeId: "IP-198-51-100-24", properties: { last_login: "2026-08-21" } },
    { id: "REL-SYN-9", type: "CONTROLS", startNodeId: "PER-SYN-01", endNodeId: "ACC-SYN-801", properties: { since: "2026-01-15" } },
    { id: "REL-SYN-10", type: "CONTROLS", startNodeId: "PER-SYN-02", endNodeId: "ACC-SYN-802", properties: { since: "2026-02-10" } },

    // Mule Fan-In / Fan-Out
    { id: "REL-MULE-IN-1", type: "TRANSFERRED", startNodeId: "ACC-FEEDER-01", endNodeId: "ACC-MULE-HUB", properties: { amount: 9400, timestamp: "2026-08-22T08:15:00Z", tx_id: "TX-SMURF-1" } },
    { id: "REL-MULE-IN-2", type: "TRANSFERRED", startNodeId: "ACC-FEEDER-02", endNodeId: "ACC-MULE-HUB", properties: { amount: 9200, timestamp: "2026-08-22T08:22:00Z", tx_id: "TX-SMURF-2" } },
    { id: "REL-MULE-IN-3", type: "TRANSFERRED", startNodeId: "ACC-FEEDER-03", endNodeId: "ACC-MULE-HUB", properties: { amount: 9600, timestamp: "2026-08-22T08:35:00Z", tx_id: "TX-SMURF-3" } },
    { id: "REL-MULE-IN-4", type: "TRANSFERRED", startNodeId: "ACC-FEEDER-04", endNodeId: "ACC-MULE-HUB", properties: { amount: 9500, timestamp: "2026-08-22T08:48:00Z", tx_id: "TX-SMURF-4" } },
    { id: "REL-MULE-OUT-1", type: "TRANSFERRED", startNodeId: "ACC-MULE-HUB", endNodeId: "ACC-SINK-OFFSHORE", properties: { amount: 58000, timestamp: "2026-08-22T09:30:00Z", tx_id: "TX-DISBURSE-1" } },
    { id: "REL-MULE-OUT-2", type: "TRANSFERRED", startNodeId: "ACC-MULE-HUB", endNodeId: "ACC-SINK-CASH", properties: { amount: 49000, timestamp: "2026-08-22T09:45:00Z", tx_id: "TX-DISBURSE-2" } },

    // Sanctioned Proximity Chain
    { id: "REL-SANC-1", type: "TRANSFERRED", startNodeId: "ACC-TARGET-UNDER-REVIEW", endNodeId: "ACC-BRIDGE-44", properties: { amount: 240000, timestamp: "2026-07-15" } },
    { id: "REL-SANC-2", type: "CONTROLS", startNodeId: "COMP-INTERMEDIARY-1", endNodeId: "ACC-BRIDGE-44", properties: { ownership_percent: 100 } },
    { id: "REL-SANC-3", type: "BENEFICIAL_OWNER_OF", startNodeId: "SANCTION-OFAC-77", endNodeId: "COMP-INTERMEDIARY-1", properties: { share_pct: 65, direct: true } },

    // UBO Corporate Shell Chain
    { id: "REL-UBO-1", type: "OWNED_BY", startNodeId: "COMP-OPERATING-01", endNodeId: "COMP-SHELL-01", properties: { equity_percent: 100 } },
    { id: "REL-UBO-2", type: "OWNED_BY", startNodeId: "COMP-SHELL-01", endNodeId: "COMP-SHELL-02", properties: { equity_percent: 100 } },
    { id: "REL-UBO-3", type: "OWNED_BY", startNodeId: "COMP-SHELL-02", endNodeId: "COMP-SHELL-03", properties: { equity_percent: 100 } },
    { id: "REL-UBO-4", type: "OWNED_BY", startNodeId: "COMP-SHELL-03", endNodeId: "PER-UBO-BENEFICIARY", properties: { equity_percent: 100, role: "Ultimate Beneficial Owner" } },
  ],
};

export function getMockScenarioResult(scenarioId: string, params: Record<string, any> = {}): ScenarioExecutionResult {
  const nodeMap = new Map<string, GraphNode>();
  const relMap = new Map<string, GraphRelationship>();

  let insights: string[] = [];
  let riskScore = 85;

  if (scenarioId === "circular_laundering") {
    // Return circular laundering nodes & rels
    const ringIds = ["ACC-RING-101", "ACC-RING-102", "ACC-RING-103", "ACC-RING-104", "ACC-RING-201", "ACC-RING-202", "ACC-RING-203", "ACC-RING-204", "ACC-RING-205"];
    MOCK_GRAPH_DATA.nodes.filter((n) => ringIds.includes(n.id)).forEach((n) => nodeMap.set(n.id, n));
    MOCK_GRAPH_DATA.relationships.filter((r) => r.id.startsWith("REL-R1") || r.id.startsWith("REL-R2")).forEach((r) => relMap.set(r.id, r));
    insights = [
      "Detected 2 closed transaction loops (4-hop and 5-hop) spanning 9 intermediary accounts.",
      "Total cycle volume exceeds $830,000 transferred within tight 4-hour temporal windows.",
      "Originator 'Elena Rostova' (CY) re-acquired 91.5% of structured funds via Panama intermediary.",
    ];
    riskScore = 96;
  } else if (scenarioId === "synthetic_identity") {
    const synIds = ["PER-SYN-01", "PER-SYN-02", "PER-SYN-03", "SSN-992-01-4432", "PHN-555-0184", "DEV-FP-99A", "IP-198-51-100-24", "ACC-SYN-801", "ACC-SYN-802"];
    MOCK_GRAPH_DATA.nodes.filter((n) => synIds.includes(n.id)).forEach((n) => nodeMap.set(n.id, n));
    MOCK_GRAPH_DATA.relationships.filter((r) => r.id.startsWith("REL-SYN")).forEach((r) => relMap.set(r.id, r));
    insights = [
      "Bipartite cluster isolated 3 synthetic persons sharing a single SSN (issued in NV) and VoIP phone.",
      "Both personas accessed accounts from identical device fingerprint (FP-88910) behind a Tor exit node.",
      "Collusive credit exposure: $75,000 across 2 active checking accounts.",
    ];
    riskScore = 93;
  } else if (scenarioId === "mule_layering") {
    const muleIds = ["ACC-MULE-HUB", "ACC-FEEDER-01", "ACC-FEEDER-02", "ACC-FEEDER-03", "ACC-FEEDER-04", "ACC-SINK-OFFSHORE", "ACC-SINK-CASH"];
    MOCK_GRAPH_DATA.nodes.filter((n) => muleIds.includes(n.id)).forEach((n) => nodeMap.set(n.id, n));
    MOCK_GRAPH_DATA.relationships.filter((r) => r.id.startsWith("REL-MULE")).forEach((r) => relMap.set(r.id, r));
    insights = [
      "Mule account 'ACC-MULE-HUB' received 4 structured deposits under $10,000 threshold within 33 minutes.",
      "Rapid consolidation velocity: 100% of smurfed funds dispatched to offshore crypto sink in under 1 hour.",
      "Betweenness centrality anomaly: In-degree = 4, Out-degree = 2, Dwell time < 45 mins.",
    ];
    riskScore = 94;
  } else if (scenarioId === "sanction_proximity") {
    const sancIds = ["SANCTION-OFAC-77", "ACC-TARGET-UNDER-REVIEW", "COMP-INTERMEDIARY-1", "ACC-BRIDGE-44"];
    MOCK_GRAPH_DATA.nodes.filter((n) => sancIds.includes(n.id)).forEach((n) => nodeMap.set(n.id, n));
    MOCK_GRAPH_DATA.relationships.filter((r) => r.id.startsWith("REL-SANC")).forEach((r) => relMap.set(r.id, r));
    insights = [
      "Shortest path distance = 3 hops from OFAC SDNTK designated entity 'Al-Baraka Syndicate'.",
      "Bridge entity 'Levant Shipping FZE' is 65% beneficially owned by sanctioned principal.",
      "High-risk nexus: Immediate SAR (Suspicious Activity Report) filing recommended.",
    ];
    riskScore = 98;
  } else if (scenarioId === "ubo_layering") {
    const uboIds = ["COMP-SHELL-01", "COMP-SHELL-02", "COMP-SHELL-03", "COMP-OPERATING-01", "PER-UBO-BENEFICIARY"];
    MOCK_GRAPH_DATA.nodes.filter((n) => uboIds.includes(n.id)).forEach((n) => nodeMap.set(n.id, n));
    MOCK_GRAPH_DATA.relationships.filter((r) => r.id.startsWith("REL-UBO")).forEach((r) => relMap.set(r.id, r));
    insights = [
      "Unwound 4-tier offshore holding chain through UK -> BVI -> Cayman Islands -> Panama.",
      "Ultimate Beneficial Owner identified as Viktor V. Chernov (Saint Kitts CBI / PEP).",
      "100% equity concentration masked through sequential nominee trusts.",
    ];
    riskScore = 89;
  } else {
    // Return all
    MOCK_GRAPH_DATA.nodes.forEach((n) => nodeMap.set(n.id, n));
    MOCK_GRAPH_DATA.relationships.forEach((r) => relMap.set(r.id, r));
    insights = ["Full forensic dataset overview across all AML typologies."];
  }

  const nodes = Array.from(nodeMap.values());
  const relationships = Array.from(relMap.values());

  return {
    scenarioId,
    executionTimeMs: 14,
    cypher: `// Simulated openCypher query for: ${scenarioId}`,
    params,
    graph: { nodes, relationships },
    summary: {
      nodesFound: nodes.length,
      relationshipsFound: relationships.length,
      findingsCount: relationships.length,
      riskScore,
      insights,
    },
    tableResults: nodes.map((n) => ({
      id: n.id,
      labels: n.labels.join(", "),
      name: n.properties.name || n.properties.owner_name || n.properties.company_name || n.properties.ssn || n.id,
      riskScore: n.properties.risk_score || n.properties.synthetic_probability || "N/A",
      status: n.properties.status || "Active",
    })),
    isDemoMode: true,
  };
}
