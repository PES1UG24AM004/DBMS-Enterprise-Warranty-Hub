'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';
import { TICKET_STATUSES, TicketStatus } from '@/lib/types';

function TicketsContent() {
  const searchParams = useSearchParams();
  const preselectId = searchParams.get('select');
  const openNewForm = searchParams.get('new') === 'true';

  const [tickets, setTickets] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Inline forms
  const [showCreateForm, setShowCreateForm] = useState(openNewForm);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [updateStatus, setUpdateStatus] = useState<TicketStatus>('In Progress');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [reassigneeId, setReassigneeId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New ticket form data
  const [newTicket, setNewTicket] = useState({
    asset_id: '',
    title: '',
    description: '',
    assignee_user_id: '',
  });

  const fetchData = async () => {
    try {
      const [tRes, aRes, meRes, uRes] = await Promise.all([
        fetch('/api/tickets'),
        fetch('/api/assets'),
        fetch('/api/auth/me'),
        fetch('/api/users'),
      ]);

      const tData = await tRes.json();
      const aData = await aRes.json();
      const meData = await meRes.json();
      const uData = uRes.ok ? await uRes.json() : { users: [] };

      if (tData.tickets) {
        setTickets(tData.tickets);
        if (preselectId) {
          const found = tData.tickets.find((t: any) => t.id === preselectId);
          if (found) {
            setSelectedTicket(found);
            setUpdateStatus(found.status);
            setResolutionNotes(found.resolution_notes || '');
            setReassigneeId(found.assignee_user_id || '');
          }
        }
      }
      if (aData.assets) setAssets(aData.assets);
      if (meData.user) setSession(meData.user);
      if (uData.users) {
        // Only Technicians and Vendors can be assigned tickets
        setSpecialists(
          uData.users.filter(
            (u: any) =>
              (u.role === 'TECHNICIAN' || u.role === 'VENDOR') && u.is_active
          )
        );
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [preselectId]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionMessage(null);

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionMessage(`Error: ${data.error}`);
        setSubmitting(false);
        return;
      }

      setShowCreateForm(false);
      setNewTicket({ asset_id: '', title: '', description: '', assignee_user_id: '' });
      setActionMessage('Ticket created and assigned successfully.');
      fetchData();
    } catch {
      setActionMessage('Network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSubmitting(true);
    setActionMessage(null);

    try {
      const payload: any = {
        status: updateStatus,
        resolution_notes: resolutionNotes,
      };

      if (session?.role === 'FACILITY_MANAGER') {
        payload.assignee_user_id = reassigneeId || null;
      }

      const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionMessage(`Error: ${data.error}`);
        setSubmitting(false);
        return;
      }

      setActionMessage(
        updateStatus === 'Resolved'
          ? '✔ Ticket marked Resolved! Historical repair record and 384-dim pgvector embedding created automatically.'
          : '✔ Ticket status updated successfully.'
      );
      fetchData();
    } catch {
      setActionMessage('Failed to update ticket status.');
    } finally {
      setSubmitting(false);
    }
  };

  const isManager = session?.role === 'FACILITY_MANAGER';

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticket_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.asset_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252530] pb-4">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-[#00F0FF] uppercase">
              WORK ORDER MANAGEMENT
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#F5F5F7]">
              Maintenance Tickets
            </h1>
            <p className="text-xs text-[#9292A3] mt-0.5">
              Strict 6-stage lifecycle: Reported → Assigned → Acknowledged → In Progress → Resolved → Closed
            </p>
          </div>

          {isManager && (
            <button
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setSelectedTicket(null);
                setActionMessage(null);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#00F0FF] hover:bg-[#00d0e0] text-black font-semibold text-xs transition-colors self-start sm:self-auto"
            >
              {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{showCreateForm ? 'Cancel Creation' : 'Open Maintenance Ticket'}</span>
            </button>
          )}
        </div>

        {actionMessage && (
          <div className="p-3 rounded bg-[#12121A] border border-[#00F0FF]/40 text-xs font-mono text-[#00F0FF]">
            {actionMessage}
          </div>
        )}

        {/* INLINE CREATE TICKET (Facility Manager only) */}
        {showCreateForm && isManager && (
          <div className="p-5 rounded-lg bg-[#08080D] border border-[#00F0FF]/40 space-y-4">
            <div className="flex items-center justify-between border-b border-[#252530] pb-2">
              <span className="text-xs font-mono text-[#00F0FF] uppercase">
                Create New Maintenance Work Order
              </span>
              <span className="text-[10px] text-[#9292A3] font-mono">
                Sends automated in-app notification upon assignment
              </span>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#9292A3] mb-1">
                    TARGET EQUIPMENT ASSET *
                  </label>
                  <select
                    required
                    value={newTicket.asset_id}
                    onChange={(e) => setNewTicket({ ...newTicket, asset_id: e.target.value })}
                    className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                  >
                    <option value="">Select equipment asset...</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        [{a.asset_tag}] {a.name} ({a.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#9292A3] mb-1">
                    ASSIGN SPECIALIST (OPTIONAL)
                  </label>
                  <select
                    value={newTicket.assignee_user_id}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, assignee_user_id: e.target.value })
                    }
                    className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                  >
                    <option value="">Unassigned (Status: Reported)</option>
                    {specialists.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} — {s.role} ({s.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#9292A3] mb-1">
                  ISSUE TITLE / DEFECT SUMMARY *
                </label>
                <input
                  type="text"
                  required
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="e.g. Server AC secondary compressor tripped on high temperature limit"
                  className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#9292A3] mb-1">
                  DETAILED ISSUE DESCRIPTION *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Describe observed failure symptoms, fault codes, impact, and initial checks..."
                  className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-3 py-1.5 rounded bg-[#12121A] text-xs text-[#9292A3] hover:text-[#F5F5F7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded bg-[#00F0FF] hover:bg-[#00d0e0] text-black font-semibold text-xs"
                >
                  {submitting ? 'Creating Ticket...' : 'Dispatch Ticket'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* INLINE TICKET STATUS UPDATE & RESOLUTION PANEL */}
        {selectedTicket && (
          <div className="p-5 rounded-lg bg-[#08080D] border border-[#00F0FF] space-y-4">
            <div className="flex items-center justify-between border-b border-[#252530] pb-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-xs font-mono font-bold text-[#F5F5F7]">
                  UPDATE TICKET: [{selectedTicket.ticket_code}] {selectedTicket.title}
                </span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-xs text-[#9292A3] hover:text-[#F5F5F7]"
              >
                Close Panel
              </button>
            </div>

            <div className="p-3 rounded bg-[#0D0D12] border border-[#252530] text-xs space-y-1">
              <div className="text-[#9292A3]">
                <strong className="text-[#F5F5F7]">Asset:</strong> {selectedTicket.asset_name} (
                {selectedTicket.asset_tag}) • <strong className="text-[#F5F5F7]">Current Status:</strong>{' '}
                <span className="text-[#00F0FF] font-mono">{selectedTicket.status}</span>
              </div>
              <div className="text-[#9292A3]">
                <strong className="text-[#F5F5F7]">Reported Issue:</strong> {selectedTicket.description}
              </div>
            </div>

            <form onSubmit={handleUpdateTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#9292A3] mb-1">
                    NEW WORKFLOW STATUS *
                  </label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value as TicketStatus)}
                    className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                  >
                    {/* Status permissions */}
                    {isManager ? (
                      TICKET_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Acknowledged">Acknowledged (Specialist taking ownership)</option>
                        <option value="In Progress">In Progress (Active repairs/diagnostics)</option>
                        <option value="Resolved">Resolved (Repairs tested and complete)</option>
                      </>
                    )}
                  </select>
                </div>

                {isManager && (
                  <div>
                    <label className="block text-[11px] font-mono text-[#9292A3] mb-1">
                      REASSIGN SPECIALIST
                    </label>
                    <select
                      value={reassigneeId}
                      onChange={(e) => setReassigneeId(e.target.value)}
                      className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                    >
                      <option value="">Unassigned</option>
                      {specialists.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name} ({s.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#9292A3] mb-1">
                  RESOLUTION NOTES / ACTION SUMMARY (REQUIRED WHEN RESOLVED)
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Document actions performed, replaced parts, testing verifications, and root cause analysis..."
                  className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                ></textarea>
                {updateStatus === 'Resolved' && (
                  <p className="text-[10px] text-[#00F0FF] font-mono mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#00F0FF]" />
                    Marking as Resolved will automatically trigger local 384-dim embedding generation and store this in maintenance_records for semantic vector search!
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-3 py-1.5 rounded bg-[#12121A] text-xs text-[#9292A3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded bg-[#00F0FF] hover:bg-[#00d0e0] text-black font-semibold text-xs"
                >
                  {submitting ? 'Saving...' : 'Save & Update'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#08080D] p-3 rounded-lg border border-[#252530]">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-[#9292A3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ticket code, title, or asset..."
              className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded pl-8 pr-3 py-1.5 text-xs text-[#F5F5F7] placeholder-[#5F5F70]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-mono text-[#9292A3] uppercase shrink-0">Stage:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7] w-full sm:w-auto"
            >
              <option value="ALL">All 6 Stages</option>
              {TICKET_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-[#08080D] border border-[#252530] rounded-lg overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-[#9292A3]">
              LOADING WORK ORDERS FROM POSTGRESQL...
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0D0D12] text-[#9292A3] font-mono border-b border-[#252530]">
                <tr>
                  <th className="p-3">Ticket</th>
                  <th className="p-3">Equipment Asset</th>
                  <th className="p-3">Issue Title & Scope</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Assignee</th>
                  <th className="p-3">Last Updated</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252530]">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#9292A3]">
                      No maintenance tickets found.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-[#12121A]/50 transition-colors">
                      <td className="p-3 font-mono text-[#00F0FF] font-medium">{t.ticket_code}</td>
                      <td className="p-3">
                        <div className="font-semibold text-[#F5F5F7]">{t.asset_name}</div>
                        <div className="text-[10px] text-[#9292A3] font-mono">{t.asset_tag}</div>
                      </td>
                      <td className="p-3 max-w-sm">
                        <div className="font-medium text-[#F5F5F7] truncate">{t.title}</div>
                        <div className="text-[10px] text-[#9292A3] line-clamp-1">{t.description}</div>
                        {t.resolution_notes && (
                          <div className="text-[10px] text-[#4DDBA7] line-clamp-1 mt-0.5">
                            Notes: {t.resolution_notes}
                          </div>
                        )}
                      </td>
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
                      <td className="p-3">
                        {t.assignee_name ? (
                          <div>
                            <span className="font-medium text-[#F5F5F7]">{t.assignee_name}</span>
                            <span className="block text-[9px] text-[#9292A3] font-mono">
                              {t.assignee_role}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#FF4D6D] font-mono text-[10px]">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3 text-[#9292A3] font-mono text-[11px]">
                        {new Date(t.updated_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedTicket(t);
                            setUpdateStatus(t.status);
                            setResolutionNotes(t.resolution_notes || '');
                            setReassigneeId(t.assignee_user_id || '');
                            setShowCreateForm(false);
                            setActionMessage(null);
                          }}
                          className="px-2.5 py-1 rounded bg-[#12121A] hover:bg-[#181824] border border-[#252530] text-[#00F0FF] hover:border-[#00F0FF]/50 text-xs"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function TicketsPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="py-20 flex items-center justify-center text-[#9292A3]">
            <div className="flex items-center gap-2 font-mono text-xs">
              <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse"></div>
              <span>LOADING WORK ORDERS...</span>
            </div>
          </div>
        </AppShell>
      }
    >
      <TicketsContent />
    </Suspense>
  );
}
