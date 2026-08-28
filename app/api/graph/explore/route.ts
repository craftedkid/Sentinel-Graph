import { NextRequest, NextResponse } from "next/server";
import { isCognoDBConfigured, runCypherQuery } from "@/lib/db/driver";
import { extractGraphFromRecords } from "@/lib/db/queries";
import { MOCK_GRAPH_DATA } from "@/lib/db/mock-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nodeId = searchParams.get("nodeId");

  if (!nodeId) {
    return NextResponse.json({ error: "Missing nodeId parameter" }, { status: 400 });
  }

  if (!isCognoDBConfigured()) {
    // In demo mode: find connected relationships from mock data
    const matchedRels = MOCK_GRAPH_DATA.relationships.filter(
      (r) => r.startNodeId === nodeId || r.endNodeId === nodeId
    );
    const neighborIds = new Set<string>([nodeId]);
    matchedRels.forEach((r) => {
      neighborIds.add(r.startNodeId);
      neighborIds.add(r.endNodeId);
    });

    const nodes = MOCK_GRAPH_DATA.nodes.filter((n) => neighborIds.has(n.id));
    return NextResponse.json({
      graph: {
        nodes,
        relationships: matchedRels,
      },
      isDemoMode: true,
    });
  }

  try {
    const query = `
      MATCH (center)
      WHERE center.account_id = $nodeId 
         OR center.person_id = $nodeId 
         OR center.company_id = $nodeId 
         OR center.entity_id = $nodeId 
         OR center.ssn = $nodeId 
         OR center.device_fingerprint = $nodeId
         OR id(center) = toInteger($nodeId)
      MATCH (center)-[r]-(neighbor)
      RETURN center, r, neighbor
      LIMIT 50
    `;

    const result = await runCypherQuery(query, { nodeId });
    const graph = extractGraphFromRecords(result.records);

    return NextResponse.json({
      graph,
      executionTimeMs: result.executionTimeMs,
      isDemoMode: false,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
