'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogIn, ArrowRight, ShieldCheck, Wrench, Building2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed.');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Unable to connect to service. Check database status.');
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo123!');
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: 'Demo123!' }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Demo login failed.');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Connection failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-[#0D0D12] border border-[#00F0FF]/40 shadow-[0_0_15px_rgba(0,240,255,0.15)] mb-2">
            <ShieldAlert className="w-8 h-8 text-[#00F0FF]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F7]">ENTERPRISE WARRANTY HUB</h1>
          <p className="text-xs text-[#9292A3] font-mono tracking-wider">
            DEMO-FIRST DBMS PLATFORM • POSTGRESQL + PGVECTOR
          </p>
        </div>

        {/* Demo Shortcut Quick Logins */}
        <div className="bg-[#08080D] border border-[#252530] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono tracking-wider text-[#9292A3] uppercase">
              1-Click Demo Logins
            </span>
            <span className="text-[10px] font-mono text-[#00F0FF]">PASSWORD: Demo123!</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('manager@ewh.demo')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2.5 rounded bg-[#0D0D12] border border-[#00F0FF]/40 hover:border-[#00F0FF] hover:bg-[#12121A] text-left transition-colors group"
            >
              <Building2 className="w-4 h-4 text-[#00F0FF] mb-1 group-hover:scale-105" />
              <span className="text-[11px] font-semibold text-[#F5F5F7]">Facility Dir.</span>
              <span className="text-[9px] text-[#9292A3] font-mono truncate">manager</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('technician@ewh.demo')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2.5 rounded bg-[#0D0D12] border border-[#4DDBA7]/40 hover:border-[#4DDBA7] hover:bg-[#12121A] text-left transition-colors group"
            >
              <Wrench className="w-4 h-4 text-[#4DDBA7] mb-1 group-hover:scale-105" />
              <span className="text-[11px] font-semibold text-[#F5F5F7]">Technician</span>
              <span className="text-[9px] text-[#9292A3] font-mono truncate">technician</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('vendor@ewh.demo')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2.5 rounded bg-[#0D0D12] border border-[#FFB84D]/40 hover:border-[#FFB84D] hover:bg-[#12121A] text-left transition-colors group"
            >
              <ShieldCheck className="w-4 h-4 text-[#FFB84D] mb-1 group-hover:scale-105" />
              <span className="text-[11px] font-semibold text-[#F5F5F7]">Vendor</span>
              <span className="text-[9px] text-[#9292A3] font-mono truncate">vendor</span>
            </button>
          </div>
        </div>

        {/* Standard credentials form */}
        <div className="bg-[#0D0D12] border border-[#252530] rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 text-xs text-[#FF4D6D]">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-[#9292A3] mb-1 uppercase">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@ewh.demo"
                className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] focus:outline-none rounded px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#5F5F70]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#9292A3] mb-1 uppercase">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] focus:outline-none rounded px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#5F5F70]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded bg-[#00F0FF] hover:bg-[#00d0e0] text-black font-semibold text-xs transition-colors"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#252530] flex items-center justify-between text-xs">
            <span className="text-[#9292A3]">New operator or technician?</span>
            <Link
              href="/register"
              className="text-[#00F0FF] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Register account</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Academic note */}
        <div className="text-center text-[11px] text-[#9292A3] font-mono">
          PES University • DBMS Course Project • Aarav Yuval B G (PES1UG24AM004)
        </div>
      </div>
    </div>
  );
}
