import { GraphData, GraphNode, GraphRelationship, ScenarioDefinition } from "../types";

export const SCENARIO_DEFINITIONS: ScenarioDefinition[] = [
  {
    id: "circular_laundering",
    title: "Circular Money Laundering Rings",
    subtitle: "Arbitrary-Length Cyclic Flow Detection (3-6 Hops)",
    category: "AML Topology",
    riskLevel: "CRITICAL",
    badge: "Cycle Traversal",
    description:
      "Detects closed transaction loops where illicit funds are transferred across a chain of intermediary accounts (layering) and routed back to the originator or colluding accounts to obscure audit trails.",
    relationalProblem:
      "In SQL, finding arbitrary cycles of length 3 to 6 requires 5-6 self-joins on a massive transaction table with cyclic condition checks, or complex recursive CTEs that explode exponentially in memory and risk infinite recursion.",
    graphSuperpower:
      "openCypher evaluates graph path topologies natively using index-free adjacency. Path traversal is O(k) relative to local degree rather than O(N^k) table scans.",
    defaultCypher: `MATCH path = (a1:Account)-[:TRANSFERRED]->(a2:Account)-[:TRANSFERRED]->(a3:Account)-[:TRANSFERRED*1..3]->(a1)
WHERE a1.account_id < a2.account_id 
  AND ALL(rel IN relationships(path) WHERE rel.amount >= $minAmount)
RETURN path, 
       [n IN nodes(path) | n.account_id] AS cycleNodes, 
       reduce(total = 0, rel IN relationships(path) | total + rel.amount) AS totalVolume, 
       length(path) AS cycleLength
ORDER BY totalVolume DESC 
LIMIT $limit`,
    defaultParams: {
      minAmount: 10000,
      limit: 15,
    },
    paramDescriptions: {
      minAmount: { label: "Minimum Transfer Amount ($)", type: "number", default: 10000 },
      limit: { label: "Max Rings Returned", type: "number", default: 15 },
    },
  },
  {
    id: "synthetic_identity",
    title: "Synthetic Identity Fraud Rings",
    subtitle: "Bipartite Shared Identity & Device Clusters",
    category: "Identity Fraud",
    riskLevel: "CRITICAL",
    badge: "Bipartite Clustering",
    description:
      "Identifies synthetic identities created by combining real and fabricated credentials (SSN, phone, device fingerprint, IP) that are reused across ostensibly unrelated customer profiles.",
    relationalProblem:
      "Detecting shared identity vertices across 4 different attribute tables in SQL requires joining Users to SSNs, Phones, Devices, and IPs, then self-joining back to Users for each attribute, generating huge intermediate Cartesian products.",
    graphSuperpower:
      "In openCypher, bipartite pattern matching `(p1:Person)-[:HAS_IDENTIFIER]->(shared)<-[:HAS_IDENTIFIER]-(p2:Person)` effortlessly traverses heterogeneous relationship types without schema redesign.",
    defaultCypher: `MATCH (p1:Person)-[r1:HAS_IDENTIFIER|USES_DEVICE|LOGS_FROM_IP]->(shared)<-[r2:HAS_IDENTIFIER|USES_DEVICE|LOGS_FROM_IP]-(p2:Person)
WHERE id(p1) < id(p2)
OPTIONAL MATCH (p1)-[c1:CONTROLS]->(a1:Account)
OPTIONAL MATCH (p2)-[c2:CONTROLS]->(a2:Account)
RETURN p1, r1, shared, r2, p2, c1, a1, c2, a2, labels(shared) AS sharedType
LIMIT $limit`,
    defaultParams: {
      limit: 25,
    },
    paramDescriptions: {
      limit: { label: "Max Entity Pairs", type: "number", default: 25 },
    },
  },
  {
    id: "mule_layering",
    title: "Rapid Mule Account Layering & Fan-Out",
    subtitle: "Smurfing Funnel & High-Velocity Disbursement",
    category: "Velocity Risk",
    riskLevel: "HIGH",
    badge: "Funnel Velocity",
    description:
      "Uncovers mule accounts that aggregate multiple structured deposits (smurfing below reporting thresholds) from dozens of feeder accounts, followed by immediate consolidation and rapid fan-out to offshore sinks.",
    relationalProblem:
      "Calculating inflow fan-in count, outflow fan-out count, and transaction velocity across accounts in SQL requires complex GROUP BY, window functions, and multi-pass temporal joins.",
    graphSuperpower:
      "Graph traversals match the entire topology in a single query expression, naturally isolating high-betweenness mule mediator nodes.",
    defaultCypher: `MATCH (feeder:Account)-[inflow:TRANSFERRED]->(mule:Account)-[outflow:TRANSFERRED]->(sink:Account)
WHERE inflow.amount <= $smurfingThreshold 
  AND outflow.amount >= $fanOutThreshold
  AND mule.risk_score >= 60
RETURN feeder, inflow, mule, outflow, sink
LIMIT $limit`,
    defaultParams: {
      smurfingThreshold: 9900,
      fanOutThreshold: 45000,
      limit: 30,
    },
    paramDescriptions: {
      smurfingThreshold: { label: "Smurfing Ceiling ($)", type: "number", default: 9900 },
      fanOutThreshold: { label: "Disbursement Floor ($)", type: "number", default: 45000 },
      limit: { label: "Max Flows", type: "number", default: 30 },
    },
  },
  {
    id: "sanction_proximity",
    title: "Sanction Distance & Blast Radius",
    subtitle: "Shortest-Path Proximity to OFAC / Sanctioned Targets",
    category: "Sanctions & Compliance",
    riskLevel: "CRITICAL",
    badge: "Shortest Path",
    description:
      "Calculates the exact network distance and transaction/ownership chain between accounts under review and known sanctioned individuals or designated terrorist/narcotics entities.",
    relationalProblem:
      "Shortest path search in SQL requires Breadth-First-Search (BFS) written in procedural PL/SQL or recursive CTEs with cycle tracking arrays, which are slow and brittle.",
    graphSuperpower:
      "Cypher provides built-in `shortestPath()` and `allShortestPaths()` graph algorithms that run in milliseconds over graph indices.",
    defaultCypher: `MATCH (sanctioned:SanctionedEntity)
MATCH (target:Account)
WHERE target.risk_score >= $minRiskScore
MATCH path = shortestPath((target)-[:TRANSFERRED|CONTROLS|BENEFICIAL_OWNER_OF*1..5]-(sanctioned))
WHERE target.account_id <> sanctioned.entity_id
RETURN path, target, sanctioned, length(path) AS distance
ORDER BY distance ASC, target.risk_score DESC
LIMIT $limit`,
    defaultParams: {
      minRiskScore: 70,
      limit: 15,
    },
    paramDescriptions: {
      minRiskScore: { label: "Target Min Risk Score (0-100)", type: "number", default: 70 },
      limit: { label: "Max Paths", type: "number", default: 15 },
    },
  },
  {
    id: "ubo_layering",
    title: "Ultimate Beneficial Ownership (UBO) Unwinding",
    subtitle: "Multi-Tier Offshore Shell Company Decomposition",
    category: "Corporate Layering",
    riskLevel: "HIGH",
    badge: "Recursive Tree",
    description:
      "Traverses recursive multi-tier corporate ownership structures through offshore tax havens (BVI, Cayman, Panama) to reveal the real human ultimate beneficial owner behind complex holding companies.",
    relationalProblem:
      "Relational hierarchical queries struggle when ownership is a directed acyclic graph (DAG) or contains joint cross-holdings with variable percentages at each tier.",
    graphSuperpower:
      "Variable-length ownership patterns `(c:Company)-[:OWNED_BY*1..8]->(u:Person)` effortlessly unwind arbitrary corporate trees.",
    defaultCypher: `MATCH path = (c:Company)-[:OWNED_BY*1..8]->(u:Person)
WHERE c.jurisdiction IN $jurisdictions
RETURN path, c, u, 
       [n IN nodes(path) | coalesce(n.name, n.company_name)] AS ownershipChain, 
       length(path) AS layerDepth
ORDER BY layerDepth DESC 
LIMIT $limit`,
    defaultParams: {
      jurisdictions: ["British Virgin Islands", "Cayman Islands", "Panama", "Seychelles", "Cyprus"],
      limit: 20,
    },
    paramDescriptions: {
      limit: { label: "Max Ownership Chains", type: "number", default: 20 },
    },
  },
];

/**
 * Helper to parse Neo4j records and paths into clean GraphData format
 */
export function extractGraphFromRecords(records: any[]): GraphData {
  const nodeMap = new Map<string, GraphNode>();
  const relMap = new Map<string, GraphRelationship>();

  function processItem(item: any) {
    if (!item) return;

    // Check if it's a Neo4j Node
    if (item.labels && Array.isArray(item.labels) && item.properties) {
      const id = String(item.elementId || item.identity || item.properties.id || item.properties.account_id || item.properties.entity_id || Math.random());
      if (!nodeMap.has(id)) {
        nodeMap.set(id, {
          id,
          labels: item.labels,
          properties: item.properties,
        });
      }
      return;
    }

    // Check if it's a Neo4j Relationship
    if (item.type && item.startNodeElementId !== undefined && item.endNodeElementId !== undefined) {
      const id = String(item.elementId || item.identity || `${item.startNodeElementId}->${item.endNodeElementId}`);
      if (!relMap.has(id)) {
        relMap.set(id, {
          id,
          type: item.type,
          startNodeId: String(item.startNodeElementId || item.start),
          endNodeId: String(item.endNodeElementId || item.end),
          properties: item.properties || {},
        });
      }
      return;
    }

    // Check if it's a Neo4j Path
    if (item.segments && Array.isArray(item.segments)) {
      if (item.start) processItem(item.start);
      if (item.end) processItem(item.end);
      for (const segment of item.segments) {
        if (segment.start) processItem(segment.start);
        if (segment.relationship) processItem(segment.relationship);
        if (segment.end) processItem(segment.end);
      }
      return;
    }

    // Check if it's an array of items
    if (Array.isArray(item)) {
      for (const subItem of item) {
        processItem(subItem);
      }
      return;
    }

    // Check if it's an object with fields
    if (typeof item === "object") {
      for (const key of Object.keys(item)) {
        processItem(item[key]);
      }
    }
  }

  for (const record of records) {
    if (record.keys) {
      for (const key of record.keys) {
        const val = record.get(key);
        processItem(val);
      }
    } else {
      processItem(record);
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    relationships: Array.from(relMap.values()),
  };
}
