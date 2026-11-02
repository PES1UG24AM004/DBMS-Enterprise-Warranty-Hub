'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import {
  Database,
  ArrowRightLeft,
  Zap,
  Eye,
  Cpu,
  CheckCircle2,
  Code2,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function DbmsDemoPage() {
  const [demoData, setDemoData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dbms-demo')
      .then((res) => {
        if (!res.ok) throw new Error('Facility Managers only.');
        return res.json();
      })
      .then((data) => {
        setDemoData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="py-20 flex items-center justify-center text-[#9292A3]">
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="w-2 h-2 rounded-full bg-[#B88AFF] animate-pulse"></div>
            <span>QUERYING LIVE POSTGRESQL OBJECTS & EVIDENCE...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !demoData) {
    return (
      <AppShell>
        <div className="p-6 rounded-lg bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 text-xs text-[#FF4D6D]">
          {error || 'Unable to retrieve DBMS demonstration telemetry.'}
        </div>
      </AppShell>
    );
  }

  const { pgvector, critical_view_data, trigger_notifications, ledger_transactions } = demoData;

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-[#252530] pb-4">
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-[#B88AFF] uppercase">
            <Database className="w-3.5 h-3.5 text-[#B88AFF]" />
            <span>ACADEMIC EVALUATION WORKBENCH • PES UNIVERSITY</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F5F5F7] mt-1">
            DBMS Implementation Demonstration
          </h1>
          <p className="text-xs text-[#9292A3] mt-0.5">
            Interactive, live proof of ACID Transactions, Event Triggers, Materialized SQL Views, and Vector Cosine Similarity Search inside PostgreSQL.
          </p>
        </div>

        {/* SECTION 1: ACID TRANSACTIONS */}
        <div className="p-6 rounded-lg bg-[#08080D] border border-[#252530] space-y-4">
          <div className="flex items-center justify-between border-b border-[#252530] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-[#12121A] border border-[#00F0FF]/40 text-[#00F0FF]">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#F5F5F7]">1. Database ACID Transactions</h2>
                <div className="text-[11px] font-mono text-[#00F0FF]">
                  ATOMIC REASSIGNMENT: assets + asset_maintenance_ledger
                </div>
              </div>
            </div>
            <span className="badge-tag px-2 py-0.5 rounded border border-[#00F0FF]/30 bg-[#00F0FF]/10 text-[#00F0FF]">
              BEGIN / COMMIT / ROLLBACK
            </span>
          </div>

          <p className="text-xs text-[#9292A3] leading-relaxed">
            When reassigning equipment custody, the application uses a single checked-out database client to execute both the update to <code className="text-[#00F0FF]">assets.assigned_to_user_id</code> and the insertion into <code className="text-[#00F0FF]">asset_maintenance_ledger</code> inside a PostgreSQL transaction. If either statement encounters a constraint or system failure, both are completely rolled back to maintain ACID atomicity.
          </p>

          <div className="bg-[#000000] p-3 rounded border border-[#252530] font-mono text-[11px] text-[#F5F5F7] overflow-x-auto">
            <div className="text-[#9292A3]">// SQL Transaction Workflow:</div>
            <div className="text-[#B88AFF]">BEGIN;</div>
            <div className="text-[#F5F5F7]">UPDATE assets SET assigned_to_user_id = $new_user, updated_at = NOW() WHERE id = $asset_id;</div>
            <div className="text-[#F5F5F7]">INSERT INTO asset_maintenance_ledger (asset_id, event_type, details, previous_assignee_id, new_assignee_id, performed_by_user_id) VALUES (...);</div>
            <div className="text-[#4DDBA7]">COMMIT;  -- Or ROLLBACK on any thrown exception</div>
          </div>

          <div>
            <div className="text-xs font-mono text-[#9292A3] uppercase mb-2">
              Live Evidence from <code className="text-[#00F0FF]">asset_maintenance_ledger</code> table:
            </div>
            <div className="border border-[#252530] rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0D0D12] text-[#9292A3] font-mono border-b border-[#252530]">
                  <tr>
                    <th className="p-2.5">Asset Tag</th>
                    <th className="p-2.5">Event Type</th>
                    <th className="p-2.5">Previous Assignee</th>
                    <th className="p-2.5">New Assignee</th>
                    <th className="p-2.5">Operator</th>
                    <th className="p-2.5">Committed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252530]">
                  {ledger_transactions.map((l: any) => (
                    <tr key={l.id} className="hover:bg-[#12121A]/50">
                      <td className="p-2.5 font-mono text-[#00F0FF]">{l.asset_tag}</td>
                      <td className="p-2.5 font-mono text-[11px] text-[#F5F5F7]">{l.event_type}</td>
                      <td className="p-2.5 text-[#9292A3]">{l.previous_assignee_name || '—'}</td>
                      <td className="p-2.5 text-[#4DDBA7] font-medium">{l.new_assignee_name || 'Unassigned'}</td>
                      <td className="p-2.5 text-[#F5F5F7]">{l.performed_by_name}</td>
                      <td className="p-2.5 text-[#9292A3] font-mono text-[11px]">
                        {new Date(l.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION 2: TRIGGERS */}
        <div className="p-6 rounded-lg bg-[#08080D] border border-[#252530] space-y-4">
          <div className="flex items-center justify-between border-b border-[#252530] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-[#12121A] border border-[#FFB84D]/40 text-[#FFB84D]">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#F5F5F7]">2. PostgreSQL Triggers</h2>
                <div className="text-[11px] font-mono text-[#FFB84D]">
                  TRIGGER: trg_warranty_alert ON warranties
                </div>
              </div>
            </div>
            <span className="badge-tag px-2 py-0.5 rounded border border-[#FFB84D]/30 bg-[#FFB84D]/10 text-[#FFB84D]">
              AFTER INSERT OR UPDATE
            </span>
          </div>

          <p className="text-xs text-[#9292A3] leading-relaxed">
            Whenever a warranty is registered or updated, the PostgreSQL trigger function <code className="text-[#FFB84D]">process_warranty_alert()</code> inspects the warranty&apos;s <code className="text-[#FFB84D]">end_date</code>. If expiring within 30 days or already expired, it automatically constructs deduplicated in-app alerts and writes them to the <code className="text-[#00F0FF]">notifications</code> table for all active Facility Managers.
          </p>

          <div className="bg-[#000000] p-3 rounded border border-[#252530] font-mono text-[11px] text-[#F5F5F7] overflow-x-auto">
            <div className="text-[#9292A3]">// PostgreSQL Trigger Declaration:</div>
            <div className="text-[#B88AFF]">CREATE TRIGGER trg_warranty_alert</div>
            <div className="text-[#F5F5F7]">  AFTER INSERT OR UPDATE OF end_date, start_date ON warranties</div>
            <div className="text-[#F5F5F7]">  FOR EACH ROW EXECUTE FUNCTION process_warranty_alert();</div>
          </div>

          <div>
            <div className="text-xs font-mono text-[#9292A3] uppercase mb-2">
              Trigger Output Rows In <code className="text-[#00F0FF]">notifications</code>:
            </div>
            <div className="border border-[#252530] rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0D0D12] text-[#9292A3] font-mono border-b border-[#252530]">
                  <tr>
                    <th className="p-2.5">Alert Type</th>
                    <th className="p-2.5">Asset Tag</th>
                    <th className="p-2.5">Trigger Message Generated</th>
                    <th className="p-2.5">Deduplication Key</th>
                    <th className="p-2.5">Fired Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252530]">
                  {trigger_notifications.map((n: any) => (
                    <tr key={n.id} className="hover:bg-[#12121A]/50">
                      <td className="p-2.5">
                        <span
                          className={`badge-tag px-1.5 py-0.2 rounded border text-[9px] ${
                            n.type === 'WARRANTY_EXPIRED'
                              ? 'text-[#FF4D6D] border-[#FF4D6D]/30 bg-[#FF4D6D]/10'
                              : 'text-[#FFB84D] border-[#FFB84D]/30 bg-[#FFB84D]/10'
                          }`}
                        >
                          {n.type}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-[#00F0FF]">{n.asset_tag}</td>
                      <td className="p-2.5 text-[#F5F5F7] font-medium">{n.message}</td>
                      <td className="p-2.5 font-mono text-[10px] text-[#9292A3]">{n.dedupe_key}</td>
                      <td className="p-2.5 text-[#9292A3] font-mono text-[11px]">
                        {new Date(n.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION 3: DATABASE VIEWS */}
        <div className="p-6 rounded-lg bg-[#08080D] border border-[#252530] space-y-4">
          <div className="flex items-center justify-between border-b border-[#252530] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-[#12121A] border border-[#4DDBA7]/40 text-[#4DDBA7]">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#F5F5F7]">3. Database Views</h2>
                <div className="text-[11px] font-mono text-[#4DDBA7]">
                  VIEW: critical_asset_dashboard
                </div>
              </div>
            </div>
            <span className="badge-tag px-2 py-0.5 rounded border border-[#4DDBA7]/30 bg-[#4DDBA7]/10 text-[#4DDBA7]">
              SQL VIEW
            </span>
          </div>

          <p className="text-xs text-[#9292A3] leading-relaxed">
            The <code className="text-[#4DDBA7]">critical_asset_dashboard</code> SQL view joins <code className="text-[#F5F5F7]">assets</code>, <code className="text-[#F5F5F7]">warranties</code>, and <code className="text-[#F5F5F7]">tickets</code> to isolate high-risk equipment needing immediate attention due to expiring/expired warranty status and/or unresolved tickets.
          </p>

          <div className="border border-[#252530] rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0D0D12] text-[#9292A3] font-mono border-b border-[#252530]">
                <tr>
                  <th className="p-2.5">Asset Tag</th>
                  <th className="p-2.5">Equipment Name</th>
                  <th className="p-2.5">Warranty End</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Days Left</th>
                  <th className="p-2.5">Open Tickets</th>
                  <th className="p-2.5">Associated Ticket Codes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252530]">
                {critical_view_data.map((r: any) => (
                  <tr key={r.asset_id} className="hover:bg-[#12121A]/50">
                    <td className="p-2.5 font-mono text-[#00F0FF]">{r.asset_tag}</td>
                    <td className="p-2.5 font-medium text-[#F5F5F7]">{r.asset_name}</td>
                    <td className="p-2.5 font-mono text-[11px] text-[#9292A3]">
                      {r.warranty_end_date ? new Date(r.warranty_end_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`badge-tag px-1.5 py-0.2 rounded border text-[9px] ${
                          r.warranty_status === 'EXPIRED'
                            ? 'text-[#FF4D6D] border-[#FF4D6D]/30 bg-[#FF4D6D]/10'
                            : 'text-[#FFB84D] border-[#FFB84D]/30 bg-[#FFB84D]/10'
                        }`}
                      >
                        {r.warranty_status}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-[#F5F5F7]">{r.days_remaining}</td>
                    <td className="p-2.5 font-mono text-[#00F0FF] font-bold">{r.open_tickets_count}</td>
                    <td className="p-2.5 font-mono text-[10px] text-[#B88AFF]">
                      {r.open_ticket_codes?.length > 0 ? r.open_ticket_codes.join(', ') : 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 4: PGVECTOR SIMILARITY SEARCH */}
        <div className="p-6 rounded-lg bg-[#08080D] border border-[#252530] space-y-4">
          <div className="flex items-center justify-between border-b border-[#252530] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-[#12121A] border border-[#B88AFF]/40 text-[#B88AFF]">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#F5F5F7]">4. Vector Similarity Search</h2>
                <div className="text-[11px] font-mono text-[#B88AFF]">
                  EXTENSION: pgvector v{pgvector.version} • HNSW INDEX
                </div>
              </div>
            </div>
            <span className="badge-tag px-2 py-0.5 rounded border border-[#B88AFF]/30 bg-[#B88AFF]/10 text-[#B88AFF]">
              vector(384)
            </span>
          </div>

          <p className="text-xs text-[#9292A3] leading-relaxed">
            The troubleshooting system computes dense embeddings locally using Hugging Face Transformers.js and executes cosine similarity queries directly inside PostgreSQL with pgvector&apos;s <code className="text-[#00F0FF]">&lt;=&gt;</code> distance operator against an HNSW index.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded bg-[#0D0D12] border border-[#252530]">
              <span className="text-[10px] text-[#9292A3] uppercase block">pgvector Extension</span>
              <span className="text-[#4DDBA7] font-bold">Enabled (v{pgvector.version})</span>
            </div>
            <div className="p-3 rounded bg-[#0D0D12] border border-[#252530]">
              <span className="text-[10px] text-[#9292A3] uppercase block">Local Model</span>
              <span className="text-[#00F0FF] font-bold truncate block">all-MiniLM-L6-v2-ONNX</span>
            </div>
            <div className="p-3 rounded bg-[#0D0D12] border border-[#252530]">
              <span className="text-[10px] text-[#9292A3] uppercase block">Embedding Width</span>
              <span className="text-[#B88AFF] font-bold">384 Dimensions</span>
            </div>
            <div className="p-3 rounded bg-[#0D0D12] border border-[#252530]">
              <span className="text-[10px] text-[#9292A3] uppercase block">Embedded Records</span>
              <span className="text-[#F5F5F7] font-bold">
                {pgvector.embedded_records} / {pgvector.total_records}
              </span>
            </div>
          </div>

          <div className="bg-[#000000] p-3 rounded border border-[#252530] font-mono text-[11px] text-[#F5F5F7] overflow-x-auto">
            <div className="text-[#9292A3]">// Vector Query Executed in PostgreSQL:</div>
            <div className="text-[#F5F5F7]">SELECT issue_title, resolution, 1 - (embedding &lt;=&gt; $1::vector) AS similarity</div>
            <div className="text-[#F5F5F7]">FROM maintenance_records</div>
            <div className="text-[#F5F5F7]">WHERE embedding IS NOT NULL</div>
            <div className="text-[#4DDBA7]">ORDER BY embedding &lt;=&gt; $1::vector</div>
            <div className="text-[#B88AFF]">LIMIT 5;</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
