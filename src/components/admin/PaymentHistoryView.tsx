import React, { useEffect, useState } from 'react';
import {
  FileText,
  Search,
  CreditCard,
  Download,
  Tag,
  Sparkles,
} from 'lucide-react';
import { api, getToken } from '../../lib/api';
import { formatUserId } from '../../lib/displayId';
import { AdminPageSkeleton } from '../common/AdminLoading';
import { EmptyState } from '../common/EmptyState';

export type LivePaymentTxn = {
  id: string;
  user_id: string;
  plan_id: string;
  purchased_at: string;
  expires_at: string;
  payment_method?: string;
  txn_ref?: string;
  plan_name: string;
  amount: number;
  duration_days: number;
  user_name?: string;
  user_phone?: string;
  user_email?: string;
  user_display_id?: string;
  is_active?: boolean;
};

export const PaymentHistoryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | 'upi' | 'card'>('all');
  const [payments, setPayments] = useState<LivePaymentTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      setError('Login as admin to view transactions.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    api<LivePaymentTxn[]>('/admin/payments')
      .then(setPayments)
      .catch((err: any) => setError(err?.message || 'Could not load payment history.'))
      .finally(() => setLoading(false));
  }, []);

  const formatMethod = (m?: string) => {
    if (!m) return 'UPI';
    const lower = m.toLowerCase();
    if (lower === 'card') return 'Card';
    if (lower === 'netbanking') return 'Netbanking';
    if (lower === 'wallet') return 'Wallet';
    return 'UPI';
  };

  const filteredPayments = payments.filter((p) => {
    const q = searchTerm.toLowerCase();
    const uid = (p.user_display_id || formatUserId(p.user_id || p.id)).toLowerCase();
    const txn = (p.txn_ref || `TXN-${p.id.slice(0, 8)}`).toLowerCase();
    const matchesSearch =
      !q ||
      uid.includes(q) ||
      txn.includes(q) ||
      (p.user_name || '').toLowerCase().includes(q) ||
      (p.user_phone || '').includes(searchTerm) ||
      (p.plan_name || '').toLowerCase().includes(q);

    const method = formatMethod(p.payment_method).toLowerCase();
    const matchesMethod =
      methodFilter === 'all' ||
      method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const totalVolume = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const liveActiveCount = payments.filter((p) => new Date(p.expires_at).getTime() > Date.now()).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C1C1C] flex items-center gap-2 font-display">
            <FileText className="w-6 h-6 text-[#F15A24]" />
            <span>Live plan purchase payments</span>
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Strictly live package purchases recorded in the database. Customer rides are settled directly between riders and partners.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting live plan transaction statement (CSV)...')}
          className="px-3.5 py-2 rounded-2xl bg-white border border-[#EBE5D8] hover:bg-[#FAF6EE] text-xs font-bold text-[#1C1C1C] transition-all flex items-center gap-1.5 shadow-xs active-press"
        >
          <Download className="w-4 h-4 text-[#F15A24]" />
          <span>Export Statement</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FAF6EE] p-5 rounded-3xl border border-[#EBE5D8] space-y-1">
          <span className="text-[11px] font-extrabold text-[#6B6B6B] uppercase tracking-wider">
            Total plan revenue
          </span>
          <p className="text-2xl font-extrabold text-[#1C1C1C]">
            ₹{totalVolume.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#00A86B] font-bold">Live database purchases</p>
        </div>

        <div className="bg-[#FAF6EE] p-5 rounded-3xl border border-[#EBE5D8] space-y-1">
          <span className="text-[11px] font-extrabold text-[#6B6B6B] uppercase tracking-wider">
            Total transactions
          </span>
          <p className="text-2xl font-extrabold text-[#1C1C1C]">
            {payments.length}
          </p>
          <p className="text-[11px] text-[#6B6B6B]">Plan purchase orders</p>
        </div>

        <div className="bg-[#FAF6EE] p-5 rounded-3xl border border-[#EBE5D8] space-y-1">
          <span className="text-[11px] font-extrabold text-[#6B6B6B] uppercase tracking-wider">
            Active plans running
          </span>
          <p className="text-2xl font-extrabold text-[#1C1C1C]">
            {liveActiveCount}
          </p>
          <p className="text-[11px] text-[#F15A24] font-bold">Unexpired subscribers</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B6B6B]" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search User ID (e.g. RB-US-1001), txn ref, subscriber name, phone..."
            className="w-full text-xs font-bold text-[#1C1C1C] bg-[#FAF6EE] pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#EBE5D8] focus:outline-none focus:border-[#F15A24]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Methods' },
            { id: 'upi', label: 'UPI' },
            { id: 'card', label: 'Card' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setMethodFilter(pill.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 active-press ${
                methodFilter === pill.id
                  ? 'bg-[#1C1C1C] text-white shadow-xs'
                  : 'bg-[#FAF6EE] text-[#6B6B6B] border border-[#EBE5D8] hover:text-[#1C1C1C]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
      {loading && <AdminPageSkeleton variant="table" rows={5} />}

      {!loading && filteredPayments.length === 0 && (
        <EmptyState
          icon={CreditCard}
          title="No live transactions found"
          description={
            searchTerm
              ? 'No transaction matches this search term.'
              : 'No live plan purchases have been recorded yet.'
          }
        />
      )}

      {/* Transactions Table */}
      {!loading && filteredPayments.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border border-[#EBE5D8] bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#EBE5D8] text-[#6B6B6B] uppercase font-bold text-[10px] tracking-wider bg-[#FAF6EE]/50">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Subscriber</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE1]">
              {filteredPayments.map((p) => {
                const method = formatMethod(p.payment_method);
                return (
                  <tr key={p.id} className="hover:bg-[#FFFDF9] transition-colors">
                    {/* Transaction ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-extrabold bg-white border border-[#EBE5D8] text-[#1C1C1C] shadow-2xs">
                        <Tag className="w-3 h-3 text-[#00A86B]" />
                        {p.txn_ref || `TXN-${p.id.slice(0, 8).toUpperCase()}`}
                      </span>
                    </td>

                    {/* User ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-extrabold bg-white border border-[#EBE5D8] text-[#1C1C1C] shadow-2xs">
                        <Tag className="w-3 h-3 text-[#F15A24]" />
                        {p.user_display_id || formatUserId(p.user_id || p.id)}
                      </span>
                    </td>

                    {/* Subscriber */}
                    <td className="py-3.5 px-4 font-extrabold text-[#1C1C1C]">
                      {p.user_name || 'Unnamed user'}
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#6B6B6B] whitespace-nowrap">
                      {p.user_phone ? `+91 ${p.user_phone}` : '—'}
                    </td>

                    {/* Package */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFF0EB] text-[#F15A24] border border-[#FFD8CB]">
                        <Sparkles className="w-2.5 h-2.5" />
                        {p.plan_name}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-extrabold text-sm text-[#F15A24] whitespace-nowrap">
                      ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 uppercase tracking-wider font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border bg-[#FAF6EE] text-[#1C1C1C] border-[#EBE5D8]">
                        {method}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-right text-xs text-[#6B6B6B] whitespace-nowrap font-medium">
                      {new Date(p.purchased_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
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
