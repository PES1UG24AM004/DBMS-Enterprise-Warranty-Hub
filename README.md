# Enterprise Warranty Hub

Enterprise Warranty Hub (EWH) is a centralized database management system designed for enterprise facilities to monitor capital equipment assets, track active and expiring warranty contracts, coordinate maintenance incident lifecycles across distinct operational roles, and perform semantic similarity troubleshooting across historical repair records using PostgreSQL, pgvector, and local dense embeddings.

## Team Details

- **Institution:** PES University
- **Course:** Database Management Systems (Sem 5)
- **Section:** AIML A
- **Team:** Team 4

| Team Member | SRN |
| :--- | :--- |
| Anish Kumar | PES1UG24AM043 |
| Aarav Yuval B G | PES1UG24AM004 |

## Main Features

- **Relational Integrity & Schema Design:** Normalized schema tracking enterprise equipment, serial metadata, suppliers, and custody across 8 fixed equipment categories enforced by check constraints.
- **ACID Transactions:** Multi-statement transactions for equipment custody reassignment with row-level locking (`SELECT ... FOR UPDATE`), atomic ledger logging (`asset_maintenance_ledger`), and failure rollback verification.
- **Event-Driven Database Triggers:** PL/pgSQL trigger function (`process_warranty_alert()`) evaluating contract end dates relative to `CURRENT_DATE`, automatically dispatching deduplicated notifications for expiring (<= 30 days) and expired warranties.
- **Dynamic Relational Views:** Multi-table SQL views (`asset_warranty_status` and `critical_asset_dashboard`) providing real-time non-stale status computations and aggregated open ticket counters.
- **pgvector Semantic Troubleshooting:** Local ONNX execution of MiniLM-L6-v2 generating 384-dimensional dense vectors, indexed via PostgreSQL HNSW cosine indexes (`vector_cosine_ops`), with analytical window functions preventing duplicate search results.
- **Role-Based Access Control:** Role-scoped data isolation across Facility Managers, Technicians, and external Vendors with bcrypt password hashing and HttpOnly JWT sessions.
- **DBMS Demonstration Workbench:** Dedicated evaluation interface (`/dbms-demo`) exposing live database transactions, trigger logs, view outputs, and vector extension metadata.

## Technology Stack

- **Database:** PostgreSQL 16 with `pgvector` v0.8.7 extension
- **Database Driver:** `pg` (node-postgres) using raw parameterized SQL queries
- **Application Framework:** Next.js 14.2.24 (App Router, Server & Client Components)
- **Language:** TypeScript 5.7.2
- **Vector Embedding Engine:** `@huggingface/transformers` (`onnx-community/all-MiniLM-L6-v2-ONNX`, 384 dimensions, local execution)
- **Authentication:** `bcryptjs` (salted password hashing) and `jose` (HttpOnly JWT sessions)
- **Containerization:** Docker Compose with persistent named volume `ewh_pgdata`

## Prerequisites

- Node.js >= 18.18 (Node 20 LTS recommended)
- npm >= 9.x
- Docker Desktop or Docker Engine with Docker Compose v2 support
- Windows PowerShell 5.1+, PowerShell 7+, or POSIX shell (Linux/macOS)

## Installation and Startup

1. **Clone the repository:**
   ```powershell
   git clone https://github.com/PES1UG24AM004/DBMS-Enterprise-Warranty-Hub.git
   cd DBMS-Enterprise-Warranty-Hub
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Configure environment:**
   ```powershell
   Copy-Item .env.example .env.local
   ```

4. **Start PostgreSQL with pgvector:**
   ```powershell
   npm run db:up
   ```

5. **Initialize database schema and seed data:**
   ```powershell
   npm run db:setup
   ```

6. **Pre-cache the local embedding model:**
   ```powershell
   npm run model:download
   ```

7. **Start the application in development mode:**
   ```powershell
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

## Available Demo Roles

The database is seeded with 5 test accounts. All accounts share the demo password: `Demo123!`

| Role | Login Email | Scope / Purpose |
| :--- | :--- | :--- |
| **Facility Manager** | `manager@ewh.demo` | Full administrative access across all 18 assets, custody reassignments, warranty contracts, and `/dbms-demo`. |
| **Technician** | `technician@ewh.demo` | Diagnostic queue management, ticket status advancement (Reported -> Resolved), semantic search. |
| **Field Technician** | `field.tech@ewh.demo` | Secondary technician account used to demonstrate custody handoffs between operators. |
| **Vendor** | `vendor@ewh.demo` | Contracted service provider; view is strictly scoped to the 4 assets and tickets assigned to this vendor. |
| **Facilities Lead** | `aarav@ewh.demo` | Secondary manager account for verifying multi-recipient trigger notifications. |

*Note: The login screen at `/login` provides 1-Click Login shortcuts to authenticate as any role without manual typing.*

## Useful Commands

| Command | Action |
| :--- | :--- |
| `npm run typecheck` | Run static TypeScript compiler verification |
| `npm run test` | Run complete automated test suite (39 tests) |
| `npm run build` | Compile optimized Next.js production build |
| `npm run start` | Launch Next.js production server |
| `npm run db:up` | Start PostgreSQL container in background |
| `npm run db:down` | Stop PostgreSQL container |
| `npm run db:migrate` | Apply SQL schema migrations |
| `npm run db:seed` | Seed users, assets, warranties, tickets, and vector records |
| `npm run db:reset` | Cleanly drop all tables, re-migrate, and re-seed |

## Documentation Links

Comprehensive academic documentation generated directly from the codebase is available in the `docs/` directory:

- [Project Report (PDF)](docs/Project_Report.pdf) — Complete academic report detailing problem statement, normalized relational schema, ACID implementation, triggers, views, pgvector design, verification results, and limitations.
- [Technical and Demonstration Guide (PDF)](docs/Technical_and_Demo_Guide.pdf) — Operational guide covering prerequisites, Docker configuration, role permissions matrix, step-by-step evaluator demonstration sequences, 5–8 minute presentation walkthrough, and troubleshooting.
