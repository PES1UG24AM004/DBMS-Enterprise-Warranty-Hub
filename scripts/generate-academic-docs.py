import os
import subprocess
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS_DIR = os.path.join(BASE_DIR, 'docs')
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

BASE_CSS = """
@page {
    size: A4 portrait;
    margin: 18mm 16mm 18mm 16mm;
}
@media print {
    body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    .page-break {
        page-break-before: always;
    }
    .avoid-break {
        page-break-inside: avoid;
    }
}
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}
body {
    font-family: Calibri, Arial, "Segoe UI", sans-serif;
    font-size: 9.5pt;
    line-height: 1.45;
    color: #333333;
    background: #FFFFFF;
}
h1, h2, h3, h4 {
    color: #000000;
    font-family: Calibri, Arial, "Segoe UI", sans-serif;
    font-weight: 700;
    page-break-after: avoid;
}
h1 {
    font-size: 16pt;
    margin-bottom: 6px;
    line-height: 1.2;
}
h2 {
    font-size: 12pt;
    margin-top: 14px;
    margin-bottom: 6px;
    border-bottom: 1px solid #CCCCCC;
    padding-bottom: 3px;
}
h3 {
    font-size: 10.5pt;
    margin-top: 10px;
    margin-bottom: 4px;
}
h4 {
    font-size: 9.5pt;
    margin-top: 8px;
    margin-bottom: 3px;
}
p {
    margin-bottom: 7px;
    text-align: justify;
}
ul, ol {
    margin-left: 18px;
    margin-bottom: 7px;
}
li {
    margin-bottom: 2.5px;
}
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 5px;
    margin-bottom: 10px;
    font-size: 8.5pt;
    page-break-inside: avoid;
}
th, td {
    border: 1px solid #CCCCCC;
    padding: 4.5px 7px;
    text-align: left;
    vertical-align: top;
}
th {
    background-color: #F0F0F0;
    color: #000000;
    font-weight: 700;
}
tr:nth-child(even) td {
    background-color: #FAFAFA;
}
code, pre {
    font-family: "Consolas", "Courier New", monospace;
    font-size: 8pt;
}
code {
    background-color: #F4F4F4;
    border: 1px solid #E0E0E0;
    padding: 1px 3px;
    border-radius: 2px;
    color: #222222;
}
pre {
    background-color: #F8F8F8;
    border: 1px solid #CCCCCC;
    padding: 6px 8px;
    margin: 5px 0 8px 0;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
    line-height: 1.3;
    page-break-inside: avoid;
    color: #222222;
}
.cover-box {
    border: 1px solid #333333;
    padding: 18px 16px;
    margin-bottom: 14px;
    text-align: center;
}
.cover-title {
    font-size: 18pt;
    font-weight: 700;
    color: #000000;
    margin-bottom: 4px;
}
.cover-subtitle {
    font-size: 10.5pt;
    font-weight: 600;
    color: #333333;
    margin-bottom: 12px;
}
.cover-meta {
    font-size: 9pt;
    color: #333333;
    line-height: 1.5;
}
.callout {
    border-left: 3px solid #666666;
    background-color: #F9F9F9;
    padding: 6px 10px;
    margin: 6px 0;
    font-size: 9pt;
    page-break-inside: avoid;
}
.toc {
    background-color: #FAFAFA;
    border: 1px solid #CCCCCC;
    padding: 8px 12px;
    margin-bottom: 12px;
    page-break-inside: avoid;
}
.toc-title {
    font-size: 10pt;
    font-weight: 700;
    margin-bottom: 6px;
    border-bottom: 1px solid #CCCCCC;
    padding-bottom: 2px;
}
.toc-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3px 14px;
    font-size: 8.5pt;
}
.toc-item {
    display: flex;
    justify-content: space-between;
}
"""

def generate_project_report_html():
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Enterprise Warranty Hub — Project Report</title>
  <style>
    {BASE_CSS}
  </style>
</head>
<body>

  <div class="cover-box">
    <div class="cover-title">ENTERPRISE WARRANTY HUB</div>
    <div class="cover-subtitle">Relational Database Architecture, Event Triggers, ACID Ledgers, and pgvector Semantic Retrieval</div>
    <div class="cover-meta">
      <strong>Academic Project Report &bull; Database Management Systems (Sem 5)</strong><br>
      PES University &bull; Department of Computer Science &bull; Section AIML A<br><br>
      <table style="width: 75%; margin: 0 auto; font-size: 8.5pt;">
        <thead>
          <tr>
            <th style="text-align: left;">Team Member</th>
            <th style="text-align: center;">SRN</th>
            <th style="text-align: center;">Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Anish Kumar</strong></td>
            <td style="text-align: center;">PES1UG24AM043</td>
            <td style="text-align: center;">Team 4</td>
          </tr>
          <tr>
            <td><strong>Aarav Yuval B G</strong></td>
            <td style="text-align: center;">PES1UG24AM004</td>
            <td style="text-align: center;">Team 4</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="toc">
    <div class="toc-title">TABLE OF CONTENTS</div>
    <div class="toc-grid">
      <div class="toc-item"><span>1. Abstract</span><span>Page 1</span></div>
      <div class="toc-item"><span>8. Database Design & Schema</span><span>Page 3</span></div>
      <div class="toc-item"><span>2. Problem Statement</span><span>Page 1</span></div>
      <div class="toc-item"><span>9. DBMS Concepts Implemented</span><span>Page 5</span></div>
      <div class="toc-item"><span>3. Objectives</span><span>Page 1</span></div>
      <div class="toc-item"><span>10. Semantic Troubleshooting (pgvector)</span><span>Page 6</span></div>
      <div class="toc-item"><span>4. Scope & System Boundaries</span><span>Page 2</span></div>
      <div class="toc-item"><span>11. Functional Implementation</span><span>Page 7</span></div>
      <div class="toc-item"><span>5. Technology Stack</span><span>Page 2</span></div>
      <div class="toc-item"><span>12. Testing & Verification Results</span><span>Page 8</span></div>
      <div class="toc-item"><span>6. System Architecture</span><span>Page 2</span></div>
      <div class="toc-item"><span>13. Limitations</span><span>Page 8</span></div>
      <div class="toc-item"><span>7. Relational Model & ER Overview</span><span>Page 3</span></div>
      <div class="toc-item"><span>14. Conclusion</span><span>Page 8</span></div>
    </div>
  </div>

  <h2>1. Abstract</h2>
  <p>
    Enterprise Warranty Hub (EWH) is a comprehensive, production-grade relational database management system designed to solve critical lifecycle and maintenance tracking challenges for enterprise equipment. Built on <strong>PostgreSQL 16</strong> with the <strong>pgvector</strong> extension and integrated with a high-performance <strong>Next.js 14 App Router</strong> frontend and server runtime, EWH demonstrates core and advanced database principles in an authentic operational context. Key database mechanisms implemented include multi-statement ACID transactions with row-level locking for atomic equipment custody transfers, event-driven PL/pgSQL database triggers for automated warranty expiration alert generation with deduplication guarantees, multi-table SQL views for dynamic non-stale lifecycle metrics, and 384-dimensional dense vector embeddings generated via a local ONNX model stored and indexed using Hierarchical Navigable Small World (HNSW) cosine indexes for duplicate-resistant semantic troubleshooting. The system enforces strict role-based access control (RBAC) across three distinct organizational personas—Facility Manager, Technician, and Vendor—and is containerized via Docker Compose with persistent named volume storage.
  </p>

  <h2>2. Problem Statement</h2>
  <p>
    Modern commercial facilities, research laboratories, and academic institutions manage hundreds of capital equipment assets ranging from compute clusters, workstations, and high-speed document scanners to critical cooling infrastructure and commercial appliances. Traditional management approaches suffer from severe operational pathologies:
  </p>
  <ul>
    <li><strong>Fragmented, Unsynchronized Records:</strong> Warranty contracts, purchase agreements, and maintenance histories are frequently stored across isolated spreadsheets, paper binders, and disparate ticketing portals, preventing consolidated visibility.</li>
    <li><strong>Unmonitored Expiration Windows:</strong> Equipment warranties lapse unnoticed due to lack of automated date-difference monitoring, resulting in expensive out-of-warranty emergency service fees that could have been claimed under contractual coverage.</li>
    <li><strong>Custody Drift and Lack of Auditability:</strong> Equipment assignments between department leads, technicians, and contractors lack strict transactional atomicity. When assignments are updated without an immutable audit trail, custody is lost during physical audits.</li>
    <li><strong>Duplicate Work and Unleveraged Institutional Knowledge:</strong> Technicians face recurring hardware failures without rapid semantic access to previous diagnostic resolutions, resulting in redundant troubleshooting hours and inconsistent repair protocols.</li>
  </ul>

  <h2>3. Objectives</h2>
  <p>
    The primary academic and technical objectives of the Enterprise Warranty Hub project are:
  </p>
  <ol>
    <li><strong>Relational Data Normalization & Integrity:</strong> Model enterprise assets, warranties, maintenance tickets, user accounts, and audit ledgers in a normalized 3NF relational schema with strict foreign key constraints, column domain checks, and non-nullable invariants.</li>
    <li><strong>Automated Business Logic via Database Triggers:</strong> Implement PL/pgSQL triggers that automatically evaluate warranty expiration dates relative to <code>CURRENT_DATE</code> upon insert or update, dispatching deduplicated notifications to administrative users without requiring external cron schedulers.</li>
    <li><strong>Atomic Custody Transactions with Verification:</strong> Enforce multi-table ACID transactions for asset reassignment, guaranteeing that custody changes and immutable ledger entries commit together or roll back completely upon simulated or runtime failures.</li>
    <li><strong>Dynamic State Aggregation via Relational Views:</strong> Build multi-table dynamic SQL views that aggregate open tickets and compute real-time warranty statuses (<code>ACTIVE</code>, <code>EXPIRING_SOON</code>, <code>EXPIRED</code>) on demand, eliminating stale cached status columns.</li>
    <li><strong>pgvector Semantic Troubleshooting Engine:</strong> Integrate high-dimensional vector similarity retrieval directly inside PostgreSQL using the <code>pgvector</code> extension, storing 384-dimensional dense embeddings of historical repair records indexed via HNSW graphs for sub-millisecond semantic search.</li>
    <li><strong>Role-Scaped Data Isolation:</strong> Guarantee strict authorization boundaries where Facility Managers maintain full administrative visibility, Technicians manage assigned maintenance queues, and Vendors view only equipment and tickets explicitly assigned to their company.</li>
  </ol>

  <div class="page-break"></div>

  <h2>4. Scope & System Boundaries</h2>
  <p>
    The system encompasses end-to-end management of equipment lifecycle events from acquisition to warranty termination. Specific operational boundaries are documented below:
  </p>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Domain</th>
        <th style="width: 45%;">Supported In-Scope Capabilities</th>
        <th style="width: 30%;">Intentional Academic Scope Boundary</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Asset Registry</strong></td>
        <td>Hardware metadata, serial tracking, purchase price, location, department, fixed 8 categories, supplier assignment.</td>
        <td>Physical barcode scanning hardware integration omitted; manual tag entry supported.</td>
      </tr>
      <tr>
        <td><strong>Warranty Tracking</strong></td>
        <td>Contract duration, provider, auto-computed days remaining, expiring-soon (30-day) window alerts, expired flags.</td>
        <td>Single active warranty per equipment item; multi-tier supplemental insurance contracts excluded.</td>
      </tr>
      <tr>
        <td><strong>Maintenance Workflow</strong></td>
        <td>Full 6-stage lifecycle (<code>Reported</code> &rarr; <code>Assigned</code> &rarr; <code>Acknowledged</code> &rarr; <code>In Progress</code> &rarr; <code>Resolved</code> &rarr; <code>Closed</code>), technician notes.</td>
        <td>External PDF invoice generation and vendor billing payment gateway processing omitted.</td>
      </tr>
      <tr>
        <td><strong>Notifications</strong></td>
        <td>In-app bell notifications, read/unread state tracking, automated trigger creation, unique key deduplication.</td>
        <td>External third-party email (SMTP) or SMS gateway integrations omitted in favor of internal DB state.</td>
      </tr>
      <tr>
        <td><strong>Troubleshooting</strong></td>
        <td>Natural-language semantic vector retrieval over historical repair knowledge base using 384-dim local embeddings.</td>
        <td>Generative AI text synthesis omitted; queries return exact historical records ranked by cosine distance.</td>
      </tr>
      <tr>
        <td><strong>User Access</strong></td>
        <td>Facility Manager, Technician, and Vendor roles with bcrypt password security and HttpOnly session cookies.</td>
        <td>Registration page includes role selection to facilitate multi-role demonstration by academic evaluators.</td>
      </tr>
    </tbody>
  </table>

  <h2>5. Technology Stack</h2>
  <p>
    The implementation avoids heavyweight Object-Relational Mappers (ORMs) to preserve transparent database interactions, raw SQL query visibility, and direct transaction control:
  </p>
  <ul>
    <li><strong>Database Management System:</strong> PostgreSQL 16 (Debian-based official container) with the <code>pgvector</code> v0.8.7 extension compiled for vector operations.</li>
    <li><strong>Database Driver:</strong> <code>pg</code> (node-postgres v8.13.1) configured with connection pooling, parameterized SQL queries, explicit transaction clients (<code>client.query('BEGIN')</code>), and custom vector parsing.</li>
    <li><strong>Application Framework:</strong> Next.js 14.2.24 utilizing the App Router architecture, React 18 Server Components, and modular API route handlers.</li>
    <li><strong>Language & Type Safety:</strong> TypeScript 5.7.2 providing end-to-end interface contracts across database query results, API payloads, and UI component props.</li>
    <li><strong>Local Embedding Engine:</strong> Hugging Face <code>@huggingface/transformers</code> v3.3.3 executing the <code>onnx-community/all-MiniLM-L6-v2-ONNX</code> model locally inside the Node.js process with mean pooling and L2 normalization (outputting unit vectors in R^384).</li>
    <li><strong>Authentication & Cryptography:</strong> <code>bcryptjs</code> (10 salt rounds) for password hashing; <code>jose</code> (v5.9.6) for generating and verifying cryptographically signed HttpOnly JWT session tokens.</li>
    <li><strong>Containerization & Infrastructure:</strong> Docker Engine with Docker Compose v2, utilizing named volume <code>ewh_pgdata</code> for persistent database storage across container lifecycles.</li>
  </ul>

  <h2>6. System Architecture</h2>
  <p>
    The system architecture separates client presentation, server business logic, relational storage, and local machine learning inference:
  </p>
  <pre>
+--------------------------------------------------------------------------------------------------+
|                                    CLIENT APPLICATION LAYER                                      |
|  - Next.js 14 App Router (React Server & Client Components)                                      |
|  - Role Scoped Dashboards: Facility Manager (/dashboard, /dbms-demo), Technician, Vendor         |
+---------------------------------------------------+----------------------------------------------+
                                                    | Authenticated HTTP / JSON
                                                    v
+--------------------------------------------------------------------------------------------------+
|                                    NEXT.JS SERVER RUNTIME                                        |
|  - Route Handlers (/api/assets, /api/warranties, /api/tickets, /api/troubleshoot, /api/dbms-demo)|
|  - Security Middleware: HttpOnly Cookie Validation (jose JWT), Scoped Access Enforcer            |
|  - Local Vector Pipeline: Transformers.js (ONNX MiniLM-L6-v2) -> 384-dimensional unit vector     |
+---------------------------------------------------+----------------------------------------------+
                                                    | Parameterized SQL (node-postgres connection pool)
                                                    v
+--------------------------------------------------------------------------------------------------+
|                             POSTGRESQL 16 + PGVECTOR DATABASE ENGINE                             |
|  - Extensions: uuid-ossp (UUID generation), vector (pgvector 384-dim similarity search)          |
|  - Relational Tables: users, assets, warranties, tickets, notifications, maintenance_records     |
|  - ACID Transactions: 'BEGIN ... SELECT FOR UPDATE ... COMMIT / ROLLBACK' (Custody Ledger)       |
|  - Triggers: 'trg_warranty_alert' (PL/pgSQL auto-alert dispatch with deduplication)              |
|  - Dynamic Views: 'asset_warranty_status' (status computation), 'critical_asset_dashboard'       |
|  - Indexes: B-Tree (primary/foreign keys, codes) + HNSW (vector_cosine_ops for embedding)        |
+---------------------------------------------------+----------------------------------------------+
                                                    | POSIX File I/O
                                                    v
+--------------------------------------------------------------------------------------------------+
|                                   PERSISTENT STORAGE VOLUME                                      |
|  - Docker Named Volume: ewh_pgdata (/var/lib/postgresql/data)                                    |
+--------------------------------------------------------------------------------------------------+
  </pre>

  <div class="page-break"></div>

  <h2>7. Relational Model & Database Design</h2>
  <p>
    The Enterprise Warranty Hub database schema consists of seven core tables, two computed views, and two custom procedural trigger functions. All primary keys utilize randomly generated UUIDs (version 4) via <code>gen_random_uuid()</code> to eliminate enumeration attacks and provide distributed unique identification.
  </p>

  <h3>7.1. Relational Table Specifications</h3>

  <h4>Table 1: <code>users</code></h4>
  <p>Manages system user accounts, roles, authentication credentials, and operational activation flags.</p>
  <table>
    <thead>
      <tr>
        <th>Column Name</th>
        <th>Data Type</th>
        <th>Constraints</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>id</code></td>
        <td>UUID</td>
        <td>PRIMARY KEY, DEFAULT gen_random_uuid()</td>
        <td>Unique user identifier.</td>
      </tr>
      <tr>
        <td><code>full_name</code></td>
        <td>VARCHAR(255)</td>
        <td>NOT NULL</td>
        <td>User's display and legal name.</td>
      </tr>
      <tr>
        <td><code>email</code></td>
        <td>VARCHAR(255)</td>
        <td>UNIQUE, NOT NULL</td>
        <td>Unique login email address.</td>
      </tr>
      <tr>
        <td><code>password_hash</code></td>
        <td>VARCHAR(255)</td>
        <td>NOT NULL</td>
        <td>Bcrypt password hash (salt rounds: 10).</td>
      </tr>
      <tr>
        <td><code>role</code></td>
        <td>VARCHAR(50)</td>
        <td>NOT NULL, CHECK (role IN ('FACILITY_MANAGER', 'TECHNICIAN', 'VENDOR'))</td>
        <td>Role for role-based authorization.</td>
      </tr>
      <tr>
        <td><code>is_active</code></td>
        <td>BOOLEAN</td>
        <td>NOT NULL, DEFAULT TRUE</td>
        <td>Account activation flag.</td>
      </tr>
      <tr>
        <td><code>created_at</code> / <code>updated_at</code></td>
        <td>TIMESTAMPTZ</td>
        <td>NOT NULL, DEFAULT CURRENT_TIMESTAMP</td>
        <td>Audit record timestamps.</td>
      </tr>
    </tbody>
  </table>

  <h4>Table 2: <code>assets</code></h4>
  <p>The central hardware catalog tracking capital equipment, manufacturer specifications, acquisition details, location, and custodial assignment.</p>
  <table>
    <thead>
      <tr>
        <th>Column Name</th>
        <th>Data Type</th>
        <th>Constraints</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>id</code></td>
        <td>UUID</td>
        <td>PRIMARY KEY, DEFAULT gen_random_uuid()</td>
        <td>Unique asset record identifier.</td>
      </tr>
      <tr>
        <td><code>asset_tag</code></td>
        <td>VARCHAR(50)</td>
        <td>UNIQUE, NOT NULL</td>
        <td>Human-readable asset barcode tag (e.g., AST-CL-001).</td>
      </tr>
      <tr>
        <td><code>name</code></td>
        <td>VARCHAR(255)</td>
        <td>NOT NULL</td>
        <td>Descriptive equipment name.</td>
      </tr>
      <tr>
        <td><code>category</code></td>
        <td>VARCHAR(100)</td>
        <td>NOT NULL, CHECK (category IN (8 categories))</td>
        <td>Fixed category whitelist (Computers, AC, etc.).</td>
      </tr>
      <tr>
        <td><code>manufacturer</code> / <code>model</code></td>
        <td>VARCHAR(255)</td>
        <td>NOT NULL</td>
        <td>OEM manufacturer and model designation.</td>
      </tr>
      <tr>
        <td><code>serial_number</code></td>
        <td>VARCHAR(255)</td>
        <td>NULLABLE</td>
        <td>Manufacturer factory serial number.</td>
      </tr>
      <tr>
        <td><code>purchase_date</code></td>
        <td>DATE</td>
        <td>NOT NULL</td>
        <td>Equipment purchase/procurement date.</td>
      </tr>
      <tr>
        <td><code>purchase_price</code></td>
        <td>NUMERIC(12, 2)</td>
        <td>NULLABLE</td>
        <td>Financial acquisition cost.</td>
      </tr>
      <tr>
        <td><code>supplier_name</code></td>
        <td>VARCHAR(255)</td>
        <td>NOT NULL</td>
        <td>Procurement vendor or contracting distributor.</td>
      </tr>
      <tr>
        <td><code>location</code> / <code>department</code></td>
        <td>VARCHAR(255)</td>
        <td>NULLABLE</td>
        <td>Physical building/room and operational department.</td>
      </tr>
      <tr>
        <td><code>assigned_to_user_id</code></td>
        <td>UUID</td>
        <td>REFERENCES users(id) ON DELETE SET NULL</td>
        <td>Current custodian/technician assigned to asset.</td>
      </tr>
      <tr>
        <td><code>created_by_user_id</code></td>
        <td>UUID</td>
        <td>NOT NULL, REFERENCES users(id)</td>
        <td>Administrative user who registered the asset.</td>
      </tr>
      <tr>
        <td><code>created_at</code> / <code>updated_at</code></td>
        <td>TIMESTAMPTZ</td>
        <td>NOT NULL, DEFAULT CURRENT_TIMESTAMP</td>
        <td>System audit timestamps.</td>
      </tr>
    </tbody>
  </table>

  <h4>Table 3: <code>warranties</code></h4>
  <p>Tracks active warranty coverage contracts linked one-to-one with equipment assets.</p>
  <table>
    <thead>
      <tr>
        <th>Column Name</th>
        <th>Data Type</th>
        <th>Constraints</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>id</code></td>
        <td>UUID</td>
        <td>PRIMARY KEY, DEFAULT gen_random_uuid()</td>
        <td>Unique warranty record identifier.</td>
      </tr>
      <tr>
        <td><code>asset_id</code></td>
        <td>UUID</td>
        <td>UNIQUE, NOT NULL, REFERENCES assets(id) ON DELETE CASCADE</td>
        <td>Associated asset (enforces 1:1 active warranty rule).</td>
      </tr>
      <tr>
        <td><code>warranty_provider</code></td>
        <td>VARCHAR(255)</td>
        <td>NULLABLE</td>
        <td>Contracted maintenance provider or OEM.</td>
      </tr>
      <tr>
        <td><code>start_date</code> / <code>end_date</code></td>
        <td>DATE</td>
        <td>NOT NULL, CHECK (end_date >= start_date)</td>
        <td>Contract duration; end_date monitored by triggers.</td>
      </tr>
      <tr>
        <td><code>created_at</code> / <code>updated_at</code></td>
        <td>TIMESTAMPTZ</td>
        <td>NOT NULL, DEFAULT CURRENT_TIMESTAMP</td>
        <td>System audit timestamps.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h4>Table 4: <code>tickets</code></h4>
  <p>Tracks maintenance incidents, defect reports, technician assignments, and workflow statuses.</p>
  <table>
    <thead>
      <tr>
        <th>Column Name</th>
        <th>Data Type</th>
        <th>Constraints</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>id</code></td>
        <td>UUID</td>
        <td>PRIMARY KEY, DEFAULT gen_random_uuid()</td>
        <td>Unique ticket identifier.</td>
      </tr>
      <tr>
        <td><code>ticket_code</code></td>
        <td>VARCHAR(50)</td>
        <td>UNIQUE, NOT NULL</td>
        <td>Human-readable ticket code (e.g., TCK-2026-001).</td>
      </tr>
      <tr>
        <td><code>asset_id</code></td>
        <td>UUID</td>
        <td>NOT NULL, REFERENCES assets(id) ON DELETE CASCADE</td>
        <td>Faulty equipment asset.</td>
      </tr>
      <tr>
        <td><code>title</code> / <code>description</code></td>
        <td>VARCHAR(255) / TEXT</td>
        <td>NOT NULL</td>
        <td>Failure synopsis and detailed technical description.</td>
      </tr>
      <tr>
        <td><code>status</code></td>
        <td>VARCHAR(50)</td>
        <td>NOT NULL, DEFAULT 'Reported', CHECK (6 stages)</td>
        <td>Reported, Assigned, Acknowledged, In Progress, Resolved, Closed.</td>
      </tr>
      <tr>
        <td><code>assignee_user_id</code></td>
        <td>UUID</td>
        <td>REFERENCES users(id) ON DELETE SET NULL</td>
        <td>Technician or Vendor assigned to resolve issue.</td>
      </tr>
      <tr>
        <td><code>created_by_user_id</code></td>
        <td>UUID</td>
        <td>NOT NULL, REFERENCES users(id)</td>
        <td>User who opened the maintenance ticket.</td>
      </tr>
      <tr>
        <td><code>resolution_notes</code></td>
        <td>TEXT</td>
        <td>NULLABLE</td>
        <td>Post-repair technical notes and resolution steps.</td>
      </tr>
    </tbody>
  </table>

  <h4>Table 5: <code>maintenance_records</code></h4>
  <p>The institutional knowledge base storing resolved repair cases accompanied by 384-dimensional dense vector embeddings for semantic troubleshooting.</p>
  <table>
    <thead>
      <tr>
        <th>Column Name</th>
        <th>Data Type</th>
        <th>Constraints</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>id</code></td>
        <td>UUID</td>
        <td>PRIMARY KEY, DEFAULT gen_random_uuid()</td>
        <td>Unique historical record identifier.</td>
      </tr>
      <tr>
        <td><code>asset_id</code></td>
        <td>UUID</td>
        <td>NOT NULL, REFERENCES assets(id) ON DELETE CASCADE</td>
        <td>Asset upon which maintenance was completed.</td>
      </tr>
      <tr>
        <td><code>ticket_id</code></td>
        <td>UUID</td>
        <td>UNIQUE, REFERENCES tickets(id) ON DELETE SET NULL</td>
        <td>Source maintenance ticket (if generated from ticket).</td>
      </tr>
      <tr>
        <td><code>dedupe_key</code></td>
        <td>VARCHAR(255)</td>
        <td>UNIQUE</td>
        <td>Natural composite key preventing duplicate case seeding.</td>
      </tr>
      <tr>
        <td><code>issue_title</code> / <code>resolution</code></td>
        <td>VARCHAR(255) / TEXT</td>
        <td>NOT NULL</td>
        <td>Fault title and proven engineering resolution.</td>
      </tr>
      <tr>
        <td><code>embedding</code></td>
        <td>vector(384)</td>
        <td>NULLABLE, HNSW Indexed</td>
        <td>Dense MiniLM-L6-v2 vector embedding of problem text.</td>
      </tr>
    </tbody>
  </table>

  <h4>Table 6: <code>notifications</code></h4>
  <p>Maintains in-app alerts dispatched by database triggers and scheduled lifecycle synchronizers.</p>
  <table>
    <thead>
      <tr>
        <th>Column Name</th>
        <th>Data Type</th>
        <th>Constraints</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>id</code></td>
        <td>UUID</td>
        <td>PRIMARY KEY, DEFAULT gen_random_uuid()</td>
        <td>Unique notification record identifier.</td>
      </tr>
      <tr>
        <td><code>user_id</code></td>
        <td>UUID</td>
        <td>NOT NULL, REFERENCES users(id) ON DELETE CASCADE</td>
        <td>Recipient user account.</td>
      </tr>
      <tr>
        <td><code>type</code></td>
        <td>VARCHAR(50)</td>
        <td>NOT NULL</td>
        <td>WARRANTY_EXPIRING, WARRANTY_EXPIRED, TICKET_ASSIGNED.</td>
      </tr>
      <tr>
        <td><code>dedupe_key</code></td>
        <td>VARCHAR(255)</td>
        <td>NOT NULL</td>
        <td>Deduplication signature (e.g., TYPE:ASSET_ID:END_DATE).</td>
      </tr>
      <tr>
        <td><code>CONSTRAINT</code></td>
        <td>UNIQUE</td>
        <td>UNIQUE (user_id, dedupe_key)</td>
        <td>Prevents duplicate unread alerts for same event.</td>
      </tr>
    </tbody>
  </table>

  <h4>Table 7: <code>asset_maintenance_ledger</code></h4>
  <p>An append-only audit trail logging all equipment custody reassignments executed during multi-statement ACID transactions.</p>
  <table>
    <thead>
      <tr>
        <th>Column Name</th>
        <th>Data Type</th>
        <th>Constraints</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>id</code></td>
        <td>UUID</td>
        <td>PRIMARY KEY, DEFAULT gen_random_uuid()</td>
        <td>Unique ledger entry identifier.</td>
      </tr>
      <tr>
        <td><code>asset_id</code></td>
        <td>UUID</td>
        <td>NOT NULL, REFERENCES assets(id) ON DELETE CASCADE</td>
        <td>Reassigned equipment asset.</td>
      </tr>
      <tr>
        <td><code>event_type</code></td>
        <td>VARCHAR(50)</td>
        <td>NOT NULL</td>
        <td>Type of event (e.g., ASSET_REASSIGNED, REASSIGNMENT_COMMIT).</td>
      </tr>
      <tr>
        <td><code>previous_assignee_id</code></td>
        <td>UUID</td>
        <td>REFERENCES users(id) ON DELETE SET NULL</td>
        <td>Pre-transfer custodial user ID.</td>
      </tr>
      <tr>
        <td><code>new_assignee_id</code></td>
        <td>UUID</td>
        <td>REFERENCES users(id) ON DELETE SET NULL</td>
        <td>Post-transfer custodial user ID.</td>
      </tr>
      <tr>
        <td><code>performed_by_user_id</code></td>
        <td>UUID</td>
        <td>NOT NULL, REFERENCES users(id)</td>
        <td>Facility Manager who executed the custody transfer.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h2>8. DBMS Concepts Implemented</h2>

  <h3>8.1. ACID Transactions (Atomicity, Consistency, Isolation, Durability)</h3>
  <p>
    Equipment custody reassignment requires updating the current custodian pointer in <code>assets.assigned_to_user_id</code> while concurrently writing an immutable audit record into <code>asset_maintenance_ledger</code>. If either write fails, the entire unit of work must roll back. In <code>lib/db.ts</code> and <code>app/api/assets/[id]/assign/route.ts</code>, this is implemented using an explicit database transaction client:
  </p>
  <pre><code>// Atomic Asset Reassignment with Row-Level Locking
await withTransaction(async (client) => {{
  // 1. Isolation: Row-level lock acquired via SELECT ... FOR UPDATE
  const check = await client.query(
    'SELECT id, asset_tag, assigned_to_user_id FROM assets WHERE id = $1 FOR UPDATE;',
    [assetId]
  );
  const prevUserId = check.rows[0].assigned_to_user_id;

  // 2. State Mutation: Update current custody
  await client.query(
    'UPDATE assets SET assigned_to_user_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;',
    [newUserId, assetId]
  );

  // 3. Audit Ledger Insertion
  await client.query(
    `INSERT INTO asset_maintenance_ledger (
      asset_id, event_type, details, previous_assignee_id, new_assignee_id, performed_by_user_id
    ) VALUES ($1, 'ASSET_REASSIGNED', $2, $3, $4, $5);`,
    [assetId, details, prevUserId, newUserId, currentUserId]
  );
  // COMMIT is executed automatically if no errors occur; ROLLBACK on any thrown exception
}});</code></pre>
  <p>
    <strong>Verification of Rollback:</strong> When an invalid foreign key or deliberate failure flag is simulated, the catch block executes <code>ROLLBACK</code>. Automated tests verify that <code>assigned_to_user_id</code> retains its previous value and zero rows are appended to the ledger.
  </p>

  <h3>8.2. Database Triggers & Trigger Functions</h3>
  <p>
    Instead of relying on fragile client-side scripts, warranty alert dispatch is handled directly by PostgreSQL via a procedural trigger function attached to the <code>warranties</code> table.
  </p>
  <pre><code>CREATE OR REPLACE FUNCTION process_warranty_alert()
RETURNS TRIGGER AS $$
DECLARE
  mgr_record RECORD;
  asset_record RECORD;
  v_type VARCHAR(50);
  v_msg TEXT;
  v_key VARCHAR(255);
  days_left INT;
BEGIN
  days_left := NEW.end_date - CURRENT_DATE;

  IF NEW.end_date &lt; CURRENT_DATE THEN
    v_type := 'WARRANTY_EXPIRED';
    v_key := 'WARRANTY_EXPIRED:' || NEW.asset_id || ':' || NEW.end_date;
  ELSIF days_left &lt;= 30 AND days_left &gt;= 0 THEN
    v_type := 'WARRANTY_EXPIRING';
    v_key := 'WARRANTY_EXPIRING:' || NEW.asset_id || ':' || NEW.end_date;
  ELSE
    RETURN NEW;
  END IF;

  SELECT asset_tag, name INTO asset_record FROM assets WHERE id = NEW.asset_id;

  v_msg := 'ATTENTION: Warranty for asset ' || COALESCE(asset_record.name, 'Equipment') ||
           ' (' || COALESCE(asset_record.asset_tag, '') || ') expires in ' || days_left || ' days (' || NEW.end_date || ')';

  FOR mgr_record IN SELECT id FROM users WHERE role = 'FACILITY_MANAGER' AND is_active = TRUE LOOP
    INSERT INTO notifications (user_id, asset_id, type, message, dedupe_key)
    VALUES (mgr_record.id, NEW.asset_id, v_type, v_msg, v_key)
    ON CONFLICT (user_id, dedupe_key) DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_warranty_alert
  AFTER INSERT OR UPDATE OF end_date, start_date ON warranties
  FOR EACH ROW
  EXECUTE FUNCTION process_warranty_alert();</code></pre>
  <p>
    The unique constraint <code>uq_notifications_user_dedupe</code> combined with <code>ON CONFLICT DO NOTHING</code> prevents redundant notifications when non-date columns are updated.
  </p>

  <div class="page-break"></div>

  <h3>8.3. Relational SQL Views</h3>
  <p>
    To eliminate stale status fields, EWH uses two multi-table views that compute metrics dynamically relative to <code>CURRENT_DATE</code>:
  </p>
  <ul>
    <li><strong><code>asset_warranty_status</code>:</strong> Evaluates active coverage by joining <code>assets</code>, <code>warranties</code>, and <code>users</code>. Uses conditional <code>CASE</code> statements to categorize assets into <code>ACTIVE</code> (&gt; 30 days remaining), <code>EXPIRING_SOON</code> (0 to 30 days remaining), <code>EXPIRED</code> (&lt; 0 days), or <code>NO_WARRANTY</code>.</li>
    <li><strong><code>critical_asset_dashboard</code>:</strong> Filters assets having active defects (open tickets not resolved/closed) or expiring/expired warranties. Aggregates open tickets using <code>COUNT(t.id) FILTER</code> and <code>ARRAY_AGG(t.ticket_code) FILTER</code> to present a unified operational priority feed for facility directors.</li>
  </ul>

  <h3>8.4. Constraints & Referential Integrity</h3>
  <p>
    The relational model strictly defines domain boundaries and cascade rules:
  </p>
  <ul>
    <li><strong>Domain Whitelists:</strong> Fixed asset categories (8 categories) and ticket progression states (6 states) are enforced via PostgreSQL <code>CHECK</code> constraints. Attempted insertion of non-standard categories is rejected by the DBMS engine.</li>
    <li><strong>Temporal Constraints:</strong> <code>warranties</code> enforces <code>CHECK (end_date &gt;= start_date)</code>, rejecting invalid contract dates.</li>
    <li><strong>Cascading Referential Actions:</strong> Deleting an asset cascades to remove its warranty, ticket, and ledger entries (<code>ON DELETE CASCADE</code>), while foreign keys pointing to user assignees cleanly transition to <code>NULL</code> (<code>ON DELETE SET NULL</code>) without corrupting referential validity.</li>
  </ul>

  <h2>9. Semantic Troubleshooting with pgvector</h2>
  <p>
    Enterprise Warranty Hub incorporates dense vector retrieval directly into PostgreSQL using the <code>pgvector</code> extension. Rather than passing user queries to external cloud LLM APIs, EWH runs an on-premise embedding pipeline inside the application container:
  </p>

  <h3>9.1. Local MiniLM ONNX Inference Pipeline</h3>
  <p>
    The system utilizes the <code>onnx-community/all-MiniLM-L6-v2-ONNX</code> model executed via Transformers.js in Node.js. Given natural-language problem text (e.g., <em>"laptop CPU thermal throttling and fan screaming"</em>), the model outputs a 384-dimensional dense vector. Mean pooling is applied across tokens, followed by L2 normalization such that ||v||_2 = 1.0.
  </p>

  <h3>9.2. HNSW Indexing and Cosine Distance Query</h3>
  <p>
    The embedding is stored in the <code>vector(384)</code> column of the <code>maintenance_records</code> table. PostgreSQL accelerates similarity retrieval using a Hierarchical Navigable Small World (HNSW) index constructed with cosine operator distance:
  </p>
  <pre><code>CREATE INDEX idx_maintenance_records_embedding ON maintenance_records 
USING hnsw (embedding vector_cosine_ops);</code></pre>
  <p>
    When querying, PostgreSQL evaluates cosine distance using the <code>&lt;=&gt;</code> operator:
  </p>
  <pre><code>-- Evaluates top semantically similar historical repair records
SELECT mr.issue_title, mr.resolution, 1 - (mr.embedding &lt;=&gt; $1::vector) AS similarity
FROM maintenance_records mr
ORDER BY mr.embedding &lt;=&gt; $1::vector ASC
LIMIT 5;</code></pre>

  <h3>9.3. Semantic Search Deduplication</h3>
  <p>
    To prevent repetitive maintenance incidents from saturating the search results, the query pipeline applies an analytical SQL window function (<code>ROW_NUMBER() OVER (PARTITION BY dedupe_key ... ORDER BY cosine_distance ASC)</code>). This ensures that each distinct equipment failure pattern appears at most once in the top-k results, preserving diversity in the retrieved diagnostic guidance.
  </p>
  <div class="callout">
    <strong>Academic Clarification on Similarity Scores:</strong> The computed metric 1 - (u &bull; v) represents geometric cosine similarity between the semantic embeddings of the query text and historical defect logs. It indicates semantic and contextual alignment of technical terminology; it does not represent an empirical probability of hardware component failure or diagnostic accuracy certainty.
  </div>

  <div class="page-break"></div>

  <h2>10. Functional Implementation & Modules</h2>

  <h3>10.1. Authentication & Role-Based Access Control (RBAC)</h3>
  <p>
    Authentication is implemented using salted bcrypt password hashing and tamper-evident HttpOnly JWT cookies. Authorization rules strictly segment features:
  </p>
  <table>
    <thead>
      <tr>
        <th>Role</th>
        <th>Permissions & Accessible System Modules</th>
        <th>Data Scoping Boundary</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>FACILITY_MANAGER</strong></td>
        <td>Full CRUD on assets and warranties; ticket assignment; custody reassignment with ACID commit/rollback; access to DBMS demonstration workbench.</td>
        <td>Global visibility across all 18 enterprise assets, all tickets, and all audit ledgers.</td>
      </tr>
      <tr>
        <td><strong>TECHNICIAN</strong></td>
        <td>View assigned equipment; advance maintenance ticket workflows (<code>Assigned</code> &rarr; <code>Resolved</code>); submit resolution notes; semantic troubleshooting tool.</td>
        <td>Filtered to tickets where <code>assignee_user_id = auth.user.id</code> and associated assets.</td>
      </tr>
      <tr>
        <td><strong>VENDOR</strong></td>
        <td>Acknowledge contracted service tickets; update repair progress; view contracted equipment specifications.</td>
        <td>Strictly isolated to assets and tickets explicitly assigned to their vendor account (4 assets).</td>
      </tr>
    </tbody>
  </table>

  <h3>10.2. Maintenance Ticket Workflow</h3>
  <p>
    Tickets transition through six defined states: <code>Reported</code> &rarr; <code>Assigned</code> &rarr; <code>Acknowledged</code> &rarr; <code>In Progress</code> &rarr; <code>Resolved</code> &rarr; <code>Closed</code>. When a technician marks a ticket as <code>Resolved</code>, the system automatically triggers embedding generation on the ticket resolution text, inserting a verified case into <code>maintenance_records</code> to enrich the institutional knowledge base.
  </p>

  <h3>10.3. DBMS Demonstration Workbench</h3>
  <p>
    The application includes a dedicated academic evaluation page (<code>/dbms-demo</code>, restricted to Facility Managers) that exposes live PostgreSQL internals:
  </p>
  <ul>
    <li><strong>ACID Reassignment & Rollback Simulator:</strong> Enables the evaluator to execute real database reassignments and verify immediate ledger row insertions, or toggle deliberate failure to verify atomic rollback.</li>
    <li><strong>Live Trigger Event Log:</strong> Displays recent in-app notifications generated by <code>process_warranty_alert()</code>.</li>
    <li><strong>View Inspection:</strong> Displays live aggregated tuples from <code>critical_asset_dashboard</code>.</li>
    <li><strong>Vector Metadata:</strong> Displays pgvector extension version (v0.8.7), embedding dimensions (384), and HNSW index status.</li>
  </ul>

  <h2>11. Testing, Verification & Quality Assurance</h2>
  <p>
    The codebase underwent comprehensive verification across automated test suites, static TypeScript compilation, Next.js production builds, and live database runtime checks.
  </p>
  <table>
    <thead>
      <tr>
        <th>Verification Gate</th>
        <th>Command Executed</th>
        <th>Observed Result</th>
        <th>Pass / Fail</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>TypeScript Compiler</strong></td>
        <td><code>npm run typecheck</code> (<code>tsc --noEmit</code>)</td>
        <td>Exited with code 0. Zero typing or syntax errors across route handlers and components.</td>
        <td><strong>PASS</strong></td>
      </tr>
      <tr>
        <td><strong>Automated Test Suite</strong></td>
        <td><code>npm run test</code> (<code>scripts/run-tests.ts</code>)</td>
        <td><strong>39 / 39 passed</strong> across 9 test suites: bcrypt, RBAC, categories, views, triggers, ACID commit/rollback, dashboard, pgvector search, deduplication regression.</td>
        <td><strong>PASS</strong></td>
      </tr>
      <tr>
        <td><strong>Production Build</strong></td>
        <td><code>npm run build</code> (<code>next build</code>)</td>
        <td>Exited with code 0. 27 static and dynamic App Router routes compiled cleanly.</td>
        <td><strong>PASS</strong></td>
      </tr>
      <tr>
        <td><strong>Database Migration & Seed</strong></td>
        <td><code>npm run db:setup</code></td>
        <td>Exited with code 0. 18 assets, 18 warranties, 15 tickets, 12 vector embeddings seeded idempotently.</td>
        <td><strong>PASS</strong></td>
      </tr>
      <tr>
        <td><strong>Container Volume Persistence</strong></td>
        <td><code>docker compose down && docker compose up -d</code></td>
        <td>Container restarted cleanly. Row counts in <code>ewh_pgdata</code> remained identical before and after restart.</td>
        <td><strong>PASS</strong></td>
      </tr>
    </tbody>
  </table>

  <h2>12. Limitations & Design Boundaries</h2>
  <ul>
    <li><strong>Local Embedding Latency:</strong> Generating embeddings using CPU inference in Node.js requires approximately 40–80 milliseconds per record. In high-throughput industrial deployments, this would be offloaded to a dedicated GPU inference microservice.</li>
    <li><strong>Single Active Warranty Model:</strong> Each asset maintains at most one active warranty record in <code>warranties</code> (enforced by <code>UNIQUE(asset_id)</code>). Equipment with multiple concurrent third-party insurance riders would require a 1:N relationship.</li>
    <li><strong>In-App Alert Delivery:</strong> System alerts are delivered strictly via internal database notifications; external SMTP, SMS, or webhooks are not configured.</li>
  </ul>

  <h2>13. Conclusion</h2>
  <p>
    Enterprise Warranty Hub successfully demonstrates the integration of fundamental and modern database concepts within a production-grade enterprise software architecture. By combining normalized relational modeling, strict domain constraints, atomic multi-table transactions, automated event triggers, dynamic views, and dense vector similarity search via pgvector, the system proves that PostgreSQL can serve as both a rigorous transactional core and an effective semantic search engine. The project fulfills all academic DBMS requirements while providing a clean, responsive, and verifiable software artifact.
  </p>

</body>
</html>"""

def generate_technical_guide_html():
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Enterprise Warranty Hub — Technical & Demonstration Guide</title>
  <style>
    {BASE_CSS}
  </style>
</head>
<body>

  <div class="cover-box">
    <div class="cover-title">ENTERPRISE WARRANTY HUB</div>
    <div class="cover-subtitle">Technical Installation, Architecture, Demonstration Sequence & Operational Guide</div>
    <div class="cover-meta">
      <strong>DBMS Academic Evaluation &bull; Team 4 &bull; Section AIML A &bull; PES University</strong><br>
      Anish Kumar (PES1UG24AM043) &bull; Aarav Yuval B G (PES1UG24AM004)
    </div>
  </div>

  <div class="toc">
    <div class="toc-title">TABLE OF CONTENTS</div>
    <div class="toc-grid">
      <div class="toc-item"><span>1. System Requirements</span><span>Page 1</span></div>
      <div class="toc-item"><span>7. Demo Accounts & RBAC Matrix</span><span>Page 3</span></div>
      <div class="toc-item"><span>2. Installation Procedure</span><span>Page 1</span></div>
      <div class="toc-item"><span>8. Application Workflow Walkthrough</span><span>Page 4</span></div>
      <div class="toc-item"><span>3. Environment Configuration</span><span>Page 1</span></div>
      <div class="toc-item"><span>9. Step-by-Step DBMS Demonstration</span><span>Page 5</span></div>
      <div class="toc-item"><span>4. Docker Container Setup</span><span>Page 2</span></div>
      <div class="toc-item"><span>10. Suggested 5–8 Min Evaluation Plan</span><span>Page 6</span></div>
      <div class="toc-item"><span>5. Database Migrations & Seeding</span><span>Page 2</span></div>
      <div class="toc-item"><span>11. Local Troubleshooting Guide</span><span>Page 6</span></div>
      <div class="toc-item"><span>6. Execution Commands (PowerShell)</span><span>Page 2</span></div>
      <div class="toc-item"><span>12. Verification Checklist</span><span>Page 6</span></div>
    </div>
  </div>

  <h2>1. System Requirements</h2>
  <p>
    The Enterprise Warranty Hub application requires the following software prerequisites for local execution:
  </p>
  <ul>
    <li><strong>Operating System:</strong> Windows 10/11, macOS, or Ubuntu Linux (verified on Windows 11 with PowerShell 7 / Windows PowerShell 5.1).</li>
    <li><strong>Node.js Runtime:</strong> Version 18.18.0 or higher (Node 20 LTS recommended; verified on Node v20.x / v24.x).</li>
    <li><strong>Package Manager:</strong> npm v9.x or higher (included with Node.js).</li>
    <li><strong>Container Engine:</strong> Docker Desktop v4.x or Docker Engine with Docker Compose v2 support (WSL2 backend on Windows).</li>
    <li><strong>Network Ports:</strong> Port <code>5432</code> (PostgreSQL) and Port <code>3000</code> (Next.js web application).</li>
  </ul>

  <h2>2. Installation Procedure</h2>
  <p>
    Follow these steps to clone and install the project repository:
  </p>
  <pre><code># 1. Clone repository from GitHub
git clone https://github.com/PES1UG24AM004/DBMS-Enterprise-Warranty-Hub.git
cd DBMS-Enterprise-Warranty-Hub

# 2. Install application dependencies
npm install</code></pre>

  <h2>3. Environment Configuration</h2>
  <p>
    The repository includes a documented <code>.env.example</code> file. For local execution, copy it to <code>.env.local</code>:
  </p>
  <pre><code># In PowerShell:
Copy-Item .env.example .env.local</code></pre>
  <p>
    The environment variables and their operational purposes are detailed below:
  </p>
  <table>
    <thead>
      <tr>
        <th>Variable Name</th>
        <th>Default Development Value</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>DATABASE_URL</code></td>
        <td><code>postgresql://postgres:postgrespassword@localhost:5432/enterprise_warranty</code></td>
        <td>Full PostgreSQL connection URI used by database clients.</td>
      </tr>
      <tr>
        <td><code>PGHOST</code> / <code>PGPORT</code></td>
        <td><code>localhost</code> / <code>5432</code></td>
        <td>Database server hostname and TCP listening port.</td>
      </tr>
      <tr>
        <td><code>PGUSER</code> / <code>PGPASSWORD</code></td>
        <td><code>postgres</code> / <code>postgrespassword</code></td>
        <td>Standard local PostgreSQL credentials configured in Docker Compose.</td>
      </tr>
      <tr>
        <td><code>PGDATABASE</code></td>
        <td><code>enterprise_warranty</code></td>
        <td>Target database catalog name.</td>
      </tr>
      <tr>
        <td><code>SESSION_SECRET</code></td>
        <td><code>enterprise-warranty-hub-secure-random-academic-key-32chars</code></td>
        <td>Cryptographic secret used to sign and verify session JWTs.</td>
      </tr>
      <tr>
        <td><code>NODE_ENV</code> / <code>PORT</code></td>
        <td><code>development</code> / <code>3000</code></td>
        <td>Node.js execution environment and HTTP listening port.</td>
      </tr>
    </tbody>
  </table>
  <div class="callout">
    <strong>Security Note:</strong> Never commit <code>.env.local</code> to version control. The repository's <code>.gitignore</code> explicitly excludes local environment files while preserving <code>.env.example</code> for configuration reference.
  </div>

  <div class="page-break"></div>

  <h2>4. Docker Container Setup</h2>
  <p>
    The database infrastructure is fully containerized via <code>docker-compose.yml</code> using the official <code>pgvector/pgvector:pg16</code> image:
  </p>
  <pre><code>services:
  db:
    image: pgvector/pgvector:pg16
    container_name: ewh-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: enterprise_warranty
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
    ports:
      - "5432:5432"
    volumes:
      - ewh_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d enterprise_warranty"]
      interval: 3s
      timeout: 3s
      retries: 10

volumes:
  ewh_pgdata:</code></pre>
  <p>
    <strong>Persistence Guarantee:</strong> The named volume <code>ewh_pgdata</code> stores database tables, indexes, and write-ahead logs on the host filesystem, ensuring data persists across container restarts, stops, and system reboots.
  </p>

  <h2>5. Database Setup (Migrations & Seeding)</h2>
  <p>
    Database setup is entirely automated via TypeScript utility scripts located in the <code>scripts/</code> directory:
  </p>
  <ul>
    <li><strong><code>npm run db:migrate</code> (<code>scripts/migrate.ts</code>):</strong> Executes <code>migrations/001_initial_schema.sql</code>. It enables <code>uuid-ossp</code> and <code>vector</code> extensions, constructs all 7 tables with check constraints and foreign keys, deploys PL/pgSQL trigger functions (<code>update_updated_at_column</code>, <code>process_warranty_alert</code>), creates HNSW indexes, and registers dynamic views.</li>
    <li><strong><code>npm run db:seed</code> (<code>scripts/seed.ts</code>):</strong> Populates the database with realistic demo accounts (5 users with bcrypt hashes), 18 enterprise assets spanning 8 categories, 18 warranty contracts, 15 maintenance tickets across 6 workflow stages, and 12 historical maintenance records with real 384-dimensional vector embeddings generated locally. Seeding is strictly idempotent.</li>
    <li><strong><code>npm run db:setup</code> (<code>scripts/setup.ts</code>):</strong> Executes migration and seeding sequentially in a single command.</li>
    <li><strong><code>npm run model:download</code> (<code>scripts/init-model.ts</code>):</strong> Downloads and caches the ONNX MiniLM model locally to prevent runtime delays during evaluation.</li>
  </ul>

  <h2>6. Running the Application (PowerShell Reference)</h2>
  <p>
    All standard administrative commands for Windows PowerShell are listed below:
  </p>
  <table>
    <thead>
      <tr>
        <th style="width: 35%;">Action</th>
        <th style="width: 45%;">PowerShell Command</th>
        <th style="width: 20%;">Notes</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Start Database Container</strong></td>
        <td><code>npm run db:up</code></td>
        <td>Runs <code>docker compose up -d db</code>.</td>
      </tr>
      <tr>
        <td><strong>2. Initialize Database</strong></td>
        <td><code>npm run db:setup</code></td>
        <td>Runs migrations and seed data.</td>
      </tr>
      <tr>
        <td><strong>3. Cache Embedding Model</strong></td>
        <td><code>npm run model:download</code></td>
        <td>Caches 384-dim ONNX model weights.</td>
      </tr>
      <tr>
        <td><strong>4. Run Automated Test Suite</strong></td>
        <td><code>npm run test</code></td>
        <td>Executes all 39 automated tests.</td>
      </tr>
      <tr>
        <td><strong>5. Run Typecheck</strong></td>
        <td><code>npm run typecheck</code></td>
        <td>Runs TypeScript compiler checks.</td>
      </tr>
      <tr>
        <td><strong>6. Start Development Server</strong></td>
        <td><code>npm run dev</code></td>
        <td>Serves app at <code>http://localhost:3000</code>.</td>
      </tr>
      <tr>
        <td><strong>7. Build Production Bundle</strong></td>
        <td><code>npm run build</code></td>
        <td>Compiles optimized production build.</td>
      </tr>
      <tr>
        <td><strong>8. Start Production Server</strong></td>
        <td><code>npm run start</code></td>
        <td>Runs compiled Next.js production server.</td>
      </tr>
      <tr>
        <td><strong>9. Stop Database Container</strong></td>
        <td><code>npm run db:down</code></td>
        <td>Stops container (preserves volume).</td>
      </tr>
      <tr>
        <td><strong>10. Clean Reset Database</strong></td>
        <td><code>npm run db:reset</code></td>
        <td>Drops all tables, re-migrates, re-seeds.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h2>7. Demo Accounts & Role-Based Access Control (RBAC)</h2>
  <p>
    The seed dataset provisions five verified demo accounts representing the three supported organizational roles. All accounts share the public academic demo password <code>Demo123!</code>:
  </p>
  <table>
    <thead>
      <tr>
        <th>Account Name</th>
        <th>Login Email</th>
        <th>System Role</th>
        <th>Scope & Intended Demonstration Purpose</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Facility Director</strong></td>
        <td><code>manager@ewh.demo</code></td>
        <td><code>FACILITY_MANAGER</code></td>
        <td>Full administrative access. Manages all 18 assets, executes custody reassignments, views full audit ledger, and accesses DBMS workbench.</td>
      </tr>
      <tr>
        <td><strong>Senior Technician</strong></td>
        <td><code>technician@ewh.demo</code></td>
        <td><code>TECHNICIAN</code></td>
        <td>Manages assigned diagnostic queues. Advances maintenance ticket statuses (<code>Acknowledged</code> &rarr; <code>Resolved</code>) and tests vector troubleshooting.</td>
      </tr>
      <tr>
        <td><strong>Field Technician</strong></td>
        <td><code>field.tech@ewh.demo</code></td>
        <td><code>TECHNICIAN</code></td>
        <td>Secondary technician account used to demonstrate custody handoffs and reassignment transactions between different staff members.</td>
      </tr>
      <tr>
        <td><strong>Apex Medical / Vendor</strong></td>
        <td><code>vendor@ewh.demo</code></td>
        <td><code>VENDOR</code></td>
        <td>External contractor account. Demonstrates database-level row isolation; restricted strictly to the 4 assets and tickets assigned to this vendor.</td>
      </tr>
      <tr>
        <td><strong>Facilities Lead</strong></td>
        <td><code>aarav@ewh.demo</code></td>
        <td><code>FACILITY_MANAGER</code></td>
        <td>Secondary manager account for demonstrating multi-manager notification dispatch by the warranty alert trigger.</td>
      </tr>
    </tbody>
  </table>

  <h3>7.1. One-Click Demonstration Login Shortcuts</h3>
  <p>
    To eliminate login typing delays during evaluation, the login card at <code>http://localhost:3000/login</code> provides three <strong>1-Click Demo Login</strong> buttons:
  </p>
  <ul>
    <li><strong>"Facility Dir." Button:</strong> Automatically populates <code>manager@ewh.demo</code> and authenticates as Facility Manager.</li>
    <li><strong>"Technician" Button:</strong> Automatically populates <code>technician@ewh.demo</code> and authenticates as Technician.</li>
    <li><strong>"Vendor" Button:</strong> Automatically populates <code>vendor@ewh.demo</code> and authenticates as Vendor.</li>
  </ul>
  <p>
    These shortcuts execute genuine HTTP <code>POST /api/auth/login</code> requests against the PostgreSQL database, validating the password against the bcrypt hash and receiving an HttpOnly session cookie.
  </p>

  <div class="avoid-break">
    <h3>7.2. Role-Based Permission Matrix</h3>
    <table>
      <thead>
        <tr>
          <th>Capability / Route</th>
          <th>Facility Manager</th>
          <th>Technician</th>
          <th>Vendor</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Dashboard Overview (<code>/dashboard</code>)</td>
          <td>Full Facility Metrics (18 assets)</td>
          <td>Technician Work Queue</td>
          <td>Vendor Contract Summary (4 assets)</td>
        </tr>
        <tr>
          <td>Asset Inventory (<code>/assets</code>)</td>
          <td>All 18 assets (Add / Edit / Reassign)</td>
          <td>Assigned equipment items only</td>
          <td>Contracted vendor assets only</td>
        </tr>
        <tr>
          <td>Custody Reassignment & Ledger</td>
          <td>Full Access (Commit & Rollback)</td>
          <td>No Access (403 Forbidden)</td>
          <td>No Access (403 Forbidden)</td>
        </tr>
        <tr>
          <td>Warranty Management (<code>/warranties</code>)</td>
          <td>All warranties (Add / Edit / Filter)</td>
          <td>Read-only warranty status</td>
          <td>Contracted warranty items only</td>
        </tr>
        <tr>
          <td>Ticket Progression (<code>/tickets</code>)</td>
          <td>Open, Assign, Resolve, Close</td>
          <td>Acknowledge, Progress, Resolve</td>
          <td>Acknowledge & Update Progress</td>
        </tr>
        <tr>
          <td>Vector Troubleshooting (<code>/troubleshoot</code>)</td>
          <td>Full Search Access</td>
          <td>Full Search Access</td>
          <td>Full Search Access</td>
        </tr>
        <tr>
          <td>DBMS Demonstration Page (<code>/dbms-demo</code>)</td>
          <td>Full Access</td>
          <td>No Access (403 Forbidden)</td>
          <td>No Access (403 Forbidden)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="page-break"></div>

  <h2>8. Application Workflow Walkthrough</h2>

  <h3>8.1. Facility Manager Workflow</h3>
  <ol>
    <li>Log in using the <strong>Facility Dir.</strong> 1-click button.</li>
    <li>Review the <strong>Operational Dashboard</strong>: Observe aggregate counters computed directly from PostgreSQL (18 total assets, 6 expiring within 30 days, 4 expired warranties, 9 active tickets). Notice the category and status distribution bars reflecting real SQL row counts.</li>
    <li>Navigate to <strong>Assets (<code>/assets</code>)</strong>: Filter by category (e.g., <em>Air Conditioners</em>) or use the search bar. Click on any asset to inspect warranty details, location, and custodial assignee.</li>
    <li>Demonstrate custody reassignment: Click <strong>"Reassign"</strong> on asset <code>AST-CL-001</code>, select a different technician, and commit the transaction. Verify immediate audit logging.</li>
    <li>Navigate to <strong>Warranties (<code>/warranties</code>)</strong>: View the dynamically derived warranty states (<code>ACTIVE</code>, <code>EXPIRING_SOON</code>, <code>EXPIRED</code>). Filter by <em>Expiring Soon</em> to review the 30-day window items.</li>
    <li>Navigate to <strong>DBMS Demonstration (<code>/dbms-demo</code>)</strong>: Walk the evaluator through live transaction ledgers, trigger alert notifications, dynamic view rows, and pgvector extension metadata.</li>
  </ol>

  <h3>8.2. Technician Workflow</h3>
  <ol>
    <li>Log out and log in using the <strong>Technician</strong> 1-click button (<code>technician@ewh.demo</code>).</li>
    <li>Observe the tailored dashboard: Displays tickets assigned directly to this technician.</li>
    <li>Navigate to <strong>Maintenance Tickets (<code>/tickets</code>)</strong>: Click on an assigned ticket (e.g., <code>TCK-2026-003</code>). Advance its status from <code>Assigned</code> to <code>In Progress</code>.</li>
    <li>Resolve the ticket: Enter technical diagnostic notes (e.g., <em>"Replaced faulty thermistor and cleared cooling intake manifold"</em>) and click <strong>"Resolve Ticket"</strong>. The system records the resolution and automatically triggers local embedding generation into <code>maintenance_records</code>.</li>
    <li>Navigate to <strong>Troubleshooting (<code>/troubleshoot</code>)</strong>: Enter a natural-language query to retrieve historical resolutions for recurring issues.</li>
  </ol>

  <h3>8.3. Vendor Workflow</h3>
  <ol>
    <li>Log out and log in using the <strong>Vendor</strong> 1-click button (<code>vendor@ewh.demo</code>).</li>
    <li>Observe strict data scoping: The vendor sees only 4 assets and tickets associated with their service contracts.</li>
    <li>Navigate to <strong>Assets (<code>/assets</code>)</strong>: Confirm that unassigned enterprise assets (e.g., internal workstations or administrative laptops) are hidden, proving server-side query scoping and authorization.</li>
  </ol>

  <h2>9. Step-by-Step DBMS Demonstration Sequence</h2>
  <p>
    This sequence is specifically designed for demonstrating technical DBMS concepts to an evaluating professor.
  </p>

  <h3>Demonstration 1: ACID Database Transactions (Commit & Rollback)</h3>
  <ol>
    <li>Log in as <strong>Facility Manager</strong> and navigate to <strong>Assets (<code>/assets</code>)</strong>.</li>
    <li>Locate asset <code>AST-CL-001</code> (Dell Precision 5820 Workstation) and click <strong>"Reassign Custody"</strong>.</li>
    <li>Select <strong>Senior Technician</strong> (<code>technician@ewh.demo</code>) as the new assignee and click <strong>"Commit Transaction"</strong>.</li>
    <li><strong>Explain the DBMS mechanism:</strong> Point out that PostgreSQL executed <code>BEGIN</code>, locked the asset row via <code>SELECT ... FOR UPDATE</code>, updated <code>assets.assigned_to_user_id</code>, appended an audit record to <code>asset_maintenance_ledger</code>, and executed <code>COMMIT</code>. Both tables were updated atomically.</li>
    <li>Now click <strong>"Reassign Custody"</strong> again on the same asset.</li>
    <li>Check the <strong>"Simulate Failure (Demonstrate ROLLBACK)"</strong> checkbox. Select a different technician and click <strong>"Commit Transaction"</strong>.</li>
    <li><strong>Explain the Rollback mechanism:</strong> An error is thrown. The catch block executes <code>ROLLBACK</code>. Show that the asset assignee remains unchanged and no ledger row was written, proving atomicity.</li>
    <li>Open <strong>DBMS Demonstration (<code>/dbms-demo</code>)</strong>: Show the <strong>Asset Custody Transaction Ledger</strong> table displaying the committed audit trail with timestamps.</li>
  </ol>

  <div class="page-break"></div>

  <h3>Demonstration 2: PL/pgSQL Event Triggers (Warranty Expiration Alerts)</h3>
  <ol>
    <li>On the <strong>DBMS Demonstration</strong> page, scroll to <strong>PostgreSQL Event Trigger: Warranty Alerts</strong>.</li>
    <li>Show the live notifications generated by trigger <code>trg_warranty_alert</code> executing function <code>process_warranty_alert()</code>.</li>
    <li><strong>Explain the Trigger mechanism:</strong>
      <ul>
        <li>Whenever a warranty row is inserted or updated, the trigger computes <code>days_left := NEW.end_date - CURRENT_DATE</code>.</li>
        <li>If days_left &le; 30 and &ge; 0, it dispatches a <code>WARRANTY_EXPIRING</code> alert.</li>
        <li>If days_left &lt; 0, it dispatches a <code>WARRANTY_EXPIRED</code> alert.</li>
        <li>It inserts into <code>notifications</code> with <code>ON CONFLICT (user_id, dedupe_key) DO NOTHING</code>, guaranteeing deduplication.</li>
      </ul>
    </li>
    <li>Click the notification bell in the top navigation bar to show the live unread alert badge and notification tray.</li>
  </ol>

  <h3>Demonstration 3: Multi-Table Relational SQL Views</h3>
  <ol>
    <li>Navigate to <strong>Warranties (<code>/warranties</code>)</strong>: Explain that this interface queries the view <code>asset_warranty_status</code>. Show how remaining days are computed dynamically from <code>CURRENT_DATE</code>, ensuring values never become stale.</li>
    <li>On the <strong>DBMS Demonstration</strong> page, scroll to <strong>SQL View: Critical Asset Dashboard</strong>.</li>
    <li>Show the aggregated rows: Point out how <code>COUNT(t.id) FILTER</code> aggregates open tickets while <code>ARRAY_AGG(t.ticket_code)</code> collates ticket codes into an array column directly inside PostgreSQL.</li>
  </ol>

  <h3>Demonstration 4: pgvector Semantic Troubleshooting</h3>
  <ol>
    <li>Navigate to <strong>Troubleshooting (<code>/troubleshoot</code>)</strong>.</li>
    <li>Click on the pre-filled sample prompt: <em>"laptop overheating and fan spinning at maximum speed"</em>.</li>
    <li>Click <strong>"Execute Semantic Vector Search"</strong>.</li>
    <li>Show the results: The top result is the historical Dell workstation record: <em>"Laptop CPU severe thermal throttling and fan screaming at full RPM"</em> with ~63% cosine similarity.</li>
    <li>Now type a different query: <em>"water leaking from air conditioner ceiling unit"</em> and search.</li>
    <li>Show the result: Correctly ranks the ceiling cassette AC drainage record at the top.</li>
    <li><strong>Explain the Vector Architecture:</strong>
      <ul>
        <li>Model: <code>onnx-community/all-MiniLM-L6-v2-ONNX</code> running 100% locally in Node.js.</li>
        <li>Output: 384-dimensional normalized vector (||v||_2 = 1.0).</li>
        <li>Index: PostgreSQL HNSW index on <code>vector_cosine_ops</code>.</li>
        <li>Distance calculation: <code>mr.embedding &lt;=&gt; $1::vector</code> (cosine distance).</li>
        <li>Deduplication: Analytical SQL window function prevents duplicate cards.</li>
      </ul>
    </li>
  </ol>

  <h2>10. Suggested 5–8 Minute Presentation Sequence</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 15%;">Timestamp</th>
        <th style="width: 30%;">Topic</th>
        <th style="width: 55%;">Key Talking Points & Action</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>0:00 – 1:00</strong></td>
        <td>Project Intro & RBAC Login</td>
        <td>Introduce EWH (Team 4, AIML A, PES University). Click "Facility Dir." 1-click login. Explain raw SQL architecture (node-postgres, no ORMs).</td>
      </tr>
      <tr>
        <td><strong>1:00 – 2:00</strong></td>
        <td>Dashboard & SQL Views</td>
        <td>Present live metrics (18 assets, 6 expiring, 4 expired, 9 tickets). Explain view <code>asset_warranty_status</code> computing real-time status dynamically.</td>
      </tr>
      <tr>
        <td><strong>2:00 – 3:30</strong></td>
        <td>ACID Transactions (Assets)</td>
        <td>Go to <code>/assets</code>. Reassign asset <code>AST-CL-001</code> to Technician & commit. Then check "Simulate Failure" and show atomic <code>ROLLBACK</code>. Show ledger audit trail.</td>
      </tr>
      <tr>
        <td><strong>3:30 – 4:30</strong></td>
        <td>PL/pgSQL Triggers</td>
        <td>Navigate to <code>/dbms-demo</code>. Explain trigger function <code>process_warranty_alert()</code>, 30-day window evaluation, and deduplication via unique constraint.</td>
      </tr>
      <tr>
        <td><strong>4:30 – 6:00</strong></td>
        <td>pgvector Semantic Search</td>
        <td>Go to <code>/troubleshoot</code>. Run search for "laptop overheating". Explain local MiniLM ONNX (384-d), HNSW index, cosine distance (<code>&lt;=&gt;</code>), and deduplication window function.</td>
      </tr>
      <tr>
        <td><strong>6:00 – 7:00</strong></td>
        <td>Role Scoping (Vendor)</td>
        <td>Sign out, log in as Vendor. Show that Vendor sees only 4 assigned assets vs Manager's 18, proving database-level data isolation.</td>
      </tr>
      <tr>
        <td><strong>7:00 – 8:00</strong></td>
        <td>Test Suite & Conclusion</td>
        <td>Highlight 39/39 passing automated tests, container volume persistence, and invite questions from the evaluator.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h2>11. Local Troubleshooting Guide</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Observed Symptom</th>
        <th style="width: 35%;">Probable Cause</th>
        <th style="width: 40%;">Resolution Procedure</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>dial tcp 127.0.0.1:5432: connect: connection refused</code></td>
        <td>Docker Desktop is not running, or PostgreSQL container <code>ewh-postgres</code> is stopped.</td>
        <td>Launch Docker Desktop, wait for engine to initialize, and run: <code>npm run db:up</code>. Confirm with <code>docker compose ps</code>.</td>
      </tr>
      <tr>
        <td><code>Port 5432 is already allocated</code></td>
        <td>A local native PostgreSQL instance is running on the host machine.</td>
        <td>Stop local Windows service: <code>Stop-Service postgresql*</code> in PowerShell, or stop the competing container.</td>
      </tr>
      <tr>
        <td><code>Port 3000 is already in use</code></td>
        <td>Another Next.js or Node.js process is occupying port 3000.</td>
        <td>Run <code>Get-Process node | Stop-Process -Force</code> or specify a custom port: <code>npm run dev -- -p 3001</code>.</td>
      </tr>
      <tr>
        <td><code>relation "users" does not exist</code></td>
        <td>Database container was created fresh but migrations were not executed.</td>
        <td>Run <code>npm run db:setup</code> to execute migrations and seed data.</td>
      </tr>
      <tr>
        <td>Model download timeout / offline execution</td>
        <td>First semantic search attempts to download ONNX model without active internet connection.</td>
        <td>Run <code>npm run model:download</code> once while connected to download model weights (~90MB) to local cache.</td>
      </tr>
      <tr>
        <td>Corrupted / Inconsistent Database State</td>
        <td>Accidental partial deletions during testing.</td>
        <td>Run <code>npm run db:reset</code> to cleanly drop all tables, re-run migrations, and re-seed the full catalog.</td>
      </tr>
    </tbody>
  </table>

  <h2>12. Final Release Verification Checklist</h2>
  <p>
    Before university evaluation, verify that all release gates are satisfied:
  </p>
  <ul>
    <li>[x] <strong>Docker PostgreSQL Container:</strong> Running and healthy on port 5432 with pgvector extension enabled.</li>
    <li>[x] <strong>TypeScript Compilation:</strong> <code>npm run typecheck</code> passes with code 0 (zero errors).</li>
    <li>[x] <strong>Automated Test Suite:</strong> <code>npm run test</code> reports 39 / 39 tests passed (0 failed).</li>
    <li>[x] <strong>Production Build:</strong> <code>npm run build</code> successfully compiles all 27 App Router routes.</li>
    <li>[x] <strong>Database Seeding:</strong> 5 demo accounts, 18 assets, 18 warranties, 15 tickets, 12 vector records seeded idempotently.</li>
    <li>[x] <strong>ACID Transactions:</strong> Reassignment commit and rollback verified in live UI and automated tests.</li>
    <li>[x] <strong>Triggers & Views:</strong> <code>process_warranty_alert()</code> and views <code>asset_warranty_status</code> & <code>critical_asset_dashboard</code> verified.</li>
    <li>[x] <strong>Local pgvector Search:</strong> 384-dimensional cosine distance queries functioning with deduplication.</li>
    <li>[x] <strong>Documentation:</strong> <code>docs/Project_Report.pdf</code> and <code>docs/Technical_and_Demo_Guide.pdf</code> compiled in grayscale academic style with zero headers or footers.</li>
  </ul>

</body>
</html>"""

def render_pdf(html_content, output_pdf_path):
    temp_html_path = output_pdf_path.replace('.pdf', '_temp.html')
    with open(temp_html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

    file_url = 'file:///' + temp_html_path.replace('\\', '/')
    print(f"Rendering PDF: {os.path.basename(output_pdf_path)}...")

    cmd = [
        CHROME_PATH,
        '--headless=new',
        '--disable-gpu',
        '--no-pdf-header-footer',
        f'--print-to-pdf={output_pdf_path}',
        '--virtual-time-budget=5000',
        file_url
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("Chrome error:", result.stderr)
        if os.path.exists(temp_html_path):
            os.remove(temp_html_path)
        raise RuntimeError(f"Failed to generate {output_pdf_path}")

    if os.path.exists(temp_html_path):
        os.remove(temp_html_path)

    if os.path.exists(output_pdf_path):
        size_kb = os.path.getsize(output_pdf_path) / 1024
        print(f"[OK] Successfully generated {os.path.basename(output_pdf_path)} ({size_kb:.1f} KB)")
    else:
        raise RuntimeError(f"Output PDF not found: {output_pdf_path}")

def main():
    os.makedirs(DOCS_DIR, exist_ok=True)
    
    # 1. Project Report
    report_pdf = os.path.join(DOCS_DIR, 'Project_Report.pdf')
    report_html = generate_project_report_html()
    render_pdf(report_html, report_pdf)

    # 2. Technical & Demo Guide
    guide_pdf = os.path.join(DOCS_DIR, 'Technical_and_Demo_Guide.pdf')
    guide_html = generate_technical_guide_html()
    render_pdf(guide_html, guide_pdf)

    print("\nAll academic documentation PDFs generated successfully!")

if __name__ == '__main__':
    main()
