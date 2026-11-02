'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import {
  Box,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Building,
  RefreshCw,
  X,
} from 'lucide-react';
import { ASSET_CATEGORIES, AssetCategory } from '@/lib/types';

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // New asset form data
  const [formData, setFormData] = useState({
    name: '',
    category: ASSET_CATEGORIES[0] as AssetCategory,
    manufacturer: '',
    model: '',
    serial_number: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: '',
    supplier_name: '',
    location: '',
    department: '',
    assigned_to_user_id: '',
    warranty_provider: '',
    warranty_start_date: new Date().toISOString().split('T')[0],
    warranty_end_date: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
  });

  const fetchData = async () => {
    try {
      const [assetsRes, meRes, usersRes] = await Promise.all([
        fetch('/api/assets'),
        fetch('/api/auth/me'),
        fetch('/api/users'),
      ]);

      const aData = await assetsRes.json();
      const meData = await meRes.json();
      const uData = usersRes.ok ? await usersRes.json() : { users: [] };

      if (aData.assets) setAssets(aData.assets);
      if (meData.user) setSession(meData.user);
      if (uData.users) setUsers(uData.users);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create asset');
        setSubmitting(false);
        return;
      }

      setShowCreateForm(false);
      setFormData({
        name: '',
        category: ASSET_CATEGORIES[0],
        manufacturer: '',
        model: '',
        serial_number: '',
        purchase_date: new Date().toISOString().split('T')[0],
        purchase_price: '',
        supplier_name: '',
        location: '',
        department: '',
        assigned_to_user_id: '',
        warranty_provider: '',
        warranty_start_date: new Date().toISOString().split('T')[0],
        warranty_end_date: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      });
      fetchData();
    } catch {
      setFormError('Connection error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReassignTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setTransactionStatus(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/assets/${selectedAsset.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_assignee_id: assigneeId || null,
          simulate_failure: simulateFailure,
        }),
      });

      const data = await res.json();
      setTransactionStatus(data);
      if (res.ok) {
        fetchData();
      }
    } catch (err: any) {
      setTransactionStatus({ success: false, error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.asset_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.serial_number && a.serial_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.location && a.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = selectedCategory === 'ALL' || a.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const isManager = session?.role === 'FACILITY_MANAGER';

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252530] pb-4">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-[#00F0FF] uppercase">
              EQUIPMENT REGISTRY
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#F5F5F7]">
              Asset Inventory & Custody
            </h1>
            <p className="text-xs text-[#9292A3] mt-0.5">
              {session?.role === 'VENDOR'
                ? 'Displaying equipment assets connected to tickets assigned to your company.'
                : 'Centralized registry of company electronics, appliances, and serial devices.'}
            </p>
          </div>

          {isManager && (
            <button
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setSelectedAsset(null);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#00F0FF] hover:bg-[#00d0e0] text-black font-semibold text-xs transition-colors self-start sm:self-auto"
            >
              {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{showCreateForm ? 'Cancel Form' : 'Register New Asset'}</span>
            </button>
          )}
        </div>

        {/* INLINE CREATE ASSET FORM (Facility Manager only) */}
        {showCreateForm && isManager && (
          <div className="p-5 rounded-lg bg-[#08080D] border border-[#00F0FF]/40 space-y-4">
            <div className="flex items-center justify-between border-b border-[#252530] pb-2">
              <span className="text-xs font-mono text-[#00F0FF] uppercase">
                New Equipment Registration Form
              </span>
              <span className="text-[10px] text-[#9292A3] font-mono">
                ACID Transaction (Asset + Warranty Entry)
              </span>
            </div>

            {formError && (
              <div className="p-3 rounded bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 text-xs text-[#FF4D6D]">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#9292A3] mb-1">ASSET NAME *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dell PowerEdge Server R750"
                    className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#9292A3] mb-1">
                    CATEGORY (FIXED LIST) *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as AssetCategory })
                    }
                    className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                  >
                    {ASSET_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#9292A3] mb-1">MANUFACTURER *</label>
                  <input
                    type="text"
                    required
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g. Dell, Daikin, HP"
                    className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#9292A3] mb-1">MODEL *</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. R750xs"
                    className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#9292A3] mb-1">SERIAL NUMBER</label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    placeholder="e.g. SN-883921-X"
                    className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#9292A3] mb-1">PURCHASE DATE *</label>
                  <input
                    type="date"
                    required
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#9292A3] mb-1">
                    PURCHASE PRICE ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    placeholder="e.g. 2499.00"
                    className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#9292A3] mb-1">SUPPLIER NAME *</label>
                  <input
                    type="text"
                    required
                    value={formData.supplier_name}
                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                    placeholder="e.g. Dell Commercial"
                    className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#9292A3] mb-1">LOCATION / ROOM</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Server Room B-12"
                    className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#9292A3] mb-1">DEPARTMENT</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Infrastructure"
                    className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#9292A3] mb-1">
                    INITIAL ASSIGNEE
                  </label>
                  <select
                    value={formData.assigned_to_user_id}
                    onChange={(e) =>
                      setFormData({ ...formData, assigned_to_user_id: e.target.value })
                    }
                    className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Warranty sub-section */}
              <div className="p-3 rounded bg-[#0D0D12] border border-[#252530] space-y-2">
                <span className="text-[11px] font-mono text-[#B88AFF] uppercase">
                  Warranty Coverage Details
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-[#9292A3] mb-1">
                      WARRANTY PROVIDER
                    </label>
                    <input
                      type="text"
                      value={formData.warranty_provider}
                      onChange={(e) => setFormData({ ...formData, warranty_provider: e.target.value })}
                      placeholder="e.g. ProSupport Plus Onsite"
                      className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#9292A3] mb-1">START DATE</label>
                    <input
                      type="date"
                      value={formData.warranty_start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, warranty_start_date: e.target.value })
                      }
                      className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#9292A3] mb-1">END DATE</label>
                    <input
                      type="date"
                      value={formData.warranty_end_date}
                      onChange={(e) => setFormData({ ...formData, warranty_end_date: e.target.value })}
                      className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
                  {submitting ? 'Writing to PostgreSQL...' : 'Create Asset'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* INLINE ASSET REASSIGNMENT / TRANSACTION MODAL-LESS PANEL */}
        {selectedAsset && isManager && (
          <div className="p-5 rounded-lg bg-[#08080D] border border-[#00F0FF] space-y-4">
            <div className="flex items-center justify-between border-b border-[#252530] pb-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-xs font-mono font-bold text-[#F5F5F7]">
                  TRANSACTION DEMONSTRATION: Reassign Asset [{selectedAsset.asset_tag}]
                </span>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-xs text-[#9292A3] hover:text-[#F5F5F7]"
              >
                Close Panel
              </button>
            </div>

            <div className="text-xs text-[#9292A3] leading-relaxed">
              Demonstrates atomic database transaction: updates <code className="text-[#00F0FF]">assets.assigned_to_user_id</code> and inserts audit row into <code className="text-[#00F0FF]">asset_maintenance_ledger</code> inside a single <code className="text-[#00F0FF]">BEGIN ... COMMIT</code> block.
            </div>

            <form onSubmit={handleReassignTransaction} className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-[11px] font-mono text-[#9292A3] mb-1">
                  CURRENT ASSIGNEE: <span className="text-[#F5F5F7]">{selectedAsset.assigned_to_name || 'Unassigned'}</span>
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7]"
                >
                  <option value="">De-assign (Mark Unallocated)</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="fail-toggle"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="rounded border-[#252530] bg-[#12121A] text-[#FF4D6D] focus:ring-0"
                />
                <label htmlFor="fail-toggle" className="text-xs text-[#FF4D6D] font-mono select-none cursor-pointer">
                  Simulate Failure (Demonstrate ROLLBACK)
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded bg-[#00F0FF] hover:bg-[#00d0e0] text-black font-semibold text-xs whitespace-nowrap"
              >
                {submitting ? 'Executing Transaction...' : 'Commit Transaction'}
              </button>
            </form>

            {transactionStatus && (
              <div
                className={`p-3 rounded text-xs font-mono border ${
                  transactionStatus.success
                    ? 'bg-[#4DDBA7]/10 border-[#4DDBA7]/40 text-[#4DDBA7]'
                    : 'bg-[#FF4D6D]/10 border-[#FF4D6D]/40 text-[#FF4D6D]'
                }`}
              >
                {transactionStatus.success ? (
                  <div>
                    <div className="font-bold">✔ TRANSACTION COMMITTED SUCCESSFULLY</div>
                    <div className="text-[11px] mt-1 text-[#F5F5F7]">
                      Ledger ID: {transactionStatus.transaction?.ledger_entry_id}
                    </div>
                    <div className="text-[11px] text-[#9292A3]">
                      New Assignee: {transactionStatus.transaction?.new_assignee_name} | Timestamp:{' '}
                      {new Date(transactionStatus.transaction?.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-bold">✘ TRANSACTION ROLLED BACK (ACID ATOMICITY PRESERVED)</div>
                    <div className="text-[11px] mt-1 text-[#F5F5F7]">
                      Error: {transactionStatus.error}
                    </div>
                    <div className="text-[10px] text-[#9292A3] mt-0.5">
                      No changes were written to the asset or ledger tables.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#08080D] p-3 rounded-lg border border-[#252530]">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-[#9292A3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by asset name, tag, SN, room..."
              className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded pl-8 pr-3 py-1.5 text-xs text-[#F5F5F7] placeholder-[#5F5F70]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-mono text-[#9292A3] uppercase shrink-0">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] rounded px-3 py-1.5 text-xs text-[#F5F5F7] w-full sm:w-auto"
            >
              <option value="ALL">All 8 Equipment Categories</option>
              {ASSET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assets Data Table */}
        <div className="bg-[#08080D] border border-[#252530] rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D0D12] text-[#9292A3] font-mono border-b border-[#252530]">
              <tr>
                <th className="p-3">Asset Tag</th>
                <th className="p-3">Equipment Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Location</th>
                <th className="p-3">Assignee</th>
                <th className="p-3">Warranty</th>
                {isManager && <th className="p-3 text-right">Transaction</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252530]">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#9292A3]">
                    No equipment assets found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((a) => (
                  <tr key={a.id} className="hover:bg-[#12121A]/50 transition-colors">
                    <td className="p-3 font-mono text-[#00F0FF] font-medium">{a.asset_tag}</td>
                    <td className="p-3">
                      <div className="font-semibold text-[#F5F5F7]">{a.name}</div>
                      <div className="text-[10px] text-[#9292A3] font-mono">
                        {a.manufacturer} • Model: {a.model}
                        {a.serial_number ? ` • SN: ${a.serial_number}` : ''}
                      </div>
                    </td>
                    <td className="p-3 text-[#9292A3]">{a.category}</td>
                    <td className="p-3 text-[#F5F5F7]">{a.location || '—'}</td>
                    <td className="p-3">
                      {a.assigned_to_name ? (
                        <span className="text-[#F5F5F7] font-medium">{a.assigned_to_name}</span>
                      ) : (
                        <span className="text-[#5F5F70] font-mono text-[10px]">Unallocated</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`badge-tag px-2 py-0.5 rounded border text-[10px] ${
                          a.warranty_status === 'ACTIVE'
                            ? 'text-[#4DDBA7] border-[#4DDBA7]/30 bg-[#4DDBA7]/10'
                            : a.warranty_status === 'EXPIRING_SOON'
                            ? 'text-[#FFB84D] border-[#FFB84D]/30 bg-[#FFB84D]/10'
                            : 'text-[#FF4D6D] border-[#FF4D6D]/30 bg-[#FF4D6D]/10'
                        }`}
                      >
                        {a.warranty_status === 'EXPIRING_SOON'
                          ? `EXPIRING (${a.days_remaining}d)`
                          : a.warranty_status}
                      </span>
                    </td>
                    {isManager && (
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedAsset(a);
                            setAssigneeId(a.assigned_to_user_id || '');
                            setTransactionStatus(null);
                            setShowCreateForm(false);
                          }}
                          className="px-2.5 py-1 rounded bg-[#12121A] hover:bg-[#181824] border border-[#252530] text-[#00F0FF] hover:border-[#00F0FF]/50 text-xs"
                        >
                          Reassign
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
