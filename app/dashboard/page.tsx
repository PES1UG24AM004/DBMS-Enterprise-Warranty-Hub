'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import {
  Box,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Clock,
  ArrowRight,
  PlusCircle,
  Search,
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load dashboard operational metrics');
        return res.json();
      })
      .then((d) => {
        setData(d);
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
            <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse"></div>
            <span>QUERYING POSTGRESQL VIEWS & METRICS...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <div className="p-6 rounded-lg bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 text-xs text-[#FF4D6D]">
          {error || 'Unable to retrieve dashboard metrics.'}
        </div>
      </AppShell>
    );
  }

  const { role, summary } = data;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252530] pb-4">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-[#00F0FF] uppercase">
              OPERATIONAL OVERVIEW
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#F5F5F7] mt-0.5">
              {role === 'FACILITY_MANAGER' && 'Facility Infrastructure Command'}
              {role === 'TECHNICIAN' && 'Field Technical Workbench'}
              {role === 'VENDOR' && 'Contractor Service Portal'}
            </h1>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {role === 'FACILITY_MANAGER' && (
              <>
                <Link
                  href="/assets?new=true"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#00F0FF] hover:bg-[#00d0e0] text-black font-semibold text-xs transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Asset</span>
                </Link>
                <Link
                  href="/tickets?new=true"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#12121A] hover:bg-[#181824] border border-[#252530] hover:border-[#00F0FF]/50 text-xs text-[#F5F5F7] transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span>Create Ticket</span>
                </Link>
              </>
            )}

            <Link
              href="/troubleshoot"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#12121A] hover:bg-[#181824] border border-[#252530] hover:border-[#B88AFF]/50 text-xs text-[#F5F5F7] transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-[#B88AFF]" />
              <span>Troubleshoot (AI)</span>
            </Link>
          </div>
        </div>

        {/* METRICS CARDS */}
        {role === 'FACILITY_MANAGER' && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-4 rounded-lg bg-[#0D0D12] border border-[#252530]">
              <div className="flex items-center justify-between text-[#9292A3]">
                <span className="text-[11px] font-mono uppercase">Total Assets</span>
                <Box className="w-4 h-4 text-[#00F0FF]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#F5F5F7] mt-2">
                {summary.total_assets}
              </div>
              <div className="text-[10px] text-[#9292A3] mt-1">Across 8 categories</div>
            </div>

            <div className="p-4 rounded-lg bg-[#0D0D12] border border-[#FFB84D]/30">
              <div className="flex items-center justify-between text-[#FFB84D]">
                <span className="text-[11px] font-mono uppercase">Expiring (30d)</span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#FFB84D] mt-2">
                {summary.expiring_soon_warranties}
              </div>
              <div className="text-[10px] text-[#9292A3] mt-1">Attention required</div>
            </div>

            <div className="p-4 rounded-lg bg-[#0D0D12] border border-[#FF4D6D]/30">
              <div className="flex items-center justify-between text-[#FF4D6D]">
                <span className="text-[11px] font-mono uppercase">Expired</span>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#FF4D6D] mt-2">
                {summary.expired_warranties}
              </div>
              <div className="text-[10px] text-[#9292A3] mt-1">Needs renewal</div>
            </div>

            <div className="p-4 rounded-lg bg-[#0D0D12] border border-[#252530]">
              <div className="flex items-center justify-between text-[#9292A3]">
                <span className="text-[11px] font-mono uppercase">Active Tickets</span>
                <Wrench className="w-4 h-4 text-[#00F0FF]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#F5F5F7] mt-2">
                {summary.active_tickets}
              </div>
              <div className="text-[10px] text-[#9292A3] mt-1">Reported / In Progress</div>
            </div>

            <div className="p-4 rounded-lg bg-[#0D0D12] border border-[#252530]">
              <div className="flex items-center justify-between text-[#9292A3]">
                <span className="text-[11px] font-mono uppercase">Resolved/Closed</span>
                <CheckCircle2 className="w-4 h-4 text-[#4DDBA7]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#4DDBA7] mt-2">
                {summary.closed_tickets}
              </div>
              <div className="text-[10px] text-[#9292A3] mt-1">Completed repairs</div>
            </div>
          </div>
        )}

        {(role === 'TECHNICIAN' || role === 'VENDOR') && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-lg bg-[#0D0D12] border border-[#252530]">
              <div className="flex items-center justify-between text-[#9292A3]">
                <span className="text-[11px] font-mono uppercase">Assigned Total</span>
                <Wrench className="w-4 h-4 text-[#00F0FF]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#F5F5F7] mt-2">
                {summary.total_assigned}
              </div>
              <div className="text-[10px] text-[#9292A3] mt-1">Your workload</div>
            </div>

            <div className="p-4 rounded-lg bg-[#0D0D12] border border-[#FFB84D]/30">
              <div className="flex items-center justify-between text-[#FFB84D]">
                <span className="text-[11px] font-mono uppercase">Active Assigned</span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#FFB84D] mt-2">
                {summary.active_assigned}
              </div>
              <div className="text-[10px] text-[#9292A3] mt-1">Pending resolution</div>
            </div>

            <div className="p-4 rounded-lg bg-[#0D0D12] border border-[#4DDBA7]/30">
              <div className="flex items-center justify-between text-[#4DDBA7]">
                <span className="text-[11px] font-mono uppercase">Resolved By You</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#4DDBA7] mt-2">
                {summary.resolved_count}
              </div>
              <div className="text-[10px] text-[#9292A3] mt-1">Awaiting sign-off</div>
            </div>

            {role === 'VENDOR' && data.vendor_assets && (
              <div className="p-4 rounded-lg bg-[#0D0D12] border border-[#252530]">
                <div className="flex items-center justify-between text-[#9292A3]">
                  <span className="text-[11px] font-mono uppercase">Contracted Assets</span>
                  <Box className="w-4 h-4 text-[#FFB84D]" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#F5F5F7] mt-2">
                  {data.vendor_assets.length}
                </div>
                <div className="text-[10px] text-[#9292A3] mt-1">Service scope</div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: Role Specific Detail Panes */}

        {/* FACILITY MANAGER: Charts & Alerts & Recent Tickets */}
        {role === 'FACILITY_MANAGER' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category breakdown visual bar chart */}
            <div className="p-5 rounded-lg bg-[#08080D] border border-[#252530] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#9292A3] uppercase">
                  Asset Distribution By Category
                </span>
                <span className="text-[10px] font-mono text-[#00F0FF]">LIVE POSTGRES DATA</span>
              </div>

              <div className="space-y-2.5">
                {data.category_distribution?.map((cat: any) => {
                  const maxCount = Math.max(...data.category_distribution.map((c: any) => c.count), 1);
                  const pct = Math.round((cat.count / maxCount) * 100);
                  return (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#F5F5F7] truncate">{cat.category}</span>
                        <span className="font-mono text-[#9292A3]">{cat.count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#12121A] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00F0FF]"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ticket status breakdown */}
            <div className="p-5 rounded-lg bg-[#08080D] border border-[#252530] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#9292A3] uppercase">
                  Ticket Workflow Status
                </span>
                <span className="text-[10px] font-mono text-[#4DDBA7]">6 STAGES</span>
              </div>

              <div className="space-y-2.5">
                {data.status_distribution?.map((st: any) => {
                  const maxCount = Math.max(...data.status_distribution.map((s: any) => s.count), 1);
                  const pct = Math.round((st.count / maxCount) * 100);
                  const color =
                    st.status === 'Resolved' || st.status === 'Closed'
                      ? 'bg-[#4DDBA7]'
                      : st.status === 'In Progress'
                      ? 'bg-[#00F0FF]'
                      : 'bg-[#FFB84D]';

                  return (
                    <div key={st.status} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#F5F5F7]">{st.status}</span>
                        <span className="font-mono text-[#9292A3]">{st.count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#12121A] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming 30-day Alerts */}
            <div className="p-5 rounded-lg bg-[#08080D] border border-[#252530] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#FFB84D] uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Upcoming 30-Day Alerts
                </span>
                <Link
                  href="/warranties?filter=expiring"
                  className="text-[11px] text-[#00F0FF] hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-2">
                {data.alerts?.length === 0 ? (
                  <div className="text-xs text-[#9292A3] py-4 text-center">
                    No warranties expiring in next 30 days.
                  </div>
                ) : (
                  data.alerts?.map((al: any) => (
                    <div
                      key={al.asset_id}
                      className="p-2.5 rounded bg-[#0D0D12] border border-[#252530] hover:border-[#FFB84D]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[#9292A3]">
                          {al.asset_tag}
                        </span>
                        <span
                          className={`badge-tag px-1.5 py-0.2 rounded border text-[9px] ${
                            al.warranty_status === 'EXPIRED'
                              ? 'text-[#FF4D6D] border-[#FF4D6D]/30 bg-[#FF4D6D]/10'
                              : 'text-[#FFB84D] border-[#FFB84D]/30 bg-[#FFB84D]/10'
                          }`}
                        >
                          {al.warranty_status === 'EXPIRED'
                            ? 'EXPIRED'
                            : `${al.days_remaining}d LEFT`}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-[#F5F5F7] truncate mt-1">
                        {al.asset_name}
                      </div>
                      <div className="text-[10px] text-[#9292A3] mt-0.5">
                        {al.location || 'Location unassigned'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TECHNICIAN & VENDOR: Assigned Tickets List */}
        {(role === 'TECHNICIAN' || role === 'VENDOR') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#F5F5F7]">
                Your Assigned Maintenance Tickets ({data.assigned_tickets?.length || 0})
              </h2>
              <Link href="/tickets" className="text-xs text-[#00F0FF] hover:underline flex items-center gap-1">
                <span>Open Tickets Workspace</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-[#08080D] border border-[#252530] rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0D0D12] text-[#9292A3] font-mono border-b border-[#252530]">
                  <tr>
                    <th className="p-3">Ticket</th>
                    <th className="p-3">Equipment Asset</th>
                    <th className="p-3">Issue Title</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Last Updated</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252530]">
                  {data.assigned_tickets?.map((t: any) => (
                    <tr key={t.id} className="hover:bg-[#12121A]/50 transition-colors">
                      <td className="p-3 font-mono text-[#00F0FF] font-medium">{t.ticket_code}</td>
                      <td className="p-3">
                        <div className="font-medium text-[#F5F5F7]">{t.asset_name}</div>
                        <div className="text-[10px] text-[#9292A3] font-mono">{t.asset_tag}</div>
                      </td>
                      <td className="p-3 max-w-xs truncate text-[#F5F5F7]">{t.title}</td>
                      <td className="p-3">
                        <span
                          className={`badge-tag px-2 py-0.5 rounded border text-[10px] ${
                            t.status === 'Resolved' || t.status === 'Closed'
                              ? 'text-[#4DDBA7] border-[#4DDBA7]/30 bg-[#4DDBA7]/10'
                              : t.status === 'In Progress'
                              ? 'text-[#00F0FF] border-[#00F0FF]/30 bg-[#00F0FF]/10'
                              : 'text-[#FFB84D] border-[#FFB84D]/30 bg-[#FFB84D]/10'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-[#9292A3] font-mono text-[11px]">
                        {new Date(t.updated_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href={`/tickets?select=${t.id}`}
                          className="px-2.5 py-1 rounded bg-[#12121A] hover:bg-[#181824] border border-[#252530] text-[#00F0FF] hover:border-[#00F0FF]/50 text-xs inline-block"
                        >
                          Update Status
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* VENDOR SPECIFIC: Contracted Assets */}
            {role === 'VENDOR' && data.vendor_assets && (
              <div className="pt-4 space-y-3">
                <h3 className="text-xs font-mono text-[#9292A3] uppercase">
                  Connected Equipment Assets (Vendor Ticket Scope)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {data.vendor_assets.map((a: any) => (
                    <div key={a.id} className="p-3 rounded bg-[#0D0D12] border border-[#252530]">
                      <div className="text-[10px] font-mono text-[#00F0FF]">{a.asset_tag}</div>
                      <div className="text-xs font-semibold text-[#F5F5F7] mt-0.5">{a.name}</div>
                      <div className="text-[11px] text-[#9292A3] mt-1">
                        {a.manufacturer} • {a.category}
                      </div>
                      <div className="text-[10px] text-[#5F5F70] mt-0.5">Location: {a.location}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FACILITY MANAGER: Recent Activity / Tickets */}
        {role === 'FACILITY_MANAGER' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#F5F5F7]">Recent Maintenance Tickets</h2>
              <Link href="/tickets" className="text-xs text-[#00F0FF] hover:underline flex items-center gap-1">
                <span>View Full Registry</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-[#08080D] border border-[#252530] rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0D0D12] text-[#9292A3] font-mono border-b border-[#252530]">
                  <tr>
                    <th className="p-3">Ticket</th>
                    <th className="p-3">Asset</th>
                    <th className="p-3">Issue</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Assignee</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252530]">
                  {data.recent_tickets?.map((t: any) => (
                    <tr key={t.id} className="hover:bg-[#12121A]/50 transition-colors">
                      <td className="p-3 font-mono text-[#00F0FF] font-medium">{t.ticket_code}</td>
                      <td className="p-3 text-[#F5F5F7] font-medium">{t.asset_name}</td>
                      <td className="p-3 max-w-sm truncate text-[#9292A3]">{t.title}</td>
                      <td className="p-3">
                        <span
                          className={`badge-tag px-2 py-0.5 rounded border text-[10px] ${
                            t.status === 'Resolved' || t.status === 'Closed'
                              ? 'text-[#4DDBA7] border-[#4DDBA7]/30 bg-[#4DDBA7]/10'
                              : t.status === 'In Progress'
                              ? 'text-[#00F0FF] border-[#00F0FF]/30 bg-[#00F0FF]/10'
                              : 'text-[#FFB84D] border-[#FFB84D]/30 bg-[#FFB84D]/10'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-[#F5F5F7]">
                        {t.assignee_name || (
                          <span className="text-[#FF4D6D] font-mono text-[10px]">UNASSIGNED</span>
                        )}
                      </td>
                      <td className="p-3 text-[#9292A3] font-mono text-[11px]">
                        {new Date(t.updated_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
