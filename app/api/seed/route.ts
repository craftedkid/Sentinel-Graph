import { NextResponse } from "next/server";
import { isCognoDBConfigured, runCypherQuery } from "@/lib/db/driver";

export async function POST() {
  if (!isCognoDBConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message: "Cannot seed live database: COGNODB_URI and COGNODB_PASSWORD are not configured.",
      },
      { status: 400 }
    );
  }

  const start = Date.now();
  try {
    // 1. Clear database
    await runCypherQuery("MATCH (n) DETACH DELETE n");

    // 2. Indexes
    const indexQueries = [
      "CREATE INDEX account_id_idx IF NOT EXISTS FOR (a:Account) ON (a.account_id)",
      "CREATE INDEX person_id_idx IF NOT EXISTS FOR (p:Person) ON (p.person_id)",
      "CREATE INDEX company_id_idx IF NOT EXISTS FOR (c:Company) ON (c.company_id)",
      "CREATE INDEX sanction_id_idx IF NOT EXISTS FOR (s:SanctionedEntity) ON (s.entity_id)",
    ];
    for (const q of indexQueries) {
      try {
        await runCypherQuery(q);
      } catch (e) {}
    }

    // 3. Seed AML Typologies
    await runCypherQuery(`
      CREATE (a1:Account {account_id: 'ACC-RING-101', owner_name: 'Elena Rostova', balance: 145000, risk_score: 92, status: 'Flagged', country: 'CY'})
      CREATE (a2:Account {account_id: 'ACC-RING-102', owner_name: 'Lumina Trading Ltd', balance: 82000, risk_score: 88, status: 'Flagged', country: 'MT'})
      CREATE (a3:Account {account_id: 'ACC-RING-103', owner_name: 'Silvergate Logistics', balance: 91000, risk_score: 89, status: 'Flagged', country: 'AE'})
      CREATE (a4:Account {account_id: 'ACC-RING-104', owner_name: 'Zeta Consulting FZE', balance: 138000, risk_score: 94, status: 'Flagged', country: 'PA'})
      
      CREATE (a1)-[:TRANSFERRED {amount: 65000, currency: 'USD', timestamp: '2026-08-10T14:20:00Z', tx_id: 'TX-7701'}]->(a2)
      CREATE (a2)-[:TRANSFERRED {amount: 63500, currency: 'USD', timestamp: '2026-08-10T15:10:00Z', tx_id: 'TX-7702'}]->(a3)
      CREATE (a3)-[:TRANSFERRED {amount: 61800, currency: 'USD', timestamp: '2026-08-10T16:05:00Z', tx_id: 'TX-7703'}]->(a4)
      CREATE (a4)-[:TRANSFERRED {amount: 59500, currency: 'USD', timestamp: '2026-08-10T17:00:00Z', tx_id: 'TX-7704'}]->(a1)
    `);

    await runCypherQuery(`
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

    await runCypherQuery(`
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

    await runCypherQuery(`
      CREATE (mule:Account {account_id: 'ACC-MULE-HUB', owner_name: 'Jordan Lee (Mule)', balance: 14000, risk_score: 98, status: 'Mule', type: 'Mule'})
      CREATE (f1:Account {account_id: 'ACC-FEEDER-01', owner_name: 'Micro Feeder A', balance: 2500, risk_score: 65, type: 'Feeder'})
      CREATE (f2:Account {account_id: 'ACC-FEEDER-02', owner_name: 'Micro Feeder B', balance: 1800, risk_score: 62, type: 'Feeder'})
      CREATE (s1:Account {account_id: 'ACC-SINK-OFFSHORE', owner_name: 'Crestview Crypto Custody', balance: 890000, risk_score: 95, status: 'High Risk', type: 'Sink'})
      CREATE (f1)-[:TRANSFERRED {amount: 9400, timestamp: '2026-08-22T08:15:00Z', tx_id: 'TX-SMURF-1'}]->(mule)
      CREATE (f2)-[:TRANSFERRED {amount: 9200, timestamp: '2026-08-22T08:22:00Z', tx_id: 'TX-SMURF-2'}]->(mule)
      CREATE (mule)-[:TRANSFERRED {amount: 58000, timestamp: '2026-08-22T09:30:00Z', tx_id: 'TX-DISBURSE-1'}]->(s1)

      CREATE (sanctioned:SanctionedEntity {entity_id: 'SANCTION-OFAC-77', name: 'Al-Baraka Syndicate Assets', sanction_program: 'SDNTK / OFAC Global', country: 'SY', designation_date: '2023-04-12'})
      CREATE (target:Account {account_id: 'ACC-TARGET-UNDER-REVIEW', owner_name: 'Prime Atlantic Commodities', balance: 320000, risk_score: 84, status: 'Under Review'})
      CREATE (intermediary:Company {company_id: 'COMP-INTERMEDIARY-1', name: 'Levant Shipping FZE', jurisdiction: 'Cyprus', risk_score: 89})
      CREATE (bridge:Account {account_id: 'ACC-BRIDGE-44', owner_name: 'Nexus Port Services', balance: 110000, risk_score: 91})
      CREATE (target)-[:TRANSFERRED {amount: 240000, timestamp: '2026-07-15'}]->(bridge)
      CREATE (intermediary)-[:CONTROLS {ownership_percent: 100}]->(bridge)
      CREATE (sanctioned)-[:BENEFICIAL_OWNER_OF {share_pct: 65, direct: true}]->(intermediary)

      CREATE (shell1:Company {company_id: 'COMP-SHELL-01', name: 'Vanguard Maritime Holdings', company_name: 'Vanguard Maritime Holdings', jurisdiction: 'British Virgin Islands', tax_haven: true})
      CREATE (shell2:Company {company_id: 'COMP-SHELL-02', name: 'Zephyr Nominee Trust Ltd', company_name: 'Zephyr Nominee Trust Ltd', jurisdiction: 'Cayman Islands', tax_haven: true})
      CREATE (ubo:Person {person_id: 'PER-UBO-BENEFICIARY', name: 'Viktor V. Chernov', citizenship: 'Saint Kitts & Nevis (CBI)', pep_status: true, risk_score: 96})
      CREATE (shell1)-[:OWNED_BY {equity_percent: 100}]->(shell2)
      CREATE (shell2)-[:OWNED_BY {equity_percent: 100, role: 'Ultimate Beneficial Owner'}]->(ubo)
    `);

    const elapsed = Date.now() - start;
    return NextResponse.json({
      success: true,
      message: `Database successfully seeded with AML typologies in ${elapsed}ms!`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
