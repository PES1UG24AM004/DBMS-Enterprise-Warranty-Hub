'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import {
  Bell,
  CheckCheck,
  Check,
  ShieldAlert,
  AlertTriangle,
  Wrench,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'POST' });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    if (type === 'WARRANTY_EXPIRED') {
      return <AlertTriangle className="w-4 h-4 text-[#FF4D6D] shrink-0" />;
    }
    if (type === 'WARRANTY_EXPIRING') {
      return <ShieldAlert className="w-4 h-4 text-[#FFB84D] shrink-0" />;
    }
    if (type === 'TICKET_ASSIGNED') {
      return <Wrench className="w-4 h-4 text-[#00F0FF] shrink-0" />;
    }
    return <Sparkles className="w-4 h-4 text-[#4DDBA7] shrink-0" />;
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252530] pb-4">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-[#00F0FF] uppercase">
              OPERATIONAL AUDIT & ALERTS
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#F5F5F7]">
              In-App Notifications
            </h1>
            <p className="text-xs text-[#9292A3] mt-0.5">
              Automated trigger alerts and ticket assignment notifications logged in PostgreSQL.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#12121A] hover:bg-[#181824] border border-[#252530] hover:border-[#00F0FF]/40 text-xs text-[#00F0FF] self-start sm:self-auto"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All As Read ({unreadCount})</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-[#08080D] border border-[#252530] rounded-lg divide-y divide-[#252530]">
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-[#9292A3]">
              FETCHING AUDIT NOTIFICATIONS...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#9292A3]">
              No notifications recorded for your user account.
            </div>
          ) : (
            notifications.map((n) => {
              const isUnread = !n.read_at;
              return (
                <div
                  key={n.id}
                  className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                    isUnread ? 'bg-[#0D0D12]' : 'hover:bg-[#12121A]/30 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded bg-[#12121A] border border-[#252530] mt-0.5">
                      {getIcon(n.type)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="badge-tag px-1.5 py-0.2 rounded border text-[9px] font-mono text-[#9292A3] border-[#252530] bg-[#12121A]">
                          {n.type}
                        </span>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]"></span>
                        )}
                        <span className="text-[10px] text-[#9292A3] font-mono">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs text-[#F5F5F7] font-medium leading-relaxed">
                        {n.message}
                      </p>

                      <div className="text-[10px] font-mono text-[#5F5F70]">
                        Key: {n.dedupe_key}
                      </div>
                    </div>
                  </div>

                  {isUnread && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="px-2.5 py-1 rounded bg-[#12121A] hover:bg-[#181824] border border-[#252530] text-[11px] text-[#9292A3] hover:text-[#00F0FF] shrink-0"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
