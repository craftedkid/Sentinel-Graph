import neo4j from "neo4j-driver";

// Read environment variables
const uri = process.env.COGNODB_URI || process.env.NEO4J_URI || "bolt+s://<instance-id>.databases.cognodb.cloud";
const user = process.env.COGNODB_USER || process.env.NEO4J_USER || "cognodb";
const password = process.env.COGNODB_PASSWORD || process.env.NEO4J_PASSWORD || "";
const database = process.env.COGNODB_DATABASE || process.env.NEO4J_DATABASE || "neo4j";

if (!password || uri.includes("<instance-id>")) {
  console.error("❌ ERROR: CognoDB credentials not found in environment variables.");
  console.error("Please set COGNODB_URI and COGNODB_PASSWORD in your .env.local or environment.");
  console.error("Example: COGNODB_URI=bolt+s://instance-xyz.databases.cognodb.cloud COGNODB_PASSWORD=secret npm run seed");
  process.exit(1);
}

console.log(`🔌 Connecting to CognoDB at ${uri} as user '${user}'...`);

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
  maxConnectionPoolSize: 20,
  connectionTimeout: 15000,
});

async function runSeed() {
  const session = driver.session({ database });
  const startTime = Date.now();

  try {
    console.log("🔍 Verifying connectivity to CognoDB...");
    const serverInfo = await driver.verifyConnectivity();
    console.log(`✅ Connected! Server: ${serverInfo.agent || "CognoDB / Neo4j Bolt"}`);

    console.log("🧹 Clearing existing graph data...");
    await session.run("MATCH (n) DETACH DELETE n");
    console.log("✅ Graph cleared.");

    console.log("⚡ Creating Schema Indexes and Constraints...");
    const indexQueries = [
      "CREATE INDEX account_id_idx IF NOT EXISTS FOR (a:Account) ON (a.account_id)",
      "CREATE INDEX person_id_idx IF NOT EXISTS FOR (p:Person) ON (p.person_id)",
      "CREATE INDEX company_id_idx IF NOT EXISTS FOR (c:Company) ON (c.company_id)",
      "CREATE INDEX sanction_id_idx IF NOT EXISTS FOR (s:SanctionedEntity) ON (s.entity_id)",
      "CREATE INDEX device_fp_idx IF NOT EXISTS FOR (d:Device) ON (d.device_fingerprint)",
      "CREATE INDEX ssn_idx IF NOT EXISTS FOR (s:SSN) ON (s.ssn)",
      "CREATE INDEX phone_idx IF NOT EXISTS FOR (p:Phone) ON (p.phone_number)",
      "CREATE INDEX ip_idx IF NOT EXISTS FOR (i:IPAddress) ON (i.ip_address)",
    ];

    for (const q of indexQueries) {
      try {
        await session.run(q);
      } catch (err: any) {
        // Some Cypher implementations don't support IF NOT EXISTS on old versions; continue gracefully
        console.warn(`Index note: ${err.message}`);
      }
    }
    console.log("✅ Indexes configured.");

    console.log("🌱 Inserting AML & Financial Crime Graph Entities...");

    // 1. Circular Laundering Ring #1 (4-hop cycle)
    await session.run(`
      CREATE (a1:Account {account_id: 'ACC-RING-101', owner_name: 'Elena Rostova', balance: 145000, risk_score: 92, status: 'Flagged', country: 'CY'})
      CREATE (a2:Account {account_id: 'ACC-RING-102', owner_name: 'Lumina Trading Ltd', balance: 82000, risk_score: 88, status: 'Flagged', country: 'MT'})
      CREATE (a3:Account {account_id: 'ACC-RING-103', owner_name: 'Silvergate Logistics', balance: 91000, risk_score: 89, status: 'Flagged', country: 'AE'})
      CREATE (a4:Account {account_id: 'ACC-RING-104', owner_name: 'Zeta Consulting FZE', balance: 138000, risk_score: 94, status: 'Flagged', country: 'PA'})
      
      CREATE (a1)-[:TRANSFERRED {amount: 65000, currency: 'USD', timestamp: '2026-08-10T14:20:00Z', tx_id: 'TX-7701'}]->(a2)
      CREATE (a2)-[:TRANSFERRED {amount: 63500, currency: 'USD', timestamp: '2026-08-10T15:10:00Z', tx_id: 'TX-7702'}]->(a3)
      CREATE (a3)-[:TRANSFERRED {amount: 61800, currency: 'USD', timestamp: '2026-08-10T16:05:00Z', tx_id: 'TX-7703'}]->(a4)
      CREATE (a4)-[:TRANSFERRED {amount: 59500, currency: 'USD', timestamp: '2026-08-10T17:00:00Z', tx_id: 'TX-7704'}]->(a1)
    `);

    // 2. Circular Laundering Ring #2 (5-hop cycle)
    await session.run(`
      CREATE (a1:Account {account_id: 'ACC-RING-201', owner_name: 'Marcus Vance', balance: 210000, risk_score: 96, status: 'Critical', country: 'GB'})
      CREATE (a2:Account {account_id: 'ACC-RING-202', owner_name: 'Aegis Premier Capital', balance: 195000, risk_score: 85, status: 'Flagged', country: 'LU'})
      CREATE (a3:Account {account_id: 'ACC-RING-203', owner_name: 'Boreal Horizon SA', balance: 180000, risk_score: 87, status: 'Flagged', country: 'CH'})
      CREATE (a4:Account {account_id: 'ACC-RING-204', owner_name: 'Krypton Global Trade', balance: 172000, risk_score: 91, status: 'Flagged', country: 'SG'})
      CREATE (a5:Account {account_id: 'ACC-RING-205', owner_name: 'Helios Management Corp', balance: 205000, risk_score: 95, status: 'Critical', country: 'VG'})

      CREATE (a1)-[:TRANSFERRED {amount: 120000, currency: 'EUR', timestamp: '2026-08-14T09:30:00Z', tx_id: 'TX-8801'}]->(a2)
      CREATE (a2)-[:TRANSFERRED {amount: 118000, currency: 'EUR', timestamp: '2026-08-14T11:00:00Z', tx_id: 'TX-8802'}]->(a3)
      CREATE (a3)-[:TRANSFERRED {amount: 115000, currency: 'EUR', timestamp: '2026-08-14T13:45:00Z', tx_id: 'TX-8803'}]->(a4)
      CREATE (a4)-[:TRANSFERRED {amount: 112000, currency: 'EUR', timestamp: '2026-08-14T15:20:00Z', tx_id: 'TX-8804'}]->(a5)
      CREATE (a5)-[:TRANSFERRED {amount: 109000, currency: 'EUR', timestamp: '2026-08-14T18:00:00Z', tx_id: 'TX-8805'}]->(a1)
    `);

    // 3. Synthetic Identity Cluster
    await session.run(`
      CREATE (p1:Person {person_id: 'PER-SYN-01', name: 'David K. Miller', synthetic_probability: 0.94, risk_score: 95})
      CREATE (p2:Person {person_id: 'PER-SYN-02', name: 'D. Keith Miller', synthetic_probability: 0.91, risk_score: 92})
      CREATE (p3:Person {person_id: 'PER-SYN-03', name: 'David Kyle-Miller', synthetic_probability: 0.89, risk_score: 90})

      CREATE (ssn:SSN:Identifier {ssn: '992-01-4432', issued_state: 'NV', flagged_synthetic: true})
      CREATE (phn:Phone:Identifier {phone_number: '+1-202-555-0184', carrier: 'VoIP Provider (Twilio)', burner: true})
      CREATE (dev:Device:Identifier {device_fingerprint: 'FP-88910-CHROME-WIN', emulator: true, proxy: true})
      CREATE (ip:IPAddress:Identifier {ip_address: '198.51.100.24', asn: 'AS13335 (Tor Exit Node)', vpn: true})

      CREATE (acc1:Account {account_id: 'ACC-SYN-801', owner_name: 'David K. Miller', balance: 34000, risk_score: 88, status: 'Frozen'})
      CREATE (acc2:Account {account_id: 'ACC-SYN-802', owner_name: 'D. Keith Miller', balance: 41000, risk_score: 87, status: 'Frozen'})

      CREATE (p1)-[:HAS_IDENTIFIER {verified: false}]->(ssn)
      CREATE (p2)-[:HAS_IDENTIFIER {verified: false}]->(ssn)
      CREATE (p1)-[:HAS_IDENTIFIER {primary: true}]->(phn)
      CREATE (p3)-[:HAS_IDENTIFIER {primary: true}]->(phn)
      CREATE (p1)-[:USES_DEVICE {sessions: 42}]->(dev)
      CREATE (p2)-[:USES_DEVICE {sessions: 38}]->(dev)
      CREATE (p2)-[:LOGS_FROM_IP {last_login: '2026-08-20'}]->(ip)
      CREATE (p3)-[:LOGS_FROM_IP {last_login: '2026-08-21'}]->(ip)
      CREATE (p1)-[:CONTROLS {since: '2026-01-15'}]->(acc1)
      CREATE (p2)-[:CONTROLS {since: '2026-02-10'}]->(acc2)
    `);

    // 4. Mule Account Layering & Rapid Fan-Out
    await session.run(`
      CREATE (mule:Account {account_id: 'ACC-MULE-HUB', owner_name: 'Jordan Lee (Mule)', balance: 14000, risk_score: 98, status: 'Mule', type: 'Mule'})
      CREATE (f1:Account {account_id: 'ACC-FEEDER-01', owner_name: 'Micro Feeder A', balance: 2500, risk_score: 65, type: 'Feeder'})
      CREATE (f2:Account {account_id: 'ACC-FEEDER-02', owner_name: 'Micro Feeder B', balance: 1800, risk_score: 62, type: 'Feeder'})
      CREATE (f3:Account {account_id: 'ACC-FEEDER-03', owner_name: 'Micro Feeder C', balance: 3100, risk_score: 64, type: 'Feeder'})
      CREATE (f4:Account {account_id: 'ACC-FEEDER-04', owner_name: 'Micro Feeder D', balance: 2200, risk_score: 67, type: 'Feeder'})

      CREATE (s1:Account {account_id: 'ACC-SINK-OFFSHORE', owner_name: 'Crestview Crypto Custody', balance: 890000, risk_score: 95, status: 'High Risk', type: 'Sink'})
      CREATE (s2:Account {account_id: 'ACC-SINK-CASH', owner_name: 'Hawala Broker Dubai', balance: 450000, risk_score: 97, status: 'Sanctioned Watchlist', type: 'Sink'})

      CREATE (f1)-[:TRANSFERRED {amount: 9400, timestamp: '2026-08-22T08:15:00Z', tx_id: 'TX-SMURF-1'}]->(mule)
      CREATE (f2)-[:TRANSFERRED {amount: 9200, timestamp: '2026-08-22T08:22:00Z', tx_id: 'TX-SMURF-2'}]->(mule)
      CREATE (f3)-[:TRANSFERRED {amount: 9600, timestamp: '2026-08-22T08:35:00Z', tx_id: 'TX-SMURF-3'}]->(mule)
      CREATE (f4)-[:TRANSFERRED {amount: 9500, timestamp: '2026-08-22T08:48:00Z', tx_id: 'TX-SMURF-4'}]->(mule)

      CREATE (mule)-[:TRANSFERRED {amount: 58000, timestamp: '2026-08-22T09:30:00Z', tx_id: 'TX-DISBURSE-1'}]->(s1)
      CREATE (mule)-[:TRANSFERRED {amount: 49000, timestamp: '2026-08-22T09:45:00Z', tx_id: 'TX-DISBURSE-2'}]->(s2)
    `);

    // 5. Sanctioned Entity Proximity Chain
    await session.run(`
      CREATE (sanctioned:SanctionedEntity {entity_id: 'SANCTION-OFAC-77', name: 'Al-Baraka Syndicate Assets', sanction_program: 'SDNTK / OFAC Global', country: 'SY', designation_date: '2023-04-12'})
      CREATE (target:Account {account_id: 'ACC-TARGET-UNDER-REVIEW', owner_name: 'Prime Atlantic Commodities', balance: 320000, risk_score: 84, status: 'Under Review'})
      CREATE (intermediary:Company {company_id: 'COMP-INTERMEDIARY-1', name: 'Levant Shipping FZE', jurisdiction: 'Cyprus', risk_score: 89})
      CREATE (bridge:Account {account_id: 'ACC-BRIDGE-44', owner_name: 'Nexus Port Services', balance: 110000, risk_score: 91})

      CREATE (target)-[:TRANSFERRED {amount: 240000, timestamp: '2026-07-15'}]->(bridge)
      CREATE (intermediary)-[:CONTROLS {ownership_percent: 100}]->(bridge)
      CREATE (sanctioned)-[:BENEFICIAL_OWNER_OF {share_pct: 65, direct: true}]->(intermediary)
    `);

    // 6. UBO Corporate Shell Ownership Chains
    await session.run(`
      CREATE (shell1:Company {company_id: 'COMP-SHELL-01', name: 'Vanguard Maritime Holdings', company_name: 'Vanguard Maritime Holdings', jurisdiction: 'British Virgin Islands', tax_haven: true, incorporation_year: 2019})
      CREATE (shell2:Company {company_id: 'COMP-SHELL-02', name: 'Zephyr Nominee Trust Ltd', company_name: 'Zephyr Nominee Trust Ltd', jurisdiction: 'Cayman Islands', tax_haven: true, incorporation_year: 2020})
      CREATE (shell3:Company {company_id: 'COMP-SHELL-03', name: 'Pacific Meridian Offshore SA', company_name: 'Pacific Meridian Offshore SA', jurisdiction: 'Panama', tax_haven: true, incorporation_year: 2018})
      CREATE (op:Company {company_id: 'COMP-OPERATING-01', name: 'Alpha Steel & Logistics LLC', company_name: 'Alpha Steel & Logistics LLC', jurisdiction: 'United Kingdom', tax_haven: false, incorporation_year: 2015})
      CREATE (ubo:Person {person_id: 'PER-UBO-BENEFICIARY', name: 'Viktor V. Chernov', citizenship: 'Saint Kitts & Nevis (CBI)', pep_status: true, risk_score: 96})

      CREATE (op)-[:OWNED_BY {equity_percent: 100}]->(shell1)
      CREATE (shell1)-[:OWNED_BY {equity_percent: 100}]->(shell2)
      CREATE (shell2)-[:OWNED_BY {equity_percent: 100}]->(shell3)
      CREATE (shell3)-[:OWNED_BY {equity_percent: 100, role: 'Ultimate Beneficial Owner'}]->(ubo)
    `);

    // 7. Background Realistic Network (Legitimate & Complex Traffic)
    await session.run(`
      UNWIND range(1, 30) AS i
      CREATE (a:Account {
        account_id: 'ACC-LEGIT-' + toString(i),
        owner_name: 'Merchant Partner #' + toString(i),
        balance: 15000 + (i * 2400),
        risk_score: 10 + (i % 25),
        status: 'Active',
        country: ['US', 'DE', 'FR', 'SG', 'CA', 'JP'][i % 6]
      })
    `);

    await session.run(`
      MATCH (a1:Account), (a2:Account)
      WHERE a1.account_id STARTS WITH 'ACC-LEGIT-' 
        AND a2.account_id STARTS WITH 'ACC-LEGIT-'
        AND a1.account_id <> a2.account_id
        AND id(a1) % 3 = id(a2) % 3
      CREATE (a1)-[:TRANSFERRED {
        amount: 500 + (id(a1) * 37) % 4000,
        currency: 'USD',
        timestamp: '2026-08-01T12:00:00Z',
        tx_id: 'TX-LEGIT-' + toString(id(a1)) + '-' + toString(id(a2))
      }]->(a2)
    `);

    // Verification stats
    const statsResult = await session.run(`
      MATCH (n)
      OPTIONAL MATCH ()-[r]->()
      RETURN count(DISTINCT n) AS nodeCount, count(DISTINCT r) AS relCount
    `);

    const nodeCount = statsResult.records[0].get("nodeCount").toNumber();
    const relCount = statsResult.records[0].get("relCount").toNumber();
    const elapsed = Date.now() - startTime;

    console.log("=================================================");
    console.log(`🎉 CognoDB Seed Complete in ${elapsed}ms!`);
    console.log(`📊 Nodes created: ${nodeCount}`);
    console.log(`🔗 Relationships created: ${relCount}`);
    console.log("=================================================");
  } catch (err: any) {
    console.error("❌ Seed failed with error:", err);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
  }
}

runSeed();
