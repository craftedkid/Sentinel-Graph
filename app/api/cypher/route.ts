import { NextRequest, NextResponse } from "next/server";
import { isCognoDBConfigured, runCypherQuery } from "@/lib/db/driver";
import { extractGraphFromRecords } from "@/lib/db/queries";
import { MOCK_GRAPH_DATA } from "@/lib/db/mock-data";
import { CypherExecutionResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cypher, params = {} } = body;

    if (!cypher || typeof cypher !== "string" || cypher.trim().length === 0) {
      return NextResponse.json({ error: "Cypher query string cannot be empty" }, { status: 400 });
    }

    // Safety check: block destructive system commands unless explicitly intended
    const lower = cypher.toLowerCase();
    if (lower.includes("drop database") || lower.includes("alter current user")) {
      return NextResponse.json({ error: "Operation not permitted." }, { status: 403 });
    }

    if (!isCognoDBConfigured()) {
      // In Demo Mode: return simulated query execution
      const executionResult: CypherExecutionResult = {
        cypher,
        params,
        executionTimeMs: 12,
        graph: MOCK_GRAPH_DATA,
        records: MOCK_GRAPH_DATA.nodes.map((n) => ({
          id: n.id,
          labels: n.labels.join(", "),
          properties: JSON.stringify(n.properties),
        })),
        columns: ["id", "labels", "properties"],
        isDemoMode: true,
      };
      return NextResponse.json(executionResult);
    }

    const start = Date.now();
    try {
      const result = await runCypherQuery(cypher, params);
      const executionTimeMs = Date.now() - start;

      const graph = extractGraphFromRecords(result.records);

      // Serialize records into clean objects
      const columns = result.records[0]?.keys || [];
      const records = result.records.map((rec) => {
        const obj: Record<string, any> = {};
        for (const col of columns) {
          const val = rec.get(col);
          if (val && typeof val === "object") {
            if (val.properties) {
              obj[col] = val.properties;
            } else if (val.toNumber) {
              obj[col] = val.toNumber();
            } else {
              obj[col] = JSON.stringify(val);
            }
          } else {
            obj[col] = val;
          }
        }
        return obj;
      });

      const response: CypherExecutionResult = {
        cypher,
        params,
        executionTimeMs,
        graph,
        records,
        columns,
        isDemoMode: false,
      };

      return NextResponse.json(response);
    } catch (dbErr: any) {
      return NextResponse.json(
        {
          error: dbErr.message || "Cypher query execution error",
          cypher,
          params,
          executionTimeMs: Date.now() - start,
          graph: { nodes: [], relationships: [] },
          records: [],
          columns: [],
          isDemoMode: false,
        },
        { status: 400 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
