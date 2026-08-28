# SentinelGraph 🛡️🔍
### Financial Crime & Fraud Ring Intelligence Platform backed by CognoDB (openCypher / Bolt)

[![Wexa AI Take-Home Assignment](https://img.shields.io/badge/Wexa%20AI-Take--Home%20Assignment-38bdf8.svg)](https://wexa.ai)
[![Database](https://img.shields.io/badge/Database-CognoDB%20Cloud%20(Bolt%205.x)-10b981.svg)](https://console.cognodb.com)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2015%20App%20Router-000000.svg)](https://nextjs.org)
[![Driver](https://img.shields.io/badge/Driver-Official%20Neo4j%20Driver-018bff.svg)](https://neo4j.com/developer/javascript/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 📌 Mandatory Deliverables & Submission Links

| Deliverable | Status / Link | Description |
| :--- | :--- | :--- |
| 🌐 **Live Hosted Demo** | **[https://sentinel-graph.vercel.app](https://sentinel-graph.vercel.app)** *(or your Vercel deployment URL)* | Deployed on Vercel with live CognoDB Bolt protocol connection |
| 🎥 **Screen Recording Walkthrough** | **[https://youtu.be/sentinel-graph-demo](https://youtu.be/sentinel-graph-demo)** *(or Loom / Drive link)* | 3–5 min video covering all 5 scenarios, Cypher Studio, & error handling |
| 💻 **GitHub Repository** | **[https://github.com/<your-username>/sentinel-graph](https://github.com/<your-username>/sentinel-graph)** | Full source code, Cypher queries, seed scripts, & documentation |
| ✉️ **Submission Email** | `hr@wexa.ai` | Subject: `CognoDB Assignment 2 – <Your Name>` |

---

## 🌟 Executive Summary & Use Case

**SentinelGraph** is an enterprise-grade Anti-Money Laundering (AML), Fraud Ring, and Financial Crime Intelligence platform. It empowers compliance officers, forensic investigators, and risk analysts to detect and unravel complex criminal typologies in real time:

1. **Circular Money Laundering Rings**: Arbitrary-length transaction cycles (\(A \to B \to C \to D \to A\)) structured to defeat traditional rule-based threshold filters.
2. **Synthetic Identity Clusters**: Bipartite networks where fraudulent personas share stolen Social Security Numbers, VoIP burner phones, device fingerprints, and Tor exit IPs.
3. **Rapid Mule Layering & Smurfing Cascades**: Structured deposit funnels where dozens of feeder accounts rapidly funnel funds into a central mule hub that immediately forwards them to offshore crypto/cash sinks.
4. **Sanction Proximity & Blast Radius**: Millisecond shortest-path network traversals between accounts under review and OFAC / designated terror-financing entities.
5. **Ultimate Beneficial Ownership (UBO) Unwinding**: Recursive corporate tree decomposition through multi-tier offshore holding companies in tax havens (BVI, Cayman, Panama) to unmask the human beneficiary.

---

## 💡 Why a Graph Database? (And Why AML?)

### Relational SQL vs. Graph Database Comparison

In a relational database (RDBMS), data is stored in isolated tables linked by foreign keys. Answering network questions requires executing repeated table self-`JOIN`s or recursive Common Table Expressions (`WITH RECURSIVE`).

| Dimension | Relational SQL (RDBMS) | Graph Database (CognoDB / openCypher) |
| :--- | :--- | :--- |
| **Path Traversals (\(k\)-hops)** | Requires \(k\) table self-joins. Query complexity scales as \(\mathcal{O}(N^k)\), leading to CPU saturation. | **Index-free adjacency**: Relationships are direct pointers. Traversal cost is \(\mathcal{O}(k)\) relative to local degree. |
| **Cycle Detection** | Fragile recursive CTEs that explode exponentially in memory and risk infinite loops without manual tracking arrays. | **Native path matching**: `MATCH (a)-[:TRANSFERRED*3..6]->(a)` runs in milliseconds. |
| **Heterogeneous Entities** | Joining Users \(\to\) SSNs \(\to\) Devices \(\to\) Accounts creates massive intermediate Cartesian products. | **Multi-label bipartite traversal**: `(p1)-[:HAS_IDENTIFIER]->(id)<-[:HAS_IDENTIFIER]-(p2)` seamlessly traverses any entity type. |
| **Shortest Paths** | Requires procedural Breadth-First-Search (BFS) written in PL/SQL stored procedures. | **Built-in `shortestPath()`**: Evaluates Dijkstra / BFS natively at the database engine level. |

### Originality: Why Choose Anti-Money Laundering?
While financial fraud is an established graph domain, **SentinelGraph tackles a deeper technical challenge**: rather than demonstrating a single isolated query, SentinelGraph integrates **5 fundamentally distinct graph topological patterns into one unified multi-entity schema**:
- **Cyclic Graph Topology**: Closed transaction loops (Smurfing & layering).
- **Bipartite Graph Clustering**: Synthetic identity resolution linking personas to shared credential vertices.
- **High-Betweenness Funnel Topology**: Mule aggregation velocity with temporal in-degree/out-degree ratios.
- **Metric Path Distance**: Sanction shortest-path blast radius calculations.
- **Directed Acyclic Graph (DAG) Hierarchy**: Recursive multi-tier offshore corporate ownership trees.

Demonstrating all five topological patterns across the same live database proves the versatility and expressive power of openCypher over Bolt protocol.

---

## 📐 Graph Data Model Diagram

```mermaid
graph TD
    Person["(:Person)<br/>• person_id<br/>• name<br/>• synthetic_probability<br/>• pep_status"]
    Account["(:Account)<br/>• account_id<br/>• owner_name<br/>• balance<br/>• risk_score<br/>• status<br/>• country"]
    Company["(:Company)<br/>• company_id<br/>• name<br/>• jurisdiction<br/>• tax_haven"]
    Identifier["(:Identifier / :SSN / :Phone / :Device / :IPAddress)<br/>• ssn / phone_number<br/>• device_fingerprint / ip_address"]
    Sanctioned["(:SanctionedEntity)<br/>• entity_id<br/>• name<br/>• sanction_program<br/>• country"]

    Person -->|CONTROLS| Account
    Person -->|HAS_IDENTIFIER| Identifier
    Person -->|USES_DEVICE| Identifier
    Person -->|LOGS_FROM_IP| Identifier

    Account -->|TRANSFERRED<br/>(amount, timestamp, tx_id)| Account
    Account -->|TRANSFERRED| Company

    Company -->|OWNED_BY<br/>(equity_percent, role)| Company
    Company -->|OWNED_BY| Person

    Sanctioned -->|BENEFICIAL_OWNER_OF<br/>(share_pct, direct)| Company
    Company -->|CONTROLS| Account
```

### Schema & Entity Definitions

#### Labeled Nodes & Properties
- **`:Account`**: `account_id` (string), `owner_name` (string), `balance` (float), `risk_score` (int: 0–100), `status` (string), `country` (ISO-2).
- **`:Person`**: `person_id` (string), `name` (string), `synthetic_probability` (float: 0.0–1.0), `pep_status` (boolean), `risk_score` (int).
- **`:Company`**: `company_id` (string), `name` (string), `jurisdiction` (string), `tax_haven` (boolean), `incorporation_year` (int).
- **`:Identifier`** (sub-labels: `:SSN`, `:Phone`, `:Device`, `:IPAddress`): `ssn`, `phone_number`, `device_fingerprint`, `ip_address`, `flagged_synthetic` (boolean).
- **`:SanctionedEntity`**: `entity_id` (string), `name` (string), `sanction_program` (string: e.g. "OFAC SDNTK"), `country` (string).

#### Typed Relationships & Properties
- **`-[:TRANSFERRED]->`**: `amount` (float), `currency` (string), `timestamp` (ISO-8601), `tx_id` (string).
- **`-[:OWNED_BY]->`**: `equity_percent` (float), `role` (string).
- **`-[:CONTROLS]->`**: `since` (string), `ownership_percent` (float).
- **`-[:HAS_IDENTIFIER]->`**, **`-[:USES_DEVICE]->`**, **`-[:LOGS_FROM_IP]->`**: `verified` (boolean), `sessions` (int).
- **`-[:BENEFICIAL_OWNER_OF]->`**: `share_pct` (float), `direct` (boolean).

---

## 🔍 Main Cypher Queries Explained

### 1. Circular Money Laundering Cycle Detection (3–6 Hops)
Traverses closed transaction paths where funds return to the originator or collusive accounts across multiple hops:
```cypher
MATCH path = (a1:Account)-[:TRANSFERRED]->(a2:Account)-[:TRANSFERRED]->(a3:Account)-[:TRANSFERRED*1..3]->(a1)
WHERE a1.account_id < a2.account_id 
  AND ALL(rel IN relationships(path) WHERE rel.amount >= $minAmount)
RETURN path, 
       [n IN nodes(path) | n.account_id] AS cycleNodes, 
       reduce(total = 0, rel IN relationships(path) | total + rel.amount) AS totalVolume, 
       length(path) AS cycleLength
ORDER BY totalVolume DESC 
LIMIT $limit
```
* **Traversal Reasoning**: Filters on `a1.account_id < a2.account_id` to eliminate cyclic permutations (e.g. \(A \to B \to C \to A\) vs \(B \to C \to A \to B\)). Uses `ALL()` predicate over variable-length path relationships to enforce minimum volume thresholds.
* **Parameters**: `$minAmount` (int), `$limit` (int).

---

### 2. Multi-Tier Offshore UBO Corporate Shell Unwinding
Recursively unwinds multi-jurisdiction holding chains through tax havens to reveal the real human owner:
```cypher
MATCH path = (c:Company)-[:OWNED_BY*1..8]->(u:Person)
WHERE c.jurisdiction IN $jurisdictions
RETURN path, c, u, 
       [n IN nodes(path) | coalesce(n.name, n.company_name)] AS ownershipChain, 
       length(path) AS layerDepth
ORDER BY layerDepth DESC 
LIMIT $limit
```
* **Traversal Reasoning**: Traverses variable-depth ownership chains from 1 to 8 hops. Automatically decomposes sequential holding companies located in tax haven jurisdictions (e.g., British Virgin Islands, Cayman Islands, Panama) until reaching the terminal human node (`:Person`).
* **Parameters**: `$jurisdictions` (array of strings), `$limit` (int).

---

### 3. Shortest-Path Sanction Proximity & Blast Radius
Finds the shortest network path between high-risk accounts and OFAC sanctioned entities:
```cypher
MATCH (sanctioned:SanctionedEntity)
MATCH (target:Account)
WHERE target.risk_score >= $minRiskScore
MATCH path = shortestPath((target)-[:TRANSFERRED|CONTROLS|BENEFICIAL_OWNER_OF*1..5]-(sanctioned))
WHERE target.account_id <> sanctioned.entity_id
RETURN path, target, sanctioned, length(path) AS distance
ORDER BY distance ASC, target.risk_score DESC
LIMIT $limit
```
* **Traversal Reasoning**: Leverages Cypher's native graph-engine algorithm `shortestPath()` across multiple heterogeneous relationship types (`:TRANSFERRED`, `:CONTROLS`, `:BENEFICIAL_OWNER_OF`) to calculate exact topological distance.
* **Parameters**: `$minRiskScore` (int), `$limit` (int).

---

### 4. Synthetic Identity Fraud Bipartite Clustering
```cypher
MATCH (p1:Person)-[r1:HAS_IDENTIFIER|USES_DEVICE|LOGS_FROM_IP]->(shared)<-[r2:HAS_IDENTIFIER|USES_DEVICE|LOGS_FROM_IP]-(p2:Person)
WHERE id(p1) < id(p2)
OPTIONAL MATCH (p1)-[c1:CONTROLS]->(a1:Account)
OPTIONAL MATCH (p2)-[c2:CONTROLS]->(a2:Account)
RETURN p1, r1, shared, r2, p2, c1, a1, c2, a2, labels(shared) AS sharedType
LIMIT $limit
```

---

### 5. Rapid Mule Layering & Fan-Out Velocity
```cypher
MATCH (feeder:Account)-[inflow:TRANSFERRED]->(mule:Account)-[outflow:TRANSFERRED]->(sink:Account)
WHERE inflow.amount <= $smurfingThreshold 
  AND outflow.amount >= $fanOutThreshold
  AND mule.risk_score >= 60
RETURN feeder, inflow, mule, outflow, sink
LIMIT $limit
```

---

## 🖼️ User Interface & Visual Walkthrough

### 1. Forensic Investigation Studio
```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🟢 CognoDB Connected (38ms)  │  [Seed Data]  │  [Forensics Studio] [Cypher Studio] [Schema] │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 🔄 Circular Laundering  │ 👥 Synthetic IDs │ ⚡ Mule Layering │ 🎯 Sanctions │ 🏢 UBO   │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                             │
│  Interactive Cytoscape.js Graph Canvas                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                       │  │
│  │       (ACC-RING-101) ─── $65,000 ───> (ACC-RING-102)                                  │  │
│  │             ▲                               │                                         │  │
│  │          $59,500                         $63,500                                      │  │
│  │             │                               ▼                                         │  │
│  │       (ACC-RING-104) <─── $61,800 ─── (ACC-RING-103)                                  │  │
│  │                                                                                       │  │
│  │  [Zoom In] [Zoom Out] [Fit] [Reset Physics]          Legend: 🔵 Account 🟣 Person     │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                             │
│  Flagged Entities Breakdown                                                                 │
│  ┌──────────────┬──────────────────┬───────────────────────┬────────────┬────────────────┐  │
│  │ ID           │ Label            │ Name                  │ Risk Score │ Action         │  │
│  ├──────────────┼──────────────────┼───────────────────────┼────────────┼────────────────┤  │
│  │ ACC-RING-101 │ Account          │ Elena Rostova         │ 92/100     │ [Inspect]      │  │
│  │ SANCTION-077 │ SanctionedEntity │ Al-Baraka Assets      │ 100/100    │ [Inspect]      │  │
│  └──────────────┴──────────────────┴───────────────────────┴────────────┴────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2. Node Inspector Drawer
Clicking any node on the graph opens a dedicated side inspector displaying:
- **Compliance Risk Score** (0–100 with color coding).
- **Entity Properties & Verification Status**.
- **1-Hop Connected Neighborhood Subgraph**.
- **"Flag for SAR Escalation"** & **"Expand in Canvas"** buttons.

### 3. Interactive Cypher Studio
- Full-featured Cypher console with syntax styling and sample query loader.
- Live execution latency counter (\(ms\)) and record count.
- Multi-mode output switcher: **Graph View**, **Tabular Data Grid**, and **Raw JSON Tree**.

---

## 🚀 Setup & Local Installation

### Prerequisites
- Node.js 18+ (tested on Node.js v24)
- npm or yarn
- Python 3.10+ *(optional, for python seeder)*

---

### Step 1: Provision a Free CognoDB Instance
1. Go to [https://console.cognodb.com/signup](https://console.cognodb.com/signup) and create an account (free, no credit card required).
2. Click **Create Instance**, choose the free (**c0**) tier, and pick your preferred cloud region.
3. Save your connection credentials:
   - **URI**: `bolt+s://<instance-id>.databases.cognodb.cloud`
   - **Username**: `cognodb`
   - **Password**: `<your-generated-password>` *(shown once)*

---

### Step 2: Clone & Configure Environment
```bash
git clone https://github.com/<your-username>/sentinel-graph.git
cd sentinel-graph

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
```

Edit `.env.local`:
```env
COGNODB_URI=bolt+s://<your-instance-id>.databases.cognodb.cloud
COGNODB_USER=cognodb
COGNODB_PASSWORD=your-generated-password
COGNODB_DATABASE=neo4j
```

---

### Step 3: Seed Realistic AML Graph Data
```bash
# TypeScript / Node.js seeder
npm run seed

# OR Python seeder
python scripts/seed.py
```

---

### Step 4: Run the Web Application
```bash
# Development server
npm run dev

# Production build & start
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Production Deployment Guide (Vercel)

1. Push your repository to GitHub:
   ```bash
   git init && git add . && git commit -m "feat: initial commit"
   git remote add origin https://github.com/<your-username>/sentinel-graph.git
   git push -u origin main
   ```
2. Log into [Vercel](https://vercel.com) and click **Add New Project → Import Git Repository**.
3. In **Project Settings → Environment Variables**, add:
   - `COGNODB_URI` = `bolt+s://<instance-id>.databases.cognodb.cloud`
   - `COGNODB_USER` = `cognodb`
   - `COGNODB_PASSWORD` = `<your-password>`
   - `COGNODB_DATABASE` = `neo4j`
4. Click **Deploy**. Vercel will build and launch your live application with SSL in ~1 minute.

---

## 🎬 Screen Recording Script & Walkthrough Agenda (3–5 Mins)

When recording your submission walkthrough video, follow this suggested agenda:

| Timestamp | Section | Key Actions to Demonstrate |
| :--- | :--- | :--- |
| **0:00 – 0:45** | **Live Connection & Architecture** | Show the green 🟢 **"Connected"** badge in Header with verified Bolt latency (e.g. `38ms`). Briefly explain SentinelGraph and why a graph DB is essential for AML. |
| **0:45 – 2:00** | **5 Forensic AML Scenarios** | Click through each of the 5 scenarios (Circular Laundering, Synthetic IDs, Mule Layering, Sanction Proximity, UBO). Show the physics graph canvas adapting and highlight the "Why Graph vs SQL?" panel. |
| **2:00 – 2:45** | **Node Inspector & Neighborhood Expansion** | Click on a flagged node (e.g. `Elena Rostova` or `SANCTION-OFAC-77`) to open the Node Inspector Drawer. Show risk score (92/100), SAR action, and click "Expand in Canvas". |
| **2:45 – 3:30** | **Cypher Studio** | Switch to the Cypher Studio tab. Load a pre-built template or run a custom query. Toggle between **Graph View**, **Table Grid**, and **JSON Output**. |
| **3:30 – 4:00** | **Graceful Error / Demo Mode Handling** | Briefly demonstrate resilience: show how the app displays the persistent amber Demo Mode banner and red Connection Error state with retry options when credentials are unset or unreachable. |

---

## ✉️ Submission Email Template

To submit your assignment, send an email to `hr@wexa.ai`:

- **To**: `hr@wexa.ai`
- **Subject**: `CognoDB Assignment 2 – <Your Name>`
- **Content**:
```text
Hi Wexa AI Team,

Here is my completed submission for the Take-Home Assignment: Build a Graph Database Application.

• GitHub Repository: https://github.com/<your-username>/sentinel-graph
• Live Hosted Demo: https://sentinel-graph.vercel.app
• Screen Recording Walkthrough: https://youtu.be/sentinel-graph-demo

Key Highlights:
1. Application: "SentinelGraph", an Anti-Money Laundering & Financial Crime Intelligence platform backed by CognoDB (openCypher over Bolt protocol via official Neo4j driver).
2. Data Model: 5 labeled node types (Accounts, Persons, Companies, Identifiers, Sanctioned Entities) and 6 typed relationships.
3. 5 Parameterized openCypher Traversals: Cycle detection (3-6 hops), bipartite synthetic identity clustering, mule fan-in/fan-out velocity analysis, shortestPath() to sanctioned targets, and recursive offshore UBO unwinding.
4. Interactive Frontend: Cytoscape.js force-directed canvas with node drill-down, live Cypher Studio, and comprehensive loading, empty, and error states.
5. Seeding & Resilience: Automated TypeScript (npm run seed) and Python (python scripts/seed.py) seeders, paired with a 3-state connection health indicator and fallback demo banner.

My CognoDB Cloud instance will remain active for your review.

Best regards,
<Your Name>
```

---

## 🛡️ License

Built for the **Wexa AI Candidate Take-Home Assignment**. Distributed under the MIT License.
