'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { Users, UserCheck, UserX, Shield, Mail, Calendar, CheckCircle2 } from 'lucide-react';

export default function TeamPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = () => {
    fetch('/api/users')
      .then((res) => {
        if (!res.ok) throw new Error('Facility Managers only.');
        return res.json();
      })
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update user status.');
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u))
      );
    } catch {
      alert('Error updating user status.');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-[#252530] pb-4">
          <div className="text-[11px] font-mono tracking-widest text-[#00F0FF] uppercase">
            ADMINISTRATION • ACCESS CONTROL
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F5F5F7] mt-1">
            Team & User Account Management
          </h1>
          <p className="text-xs text-[#9292A3] mt-0.5">
            Facility Directors can activate or deactivate operator, technician, and vendor access credentials.
          </p>
        </div>

        {error ? (
          <div className="p-4 rounded bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 text-xs text-[#FF4D6D]">
            {error}
          </div>
        ) : (
          <div className="bg-[#08080D] border border-[#252530] rounded-lg overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-xs font-mono text-[#9292A3]">
                FETCHING USER ACCOUNTS FROM DATABASE...
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0D0D12] text-[#9292A3] font-mono border-b border-[#252530]">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created Date</th>
                    <th className="p-3 text-right">Access Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252530]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#12121A]/50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-[#F5F5F7]">{u.full_name}</div>
                        <div className="text-[10px] text-[#9292A3] font-mono">{u.id}</div>
                      </td>
                      <td className="p-3 font-mono text-[#F5F5F7]">{u.email}</td>
                      <td className="p-3">
                        <span
                          className={`badge-tag px-2 py-0.5 rounded border text-[10px] ${
                            u.role === 'FACILITY_MANAGER'
                              ? 'text-[#00F0FF] border-[#00F0FF]/30 bg-[#00F0FF]/10'
                              : u.role === 'TECHNICIAN'
                              ? 'text-[#4DDBA7] border-[#4DDBA7]/30 bg-[#4DDBA7]/10'
                              : 'text-[#FFB84D] border-[#FFB84D]/30 bg-[#FFB84D]/10'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        {u.is_active ? (
                          <span className="badge-tag px-2 py-0.5 rounded border border-[#4DDBA7]/30 bg-[#4DDBA7]/10 text-[#4DDBA7]">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="badge-tag px-2 py-0.5 rounded border border-[#FF4D6D]/30 bg-[#FF4D6D]/10 text-[#FF4D6D]">
                            DEACTIVATED
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-[#9292A3] font-mono text-[11px]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => toggleStatus(u.id, u.is_active)}
                          className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                            u.is_active
                              ? 'bg-[#12121A] hover:bg-[#FF4D6D]/20 text-[#FF4D6D] border-[#252530] hover:border-[#FF4D6D]/50'
                              : 'bg-[#12121A] hover:bg-[#4DDBA7]/20 text-[#4DDBA7] border-[#252530] hover:border-[#4DDBA7]/50'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
