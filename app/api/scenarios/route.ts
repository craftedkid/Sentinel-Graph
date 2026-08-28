import { NextRequest, NextResponse } from "next/server";
import { isCognoDBConfigured, runCypherQuery } from "@/lib/db/driver";
import { SCENARIO_DEFINITIONS, extractGraphFromRecords } from "@/lib/db/queries";
import { getMockScenarioResult } from "@/lib/db/mock-data";
import { ScenarioExecutionResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scenarioId, params = {} } = body;

    const scenarioDef = SCENARIO_DEFINITIONS.find((s) => s.id === scenarioId);
    if (!scenarioDef) {
      return NextResponse.json({ error: `Unknown scenario: ${scenarioId}` }, { status: 400 });
    }

    const mergedParams = { ...scenarioDef.defaultParams, ...params };

    // If CognoDB is not configured, gracefully fall back to mock scenario result
    if (!isCognoDBConfigured()) {
      const mockResult = getMockScenarioResult(scenarioId, mergedParams);
      return NextResponse.json(mockResult);
    }

    // Execute live openCypher query over Bolt on CognoDB
    try {
      const queryResult = await runCypherQuery(scenarioDef.defaultCypher, mergedParams);
      const graph = extractGraphFromRecords(queryResult.records);

      // If live query returns 0 elements (e.g. database not seeded yet), fall back with notice
      if (graph.nodes.length === 0) {
        const mockFallback = getMockScenarioResult(scenarioId, mergedParams);
        return NextResponse.json({
          ...mockFallback,
          summary: {
            ...mockFallback.summary,
            insights: [
              "⚠️ Database is connected but returned 0 results for this pattern. Did you run the seed script?",
              ...mockFallback.summary.insights,
            ],
          },
        });
      }

      // Format table rows
      const tableResults = graph.nodes.map((n) => ({
        id: n.id,
        labels: n.labels.join(", "),
        name: n.properties.name || n.properties.owner_name || n.properties.company_name || n.properties.ssn || n.id,
        riskScore: n.properties.risk_score || (n.properties.synthetic_probability ? `${Math.round(n.properties.synthetic_probability * 100)}%` : "N/A"),
        status: n.properties.status || "Active",
      }));

      // Generate insights based on findings
      const insights = [
        `Successfully traversed ${graph.nodes.length} nodes and ${graph.relationships.length} relationships in ${queryResult.executionTimeMs}ms.`,
        `Identified ${graph.nodes.filter((n) => n.properties.risk_score >= 80 || n.labels.includes("SanctionedEntity")).length} high-risk entities requiring compliance escalation.`,
        `Multi-hop path pattern executed natively via openCypher index-free adjacency.`,
      ];

      const response: ScenarioExecutionResult = {
        scenarioId,
        executionTimeMs: queryResult.executionTimeMs,
        cypher: scenarioDef.defaultCypher,
        params: mergedParams,
        graph,
        summary: {
          nodesFound: graph.nodes.length,
          relationshipsFound: graph.relationships.length,
          findingsCount: queryResult.records.length,
          riskScore: 90,
          insights,
        },
        tableResults,
        isDemoMode: false,
      };

      return NextResponse.json(response);
    } catch (dbErr: any) {
      console.warn("[Scenarios API] Live query failed, falling back to mock dataset:", dbErr.message);
      const mockResult = getMockScenarioResult(scenarioId, mergedParams);
      return NextResponse.json({
        ...mockResult,
        summary: {
          ...mockResult.summary,
          insights: [
            `⚠️ Live Bolt query failed (${dbErr.message}). Displaying fallback simulation data.`,
            ...mockResult.summary.insights,
          ],
        },
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to execute scenario" }, { status: 500 });
  }
}
