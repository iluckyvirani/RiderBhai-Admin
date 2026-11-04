import React, { useCallback, useEffect, useState } from 'react';
import { CreditCard, Search, Sparkles, Tag, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { api, getToken } from '../../lib/api';
import { formatUserId } from '../../lib/displayId';
import { AdminPageSkeleton } from '../common/AdminLoading';
import { EmptyState } from '../common/EmptyState';

export type SubscriberRow = {
  id: string;
  user_id: string;
  user_display_id?: string;
  user_name?: string;
  user_phone?: string;
  user_email?: string;
  plan_id: string;
  plan_name: string;
  price: number;
  duration_days: number;
  post_limit: number;
  posts_remaining: number;
  badge_text?: string;
  purchased_at: string;
  expires_at: string;
  payment_method?: string;
  txn_ref?: string;
  is_active?: boolean;
  auto_pay?: boolean;
};

function money(n: number) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

function when(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', { dateStyle: 'medium' });
}

export const PlanSubscribersView: React.FC<{ initialFilter?: 'all' | 'active' | 'autopay' | 'inactive' }> = ({
  initialFilter = 'all',
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'autopay' | 'inactive'>(initialFilter);
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const apiStatus = filter === 'autopay' ? 'all' : filter;
      const data = await api<SubscriberRow[]>(`/admin/subscribers?status=${apiStatus}`);
      setRows(data || []);
    } catch (err: any) {
      setError(err?.message || 'Could not load plan subscribers.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const q = search.trim().toLowerCase();
  const filtered = rows.filter((row) => {
    const live = row.is_active ?? new Date(row.expires_at).getTime() > Date.now();
    if (filter === 'active' && !live) return false;
    if (filter === 'inactive' && live) return false;
    if (filter === 'autopay' && !row.auto_pay) return false;

    if (!q) return true;
    const userId = (row.user_display_id || formatUserId(row.user_id)).toLowerCase();
    return (
      userId.includes(q) ||
      (row.user_name || '').toLowerCase().includes(q) ||
      (row.user_phone || '').includes(search.trim()) ||
      (row.user_email || '').toLowerCase().includes(q) ||
      row.plan_name.toLowerCase().includes(q) ||
      (row.txn_ref || '').toLowerCase().includes(q)
    );
  });

  const activeCount = rows.filter(
    (r) => (r.is_active ?? new Date(r.expires_at).getTime() > Date.now())
  ).length;
  const autoPayCount = rows.filter((r) => Boolean(r.auto_pay)).length;
  const expiredCount = rows.length - activeCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C1C1C] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#F15A24]" />
            Plan subscribers
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Active and expired plan subscriptions live from Neon.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-extrabold bg-[#EBF7EE] text-[#00A86B] px-3 py-1.5 rounded-2xl border border-[#BDE8C7] w-fit">
            {activeCount} active
          </span>
          <span className="text-xs font-extrabold bg-[#EBF7EE] text-[#00A86B] px-3 py-1.5 rounded-2xl border border-[#BDE8C7] w-fit flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse"></span>
            {autoPayCount} Auto-Pay ON
          </span>
          <span className="text-xs font-extrabold bg-[#FAF6EE] text-[#6B6B6B] px-3 py-1.5 rounded-2xl border border-[#EBE5D8] w-fit">
            {expiredCount} expired
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B6B6B]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search User ID (e.g. RB-US-1001), name, phone, email, plan, txn…"
            className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] text-xs font-bold"
          />
        </div>
        <div className="flex flex-wrap gap-1 bg-[#FAF6EE] p-1 rounded-2xl border border-[#EBE5D8]">
          {(['all', 'active', 'autopay', 'inactive'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                filter === key ? 'bg-[#1C1C1C] text-white shadow-xs' : 'text-[#6B6B6B] hover:text-[#1C1C1C]'
              }`}
            >
              {key === 'inactive' ? 'Inactive / Expired' : key === 'autopay' ? 'Auto-Pay ON' : key}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
      {loading && <AdminPageSkeleton variant="table" rows={6} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="No subscribers found"
          description={
            search
              ? 'No subscription matches this search.'
              : filter === 'active'
                ? 'No active subscriptions at the moment.'
                : filter === 'autopay'
                  ? 'No users with Auto-Pay enabled found.'
                  : 'No expired subscriptions found.'
          }
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border border-[#EBE5D8] bg-white">
          <table className="w-full text-left text-xs border-collapse min-w-[1020px]">
            <thead>
              <tr className="border-b border-[#EBE5D8] text-[#6B6B6B] uppercase font-bold text-[10px] tracking-wider bg-[#FAF6EE]/50">
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Subscriber</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Auto-Pay</th>
                <th className="py-3 px-4">Purchased</th>
                <th className="py-3 px-4">Expires</th>
                <th className="py-3 px-4">Posts Left</th>
                <th className="py-3 px-4">Razorpay / Txn ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE1]">
              {filtered.map((sub) => {
                const live = sub.is_active ?? new Date(sub.expires_at).getTime() > Date.now();
                return (
                  <tr key={sub.id} className="hover:bg-[#FFFDF9] transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-extrabold bg-white border border-[#EBE5D8] text-[#1C1C1C] shadow-2xs">
                        <Tag className="w-3 h-3 text-[#F15A24]" />
                        {sub.user_display_id || formatUserId(sub.user_id)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-[#1C1C1C]">{sub.user_name || 'Customer'}</p>
                      <p className="text-[11px] text-[#6B6B6B] truncate max-w-[180px]">{sub.user_email || '—'}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap text-[#1C1C1C]">
                      {sub.user_phone ? `+91 ${sub.user_phone}` : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-[#1C1C1C]">{sub.plan_name}</p>
                      {sub.badge_text && (
                        <span className="inline-flex text-[9px] font-extrabold text-[#F15A24] bg-[#FFF0EB] border border-[#FFD8CB] px-1.5 py-0.2 rounded-md">
                          {sub.badge_text}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#F15A24] whitespace-nowrap">
                      {money(sub.price)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          live
                            ? 'bg-[#EBF7EE] text-[#00A86B] border-[#BDE8C7]'
                            : 'bg-[#FAF6EE] text-[#8A8478] border-[#EBE5D8]'
                        }`}
                      >
                        {live ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {live ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {sub.auto_pay ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#EBF7EE] text-[#00A86B] border border-[#BDE8C7] shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00A86B] animate-pulse"></span>
                          Auto-Pay ON
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF6EE] text-[#8A8478] border border-[#EBE5D8]">
                          Off
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B6B6B] whitespace-nowrap">
                      {when(sub.purchased_at)}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B6B6B] whitespace-nowrap font-bold">
                      {when(sub.expires_at)}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#1C1C1C]">
                      {sub.posts_remaining} / {sub.post_limit}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {sub.txn_ref ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-extrabold bg-white border border-[#EBE5D8] text-[#1C1C1C] shadow-2xs">
                          <Tag className="w-3 h-3 text-[#00A86B]" />
                          {sub.txn_ref}
                        </span>
                      ) : (
                        <span className="text-[#8A8478] font-mono text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

