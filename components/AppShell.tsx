'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Box,
  ShieldCheck,
  Wrench,
  Search,
  Bell,
  User,
  Users,
  Database,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { UserSession } from '@/lib/types';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          // Fetch notifications count
          fetch('/api/notifications')
            .then((r) => r.json())
            .then((ndata) => {
              if (ndata?.unread_count !== undefined) {
                setUnreadCount(ndata.unread_count);
              }
            })
            .catch(() => {});
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error(err);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-[#9292A3]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse"></div>
          <span className="font-mono text-sm tracking-widest uppercase">EWH INITIALIZING...</span>
        </div>
      </div>
    );
  }

  const roleLabel =
    user?.role === 'FACILITY_MANAGER'
      ? 'Facility Director'
      : user?.role === 'TECHNICIAN'
      ? 'Technician'
      : 'Vendor Specialist';

  const roleColor =
    user?.role === 'FACILITY_MANAGER'
      ? 'text-[#00F0FF] border-[#00F0FF]/30 bg-[#00F0FF]/10'
      : user?.role === 'TECHNICIAN'
      ? 'text-[#4DDBA7] border-[#4DDBA7]/30 bg-[#4DDBA7]/10'
      : 'text-[#FFB84D] border-[#FFB84D]/30 bg-[#FFB84D]/10';

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/assets', label: 'Assets', icon: Box },
    { href: '/warranties', label: 'Warranties', icon: ShieldCheck },
    { href: '/tickets', label: 'Maintenance Tickets', icon: Wrench },
    { href: '/troubleshoot', label: 'Troubleshooting (pgvector)', icon: Search },
    {
      href: '/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { href: '/profile', label: 'Profile & Settings', icon: User },
  ];

  const managerNavItems = [
    { href: '/team', label: 'Team Accounts', icon: Users },
    { href: '/dbms-demo', label: 'DBMS Demonstration', icon: Database, highlight: true },
  ];

  return (
    <div className="min-h-screen bg-black flex text-[#F5F5F7]">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } bg-[#08080D] border-r border-[#252530] flex flex-col justify-between shrink-0 select-none duration-100 z-30`}
      >
        <div>
          {/* Logo & Header */}
          <div className="h-16 px-4 border-b border-[#252530] flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded bg-[#12121A] border border-[#00F0FF]/60 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                <ShieldAlert className="w-5 h-5 text-[#00F0FF]" />
              </div>
              {!collapsed && (
                <div className="truncate">
                  <div className="font-bold tracking-tight text-sm text-[#F5F5F7]">EWH OPERATIONS</div>
                  <div className="text-[10px] text-[#00F0FF] font-mono tracking-widest">ENTERPRISE HUB</div>
                </div>
              )}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-[#9292A3] hover:text-[#00F0FF] p-1 rounded hover:bg-[#12121A]"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* User profile snippet */}
          {!collapsed && user && (
            <div className="px-4 py-3 border-b border-[#252530]/60 bg-[#0D0D12]">
              <div className="text-xs text-[#F5F5F7] font-medium truncate">{user.full_name}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`badge-tag px-2 py-0.5 rounded border text-[10px] ${roleColor}`}>
                  {roleLabel}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className={`px-3 py-1.5 text-[10px] font-mono tracking-wider text-[#9292A3] uppercase ${collapsed ? 'text-center' : ''}`}>
              {collapsed ? '•' : 'Navigation'}
            </div>
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#12121A] text-[#00F0FF] border border-[#00F0FF]/50 shadow-[0_0_8px_rgba(0,240,255,0.15)]'
                      : 'text-[#9292A3] hover:text-[#F5F5F7] hover:bg-[#12121A]/70 border border-transparent'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#00F0FF]' : 'text-[#9292A3]'}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {item.badge !== undefined && (
                    <span
                      className={`ml-auto font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                        collapsed ? 'absolute top-1 right-1' : ''
                      } bg-[#FF3D81] text-white font-bold`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Manager specific section */}
            {user?.role === 'FACILITY_MANAGER' && (
              <>
                <div className={`pt-4 px-3 py-1.5 text-[10px] font-mono tracking-wider text-[#9292A3] uppercase ${collapsed ? 'text-center' : ''}`}>
                  {collapsed ? '•' : 'Manager Ops'}
                </div>
                {managerNavItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[#12121A] text-[#00F0FF] border border-[#00F0FF]/50 shadow-[0_0_8px_rgba(0,240,255,0.15)]'
                          : item.highlight
                          ? 'text-[#B88AFF] hover:bg-[#12121A]/70 border border-[#B88AFF]/20'
                          : 'text-[#9292A3] hover:text-[#F5F5F7] hover:bg-[#12121A]/70 border border-transparent'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active ? 'text-[#00F0FF]' : item.highlight ? 'text-[#B88AFF]' : 'text-[#9292A3]'
                        }`}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-[#252530]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium text-[#FF4D6D] hover:bg-[#FF4D6D]/10 hover:border-[#FF4D6D]/30 border border-transparent transition-colors"
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-black overflow-y-auto">
        {/* Top Operational Bar */}
        <header className="h-16 px-6 border-b border-[#252530] flex items-center justify-between bg-[#08080D]/80 backdrop-blur sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#9292A3]">NODE:</span>
            <span className="font-mono text-xs text-[#00F0FF] bg-[#12121A] px-2 py-0.5 rounded border border-[#252530]">
              POSTGRESQL + PGVECTOR (384-DIM)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/troubleshoot"
              className="text-xs text-[#9292A3] hover:text-[#00F0FF] flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#12121A] border border-[#252530]"
            >
              <Search className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span className="hidden sm:inline">Semantic Troubleshooting</span>
            </Link>
            <Link
              href="/notifications"
              className="relative p-2 rounded bg-[#12121A] border border-[#252530] text-[#9292A3] hover:text-[#F5F5F7]"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF3D81] text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Page Inner Container */}
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
