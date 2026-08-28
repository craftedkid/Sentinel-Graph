export type ConnectionStatus = "connected" | "offline_demo" | "error";

export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, any>;
}

export interface GraphRelationship {
  id: string;
  type: string;
  startNodeId: string;
  endNodeId: string;
  properties: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  subtitle: string;
  category: "AML Topology" | "Identity Fraud" | "Velocity Risk" | "Sanctions & Compliance" | "Corporate Layering";
  description: string;
  relationalProblem: string;
  graphSuperpower: string;
  defaultCypher: string;
  defaultParams: Record<string, any>;
  paramDescriptions: Record<string, { label: string; type: "number" | "string"; default: any }>;
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM";
  badge: string;
}

export interface ScenarioExecutionResult {
  scenarioId: string;
  executionTimeMs: number;
  cypher: string;
  params: Record<string, any>;
  graph: GraphData;
  summary: {
    nodesFound: number;
    relationshipsFound: number;
    findingsCount: number;
    riskScore: number;
    insights: string[];
  };
  tableResults?: Array<Record<string, any>>;
  isDemoMode: boolean;
}

export interface DatabaseHealth {
  status: ConnectionStatus;
  uri?: string;
  latencyMs?: number;
  nodeCount: number;
  relationshipCount: number;
  nodeLabels: Array<{ label: string; count: number }>;
  relationshipTypes: Array<{ type: string; count: number }>;
  message: string;
  errorDetail?: string;
  lastChecked: string;
}

export interface CypherExecutionResult {
  cypher: string;
  params: Record<string, any>;
  executionTimeMs: number;
  graph: GraphData;
  records: Array<Record<string, any>>;
  columns: string[];
  isDemoMode: boolean;
  error?: string;
}
