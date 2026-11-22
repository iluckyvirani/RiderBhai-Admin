import React, { useEffect, useMemo, useState } from 'react';
import { Gift, Users, CheckCircle2, Clock, Search } from 'lucide-react';
import { api, getToken } from '../../lib/api';
import { AdminPageSkeleton, ButtonSpinner } from '../common/AdminLoading';
import { EmptyState } from '../common/EmptyState';

type Earning = {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  reason: 'kyc_verified' | 'plan_trial' | 'plan_standard';
  amount: number;
  status: 'pending' | 'paid';
  admin_note?: string | null;
  paid_at?: string | null;
  created_at: string;
  referrer_name?: string;
  referrer_phone?: string;
  referrer_display_id?: string;
  referee_name?: string;
  referee_phone?: string;
  referee_display_id?: string;
};

type NetworkUser = {
  id: string;
  name: string;
  phone: string;
  display_id?: string;
  profile_status: string;
  created_at: string;
  referred_by_id?: string | null;
  referred_by_name?: string | null;
  referred_by_phone?: string | null;
  referred_by_display_id?: string | null;
};

const REASON_LABEL: Record<Earning['reason'], string> = {
  kyc_verified: 'KYC verified',
  plan_trial: 'Weekly / trial plan',
  plan_standard: 'Monthly+ plan',
};

function money(n: number) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

export const ReferralsManager: React.FC = () => {
  const [tab, setTab] = useState<'earnings' | 'network'>('earnings');
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [network, setNetwork] = useState<NetworkUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedReferrer, setExpandedReferrer] = useState<string | null>(null);

  const load = async () => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [e, n] = await Promise.all([
        api<Earning[]>('/admin/referrals'),
        api<NetworkUser[]>('/admin/referrals/users'),
      ]);
      setEarnings(e);
      setNetwork(n);
    } catch (err: any) {
      setError(err?.message || 'Could not load referrals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const togglePaid = async (row: Earning) => {
    setSavingId(row.id);
    try {
      const next = row.status === 'paid' ? 'pending' : 'paid';
      await api(`/admin/referrals/${row.id}`, { method: 'PATCH', json: { status: next } });
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not update this earning.');
    } finally {
      setSavingId(null);
    }
  };

  const filteredEarnings = earnings.filter((row) => {
    if (statusFilter !== 'all' && row.status !== statusFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${row.referrer_name} ${row.referrer_phone} ${row.referee_name} ${row.referee_phone}`
      .toLowerCase()
      .includes(q);
  });

  const totals = earnings.reduce(
    (acc, e) => {
      acc.total += e.amount;
      if (e.status === 'paid') acc.paid += e.amount;
      else acc.pending += e.amount;
      return acc;
    },
    { total: 0, paid: 0, pending: 0 }
  );

  // Group the flat network list by referrer, so each referrer's row can expand
  // to show everyone they referred (per-user drill-down the admin asked for).
  const referrersById = useMemo(() => {
    const map = new Map<string, { referrer: NetworkUser; referred: NetworkUser[] }>();
    for (const u of network) {
      if (u.referred_by_id) {
        const key = u.referred_by_id;
        if (!map.has(key)) {
          map.set(key, {
            referrer: {
              id: u.referred_by_id,
              name: u.referred_by_name || 'Ride Bhai user',
              phone: u.referred_by_phone || '',
              display_id: u.referred_by_display_id || undefined,
              profile_status: '',
              created_at: '',
            },
            referred: [],
          });
        }
        map.get(key)!.referred.push(u);
      }
    }
    return map;
  }, [network]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Gift className="w-6 h-6 text-[#F15A24]" />
            Refer & Earn
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-1">
            No in-app wallet — pay these manually, then mark as paid here.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-2">
          <div className="px-3 py-2 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] text-center">
            <p className="text-[9px] font-extrabold uppercase text-[#8A8478]">Total</p>
            <p className="text-sm font-extrabold">{money(totals.total)}</p>
          </div>
          <div className="px-3 py-2 rounded-2xl bg-[#EBF7EE] border border-[#BDE8C7] text-center">
            <p className="text-[9px] font-extrabold uppercase text-[#1B6B3A]">Paid</p>
            <p className="text-sm font-extrabold text-[#1B6B3A]">{money(totals.paid)}</p>
          </div>
          <div className="px-3 py-2 rounded-2xl bg-[#FFF0EB] border border-[#FFD8CB] text-center">
            <p className="text-[9px] font-extrabold uppercase text-[#F15A24]">Pending</p>
            <p className="text-sm font-extrabold text-[#F15A24]">{money(totals.pending)}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('earnings')}
          className={`rounded-full px-3.5 py-1.5 text-[11px] font-extrabold border ${
            tab === 'earnings' ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'bg-white text-[#6B6B6B] border-[#EBE5D8]'
          }`}
        >
          Earnings ({earnings.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('network')}
          className={`rounded-full px-3.5 py-1.5 text-[11px] font-extrabold border ${
            tab === 'network' ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'bg-white text-[#6B6B6B] border-[#EBE5D8]'
          }`}
        >
          Referral network ({referrersById.size})
        </button>
      </div>

      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
      {loading && <AdminPageSkeleton variant="table" rows={6} />}

      {!loading && tab === 'earnings' && (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B6B6B]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search referrer or referred user…"
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] text-xs font-bold"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'paid'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold border capitalize ${
                    statusFilter === s ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'bg-white text-[#6B6B6B] border-[#EBE5D8]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {filteredEarnings.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="No record found"
              description="No referral earnings match this filter yet."
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#EBE5D8]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6EE] text-[10px] uppercase tracking-wider text-[#8A8478]">
                  <tr>
                    <th className="px-3 py-2.5 font-extrabold">Referrer</th>
                    <th className="px-3 py-2.5 font-extrabold">Referred user</th>
                    <th className="px-3 py-2.5 font-extrabold">Reason</th>
                    <th className="px-3 py-2.5 font-extrabold">Amount</th>
                    <th className="px-3 py-2.5 font-extrabold">Status</th>
                    <th className="px-3 py-2.5 font-extrabold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEarnings.map((row) => (
                    <tr key={row.id} className="border-t border-[#EBE5D8]">
                      <td className="px-3 py-2.5">
                        <p className="font-extrabold">{row.referrer_name}</p>
                        <p className="text-[#9E9E9E] font-bold">
                          +91 {row.referrer_phone} · {row.referrer_display_id}
                        </p>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-extrabold">{row.referee_name}</p>
                        <p className="text-[#9E9E9E] font-bold">
                          +91 {row.referee_phone} · {row.referee_display_id}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 font-bold text-[#6B6B6B]">{REASON_LABEL[row.reason]}</td>
                      <td className="px-3 py-2.5 font-extrabold">{money(row.amount)}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                            row.status === 'paid' ? 'bg-[#EBF7EE] text-[#00A86B]' : 'bg-[#FFF0EB] text-[#F15A24]'
                          }`}
                        >
                          {row.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          disabled={savingId === row.id}
                          onClick={() => togglePaid(row)}
                          className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-[11px] font-extrabold disabled:opacity-60 ${
                            row.status === 'paid'
                              ? 'border-[#EBE5D8] bg-white hover:border-[#F15A24] hover:text-[#F15A24]'
                              : 'border-[#00A86B] bg-[#00A86B] text-white'
                          }`}
                        >
                          {savingId === row.id && <ButtonSpinner />}
                          {row.status === 'paid' ? 'Mark pending' : 'Mark paid'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!loading && tab === 'network' && (
        <>
          {referrersById.size === 0 ? (
            <EmptyState icon={Users} title="No record found" description="No one has referred anyone yet." />
          ) : (
            <div className="space-y-2.5">
              {Array.from(referrersById.entries()).map(([id, { referrer, referred }]) => (
                <div key={id} className="rounded-2xl border border-[#EBE5D8] bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedReferrer((cur) => (cur === id ? null : id))}
                    className="w-full p-3.5 flex items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <p className="text-xs font-extrabold">{referrer.name}</p>
                      <p className="text-[11px] text-[#9E9E9E] font-bold">
                        +91 {referrer.phone} · {referrer.display_id}
                      </p>
                    </div>
                    <span className="text-[11px] font-extrabold text-[#F15A24]">
                      Referred {referred.length} {referred.length === 1 ? 'user' : 'users'}
                    </span>
                  </button>
                  {expandedReferrer === id && (
                    <div className="border-t border-[#EBE5D8] divide-y divide-[#EBE5D8]">
                      {referred.map((u) => (
                        <div key={u.id} className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold">{u.name}</p>
                            <p className="text-[11px] text-[#9E9E9E] font-bold">
                              +91 {u.phone} · {u.display_id}
                            </p>
                          </div>
                          <span className="text-[10px] font-extrabold uppercase text-[#6B6B6B]">
                            {u.profile_status.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
