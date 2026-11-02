'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { ShieldCheck, ShieldAlert, AlertTriangle, Filter, Search, Calendar, Clock } from 'lucide-react';

export default function WarrantiesPage() {
  const [warranties, setWarranties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchWarranties = (filter: string) => {
    setLoading(true);
    fetch(`/api/warranties?filter=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        setWarranties(data.warranties || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWarranties(activeFilter);
  }, [activeFilter]);

  const filtered = warranties.filter(
    (w) =>
      w.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.asset_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.warranty_provider && w.warranty_provider.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string, days: number | null) => {
    if (status === 'ACTIVE') {
      return (
        <span className="badge-tag px-2 py-0.5 rounded border border-[#4DDBA7]/30 bg-[#4DDBA7]/10 text-[#4DDBA7]">
          ACTIVE ({days}d remaining)
        </span>
      );
    }
    if (status === 'EXPIRING_SOON') {
      return (
        <span className="badge-tag px-2 py-0.5 rounded border border-[#FFB84D]/30 bg-[#FFB84D]/10 text-[#FFB84D] font-bold">
          EXPIRING IN {days} DAYS
        </span>
      );
    }
    return (
      <span className="badge-tag px-2 py-0.5 rounded border border-[#FF4D6D]/30 bg-[#FF4D6D]/10 text-[#FF4D6D] font-bold">
        EXPIRED ({Math.abs(days || 0)}d AGO)
      </span>
    );
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252530] pb-4">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-[#00F0FF] uppercase">
              SQL VIEW: asset_warranty_status
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#F5F5F7]">
              Warranty Expiration Tracker
            </h1>
            <p className="text-xs text-[#9292A3] mt-0.5">
              Live status derived dynamically from PostgreSQL date calculations relative to CURRENT_DATE.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#08080D] p-1 rounded-lg border border-[#252530] self-start sm:self-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[#12121A] text-[#00F0FF] border border-[#00F0FF]/50'
                  : 'text-[#9292A3] hover:text-[#F5F5F7]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                activeFilter === 'active'
                  ? 'bg-[#12121A] text-[#4DDBA7] border border-[#4DDBA7]/50'
                  : 'text-[#9292A3] hover:text-[#F5F5F7]'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveFilter('expiring')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                activeFilter === 'expiring'
                  ? 'bg-[#12121A] text-[#FFB84D] border border-[#FFB84D]/50'
                  : 'text-[#9292A3] hover:text-[#F5F5F7]'
              }`}
            >
              Expiring (30d)
            </button>
            <button
              onClick={() => setActiveFilter('expired')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                activeFilter === 'expired'
                  ? 'bg-[#12121A] text-[#FF4D6D] border border-[#FF4D6D]/50'
                  : 'text-[#9292A3] hover:text-[#F5F5F7]'
              }`}
            >
              Expired
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#9292A3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search equipment or warranty provider..."
            className="w-full bg-[#08080D] border border-[#252530] focus:border-[#00F0FF] rounded pl-8 pr-3 py-1.5 text-xs text-[#F5F5F7] placeholder-[#5F5F70]"
          />
        </div>

        {/* Warranties Table */}
        <div className="bg-[#08080D] border border-[#252530] rounded-lg overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-[#9292A3]">
              QUERYING POSTGRES VIEW asset_warranty_status...
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0D0D12] text-[#9292A3] font-mono border-b border-[#252530]">
                <tr>
                  <th className="p-3">Asset Tag</th>
                  <th className="p-3">Equipment</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Start Date</th>
                  <th className="p-3">End Date</th>
                  <th className="p-3">Derived Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252530]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#9292A3]">
                      No warranties found for filter: <span className="font-mono text-[#00F0FF]">{activeFilter}</span>
                    </td>
                  </tr>
                ) : (
                  filtered.map((w) => (
                    <tr key={w.asset_id} className="hover:bg-[#12121A]/50 transition-colors">
                      <td className="p-3 font-mono text-[#00F0FF] font-medium">{w.asset_tag}</td>
                      <td className="p-3">
                        <div className="font-semibold text-[#F5F5F7]">{w.asset_name}</div>
                        <div className="text-[10px] text-[#9292A3]">
                          {w.manufacturer} • {w.location || 'No location'}
                        </div>
                      </td>
                      <td className="p-3 text-[#9292A3]">{w.category}</td>
                      <td className="p-3 text-[#F5F5F7]">
                        {w.warranty_provider || <span className="text-[#5F5F70]">Unspecified</span>}
                      </td>
                      <td className="p-3 text-[#9292A3] font-mono text-[11px]">
                        {w.warranty_start_date ? new Date(w.warranty_start_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3 text-[#F5F5F7] font-mono text-[11px]">
                        {w.warranty_end_date ? new Date(w.warranty_end_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3">{getStatusBadge(w.warranty_status, w.days_remaining)}</td>
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
