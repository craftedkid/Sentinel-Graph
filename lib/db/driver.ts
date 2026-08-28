import neo4j, { Driver, Session, ServerInfo } from "neo4j-driver";

// Singleton driver instance across API invocations in Next.js server runtime
let driverInstance: Driver | null = null;

export interface CognoDBConfig {
  uri: string;
  user: string;
  password?: string;
  database?: string;
}

export function getCognoDBConfig(): CognoDBConfig {
  const uri = process.env.COGNODB_URI || process.env.NEO4J_URI || "";
  const user = process.env.COGNODB_USER || process.env.NEO4J_USER || "cognodb";
  const password = process.env.COGNODB_PASSWORD || process.env.NEO4J_PASSWORD || "";
  const database = process.env.COGNODB_DATABASE || process.env.NEO4J_DATABASE || "neo4j";

  return { uri, user, password, database };
}

export function isCognoDBConfigured(): boolean {
  const config = getCognoDBConfig();
  return Boolean(config.uri && config.uri.trim().length > 0 && config.password && config.password.trim().length > 0);
}

export function getCognoDBDriver(): Driver | null {
  const config = getCognoDBConfig();

  if (!isCognoDBConfigured()) {
    return null;
  }

  if (!driverInstance) {
    try {
      driverInstance = neo4j.driver(
        config.uri,
        neo4j.auth.basic(config.user, config.password || ""),
        {
          maxConnectionPoolSize: 50,
          connectionTimeout: 10000,
          maxTransactionRetryTime: 15000,
          userAgent: "sentinel-graph/1.0.0",
        }
      );
    } catch (err) {
      console.error("[CognoDB Driver] Failed to initialize driver:", err);
      driverInstance = null;
    }
  }

  return driverInstance;
}

export async function testConnection(): Promise<{
  connected: boolean;
  latencyMs: number;
  serverInfo?: ServerInfo;
  error?: string;
}> {
  const driver = getCognoDBDriver();
  if (!driver) {
    return {
      connected: false,
      latencyMs: 0,
      error: "CognoDB credentials not configured in environment variables (COGNODB_URI / COGNODB_PASSWORD).",
    };
  }

  const start = Date.now();
  try {
    const serverInfo = await driver.verifyConnectivity();
    const latencyMs = Date.now() - start;
    return {
      connected: true,
      latencyMs,
      serverInfo,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    console.error("[CognoDB Driver] Connectivity test failed:", err.message);
    return {
      connected: false,
      latencyMs,
      error: err.message || "Failed to reach CognoDB instance",
    };
  }
}

export async function runCypherQuery<T = any>(
  cypher: string,
  params: Record<string, any> = {},
  database?: string
): Promise<{
  records: any[];
  summary: any;
  executionTimeMs: number;
}> {
  const driver = getCognoDBDriver();
  if (!driver) {
    throw new Error("CognoDB driver is not configured. Please set COGNODB_URI and COGNODB_PASSWORD.");
  }

  const dbConfig = getCognoDBConfig();
  const sessionConfig: any = {};
  if (database || dbConfig.database) {
    sessionConfig.database = database || dbConfig.database;
  }

  const session: Session = driver.session(sessionConfig);
  const start = Date.now();

  try {
    const result = await session.run(cypher, params);
    const executionTimeMs = Date.now() - start;
    return {
      records: result.records,
      summary: result.summary,
      executionTimeMs,
    };
  } finally {
    await session.close();
  }
}

export async function closeDriver(): Promise<void> {
  if (driverInstance) {
    await driverInstance.close();
    driverInstance = null;
  }
}
