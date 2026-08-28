import { NextResponse } from "next/server";
import { isCognoDBConfigured, testConnection, runCypherQuery } from "@/lib/db/driver";
import { DatabaseHealth } from "@/lib/types";

export async function GET() {
  const isConfigured = isCognoDBConfigured();

  if (!isConfigured) {
    const health: DatabaseHealth = {
      status: "offline_demo",
      nodeCount: 29,
      relationshipCount: 38,
      nodeLabels: [
        { label: "Account", count: 18 },
        { label: "Person", count: 4 },
        { label: "Company", count: 5 },
        { label: "Identifier", count: 4 },
        { label: "SanctionedEntity", count: 1 },
      ],
      relationshipTypes: [
        { type: "TRANSFERRED", count: 17 },
        { type: "HAS_IDENTIFIER", count: 4 },
        { type: "USES_DEVICE", count: 2 },
        { type: "LOGS_FROM_IP", count: 2 },
        { type: "CONTROLS", count: 3 },
        { type: "OWNED_BY", count: 4 },
        { type: "BENEFICIAL_OWNER_OF", count: 1 },
      ],
      message: "CognoDB credentials not configured in .env.local. Running in DEMO MODE with simulated AML dataset.",
      lastChecked: new Date().toISOString(),
    };
    return NextResponse.json(health);
  }

  const conn = await testConnection();

  if (!conn.connected) {
    const health: DatabaseHealth = {
      status: "error",
      latencyMs: conn.latencyMs,
      nodeCount: 0,
      relationshipCount: 0,
      nodeLabels: [],
      relationshipTypes: [],
      message: "Could not establish Bolt connection to CognoDB instance.",
      errorDetail: conn.error,
      lastChecked: new Date().toISOString(),
    };
    return NextResponse.json(health, { status: 200 }); // Return 200 with error payload for graceful UI handling
  }

  // Fetch live stats from CognoDB instance
  try {
    const statsQuery = `
      MATCH (n)
      OPTIONAL MATCH ()-[r]->()
      RETURN count(DISTINCT n) AS nodeCount, count(DISTINCT r) AS relCount
    `;
    const labelQuery = `
      MATCH (n)
      UNWIND labels(n) AS lbl
      RETURN lbl AS label, count(n) AS count
      ORDER BY count DESC
    `;
    const relTypeQuery = `
      MATCH ()-[r]->()
      RETURN type(r) AS type, count(r) AS count
      ORDER BY count DESC
    `;

    const [statsRes, labelRes, relRes] = await Promise.all([
      runCypherQuery(statsQuery),
      runCypherQuery(labelQuery),
      runCypherQuery(relTypeQuery),
    ]);

    const nodeCount = statsRes.records[0]?.get("nodeCount")?.toNumber?.() ?? 0;
    const relCount = statsRes.records[0]?.get("relCount")?.toNumber?.() ?? 0;

    const nodeLabels = labelRes.records.map((rec) => ({
      label: rec.get("label"),
      count: rec.get("count")?.toNumber?.() ?? 0,
    }));

    const relationshipTypes = relRes.records.map((rec) => ({
      type: rec.get("type"),
      count: rec.get("count")?.toNumber?.() ?? 0,
    }));

    const health: DatabaseHealth = {
      status: "connected",
      uri: process.env.COGNODB_URI || "bolt+s://databases.cognodb.cloud",
      latencyMs: conn.latencyMs,
      nodeCount,
      relationshipCount: relCount,
      nodeLabels,
      relationshipTypes,
      message: `Connected to CognoDB Cloud via Bolt (Ping: ${conn.latencyMs}ms)`,
      lastChecked: new Date().toISOString(),
    };

    return NextResponse.json(health);
  } catch (err: any) {
    return NextResponse.json({
      status: "error",
      latencyMs: conn.latencyMs,
      nodeCount: 0,
      relationshipCount: 0,
      nodeLabels: [],
      relationshipTypes: [],
      message: "Connected to Bolt server, but querying statistics failed.",
      errorDetail: err.message,
      lastChecked: new Date().toISOString(),
    });
  }
}
