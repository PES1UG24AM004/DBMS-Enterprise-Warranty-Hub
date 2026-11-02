'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { User, Mail, Shield, LogOut, Terminal, CheckCircle2 } from 'lucide-react';
import { UserSession } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <AppShell>
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div className="border-b border-[#252530] pb-4">
          <div className="text-[11px] font-mono tracking-widest text-[#00F0FF] uppercase">
            OPERATOR IDENTITY
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F5F5F7] mt-1">
            Profile & Session Details
          </h1>
          <p className="text-xs text-[#9292A3] mt-0.5">
            Active authenticated session verified against PostgreSQL <code className="text-[#00F0FF]">users</code> table.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-[#9292A3]">
            LOADING CREDENTIAL DATA...
          </div>
        ) : !user ? (
          <div className="text-xs text-[#FF4D6D]">No active session found.</div>
        ) : (
          <div className="bg-[#08080D] border border-[#252530] rounded-lg p-6 space-y-5">
            <div className="flex items-center gap-4 border-b border-[#252530] pb-5">
              <div className="w-12 h-12 rounded-lg bg-[#12121A] border border-[#00F0FF]/50 flex items-center justify-center text-[#00F0FF] font-bold text-lg font-mono">
                {user.full_name.charAt(0)}
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#F5F5F7]">{user.full_name}</h2>
                <div className="text-xs font-mono text-[#9292A3]">{user.email}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded bg-[#0D0D12] border border-[#252530] space-y-1">
                <span className="font-mono text-[#9292A3] text-[10px] uppercase block">
                  Assigned RBAC Role
                </span>
                <span className="text-[#00F0FF] font-semibold font-mono text-sm">
                  {user.role}
                </span>
              </div>

              <div className="p-3 rounded bg-[#0D0D12] border border-[#252530] space-y-1">
                <span className="font-mono text-[#9292A3] text-[10px] uppercase block">
                  PostgreSQL User ID
                </span>
                <span className="font-mono text-[11px] text-[#F5F5F7] truncate block">
                  {user.id}
                </span>
              </div>

              <div className="p-3 rounded bg-[#0D0D12] border border-[#252530] space-y-1">
                <span className="font-mono text-[#9292A3] text-[10px] uppercase block">
                  Session Token Scheme
                </span>
                <span className="font-mono text-[11px] text-[#4DDBA7]">
                  HttpOnly Secure Cookie (JWT HS256)
                </span>
              </div>

              <div className="p-3 rounded bg-[#0D0D12] border border-[#252530] space-y-1">
                <span className="font-mono text-[#9292A3] text-[10px] uppercase block">
                  Account Status
                </span>
                <span className="font-mono text-[11px] text-[#4DDBA7] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active In Database
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded bg-[#FF4D6D]/10 hover:bg-[#FF4D6D]/20 border border-[#FF4D6D]/30 text-[#FF4D6D] text-xs font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Terminate Session & Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
