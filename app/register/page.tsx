'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, UserPlus, ArrowLeft, AlertTriangle } from 'lucide-react';
import { UserRole } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('FACILITY_MANAGER');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          confirm_password: confirmPassword,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Failed to connect to authentication server.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 rounded-xl bg-[#0D0D12] border border-[#00F0FF]/40 mb-2">
            <ShieldAlert className="w-7 h-7 text-[#00F0FF]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F5F5F7]">CREATE AN OPERATOR ACCOUNT</h1>
          <p className="text-xs text-[#9292A3] font-mono">ENTERPRISE WARRANTY HUB ACCESS</p>
        </div>

        {/* Academic Warning Note */}
        <div className="p-3.5 rounded bg-[#FFB84D]/10 border border-[#FFB84D]/30 flex items-start gap-2.5 text-xs text-[#FFB84D]">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold">Academic Demonstration Notice:</span> Open role self-selection is enabled for local evaluation and grading purposes. Production deployments restrict role assignment to administrative authorization.
          </p>
        </div>

        {/* Registration form */}
        <div className="bg-[#0D0D12] border border-[#252530] rounded-lg p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 rounded bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 text-xs text-[#FF4D6D]">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-[#9292A3] mb-1 uppercase">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] focus:outline-none rounded px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#5F5F70]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#9292A3] mb-1 uppercase">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.demo"
                className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] focus:outline-none rounded px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#5F5F70]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#9292A3] mb-1 uppercase">
                Select Platform Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] focus:outline-none rounded px-3 py-2 text-xs text-[#F5F5F7]"
              >
                <option value="FACILITY_MANAGER">Facility Manager (Full Operational Oversight)</option>
                <option value="TECHNICIAN">Technician (Equipment & Assigned Tickets)</option>
                <option value="VENDOR">Vendor (Assigned Specialist Tickets Only)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-[#9292A3] mb-1 uppercase">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 chars"
                  className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] focus:outline-none rounded px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#5F5F70]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#9292A3] mb-1 uppercase">Confirm</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] focus:outline-none rounded px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#5F5F70]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded bg-[#00F0FF] hover:bg-[#00d0e0] text-black font-semibold text-xs transition-colors mt-2"
            >
              {loading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Complete Registration</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#252530] text-center text-xs">
            <Link
              href="/login"
              className="text-[#9292A3] hover:text-[#00F0FF] inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
