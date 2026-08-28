"""
SentinelGraph - CognoDB Seeding Script (Python)
Populates CognoDB Cloud instance with realistic AML & Financial Crime Graph Typologies.
"""

import os
import sys
import time
from neo4j import GraphDatabase

# Retrieve credentials from environment
URI = os.getenv("COGNODB_URI", os.getenv("NEO4J_URI", ""))
USER = os.getenv("COGNODB_USER", os.getenv("NEO4J_USER", "cognodb"))
PASSWORD = os.getenv("COGNODB_PASSWORD", os.getenv("NEO4J_PASSWORD", ""))
DATABASE = os.getenv("COGNODB_DATABASE", os.getenv("NEO4J_DATABASE", "neo4j"))

if not URI or not PASSWORD or "<instance-id>" in URI:
    print("❌ ERROR: CognoDB credentials not found.")
    print("Please set COGNODB_URI and COGNODB_PASSWORD in your environment or .env.local file.")
    print("Example: export COGNODB_URI=bolt+s://<instance-id>.databases.cognodb.cloud")
    print("         export COGNODB_PASSWORD=<your-password>")
    sys.exit(1)

print(f"🔌 Connecting to CognoDB at {URI}...")

try:
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    driver.verify_connectivity()
    print("✅ Successfully connected to CognoDB Cloud via Bolt protocol.")
except Exception as e:
    print(f"❌ Connection failed: {e}")
    sys.exit(1)


def seed():
    start_time = time.time()
    with driver.session(database=DATABASE) as session:
        print("🧹 Clearing existing data...")
        session.run("MATCH (n) DETACH DELETE n")

        print("⚡ Creating schema indexes...")
        index_queries = [
            "CREATE INDEX account_id_idx IF NOT EXISTS FOR (a:Account) ON (a.account_id)",
            "CREATE INDEX person_id_idx IF NOT EXISTS FOR (p:Person) ON (p.person_id)",
            "CREATE INDEX company_id_idx IF NOT EXISTS FOR (c:Company) ON (c.company_id)",
            "CREATE INDEX sanction_id_idx IF NOT EXISTS FOR (s:SanctionedEntity) ON (s.entity_id)",
            "CREATE INDEX device_fp_idx IF NOT EXISTS FOR (d:Device) ON (d.device_fingerprint)",
            "CREATE INDEX ssn_idx IF NOT EXISTS FOR (s:SSN) ON (s.ssn)",
        ]
        for q in index_queries:
            try:
                session.run(q)
            except Exception as ex:
                pass

        print("🌱 Seeding Circular Laundering Rings...")
        session.run("""
            CREATE (a1:Account {account_id: 'ACC-RING-101', owner_name: 'Elena Rostova', balance: 145000, risk_score: 92, status: 'Flagged', country: 'CY'})
            CREATE (a2:Account {account_id: 'ACC-RING-102', owner_name: 'Lumina Trading Ltd', balance: 82000, risk_score: 88, status: 'Flagged', country: 'MT'})
            CREATE (a3:Account {account_id: 'ACC-RING-103', owner_name: 'Silvergate Logistics', balance: 91000, risk_score: 89, status: 'Flagged', country: 'AE'})
            CREATE (a4:Account {account_id: 'ACC-RING-104', owner_name: 'Zeta Consulting FZE', balance: 138000, risk_score: 94, status: 'Flagged', country: 'PA'})
            
            CREATE (a1)-[:TRANSFERRED {amount: 65000, currency: 'USD', timestamp: '2026-08-10T14:20:00Z', tx_id: 'TX-7701'}]->(a2)
            CREATE (a2)-[:TRANSFERRED {amount: 63500, currency: 'USD', timestamp: '2026-08-10T15:10:00Z', tx_id: 'TX-7702'}]->(a3)
            CREATE (a3)-[:TRANSFERRED {amount: 61800, currency: 'USD', timestamp: '2026-08-10T16:05:00Z', tx_id: 'TX-7703'}]->(a4)
            CREATE (a4)-[:TRANSFERRED {amount: 59500, currency: 'USD', timestamp: '2026-08-10T17:00:00Z', tx_id: 'TX-7704'}]->(a1)
        """)

        print("🌱 Seeding Synthetic Identity Clusters...")
        session.run("""
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
        """)

        print("🌱 Seeding Mule Networks & Sanction Chains...")
        session.run("""
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
        """)

        result = session.run("MATCH (n) OPTIONAL MATCH ()-[r]->() RETURN count(DISTINCT n) AS nc, count(DISTINCT r) AS rc")
        record = result.single()
        nc = record["nc"]
        rc = record["rc"]
        elapsed = round((time.time() - start_time) * 1000, 1)

        print("=================================================")
        print(f"🎉 CognoDB Seed Complete in {elapsed}ms!")
        print(f"📊 Nodes: {nc} | Relationships: {rc}")
        print("=================================================")

    driver.close()

if __name__ == "__main__":
    seed()
