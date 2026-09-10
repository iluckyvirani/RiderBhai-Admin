import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Search } from 'lucide-react';
import { api, getToken } from '../../lib/api';
import { mapDeal, type Deal } from '../../lib/deals';
import { AdminPageSkeleton } from '../common/AdminLoading';
import { EmptyState } from '../common/EmptyState';
import { DealRatings } from './DealRatings';

export const DirectDealsView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api<any[]>('/admin/deals?channel=direct&status=all');
      setRows((data || []).map(mapDeal));
    } catch (err: any) {
      setError(err?.message || 'Could not load direct deals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = rows.filter((deal) => {
    const q = search.toLowerCase();
    return (
      !q ||
      deal.title.toLowerCase().includes(q) ||
      deal.buyerName.toLowerCase().includes(q) ||
      deal.sellerName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-[#F15A24]" />
          Direct deals
        </h2>
        <p className="text-xs text-[#6B6B6B] mt-1">
          OLX-style chats from the website. Users close these themselves — admin only watches.
        </p>
      </div>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B6B6B]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, buyer or seller…"
          className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] text-xs font-bold"
        />
      </div>
      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
      {loading && <AdminPageSkeleton variant="list" rows={4} />}
      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={MessageSquare}
          title="No record found"
          description={search ? 'No direct deal matches this search.' : 'No Message-direct deals yet.'}
        />
      )}
      {!loading &&
        filtered.map((deal) => (
          <div key={deal.id} className="rounded-2xl border border-[#EBE5D8] bg-[#FAF6EE] p-4 space-y-1">
            <p className="text-[10px] font-extrabold uppercase text-[#F15A24]">
              {deal.listingType} · {deal.status}
            </p>
            <p className="text-sm font-extrabold">{deal.title}</p>
            <p className="text-[11px] text-[#6B6B6B]">
              {deal.buyerName} → {deal.sellerName}
              {deal.fromCity ? ` · ${deal.fromCity}` : ''}
              {deal.toCity ? ` → ${deal.toCity}` : ''}
            </p>
            <p className="text-xs font-extrabold">₹{deal.price.toLocaleString('en-IN')}</p>
            <DealRatings deal={deal} />
          </div>
        ))}
    </div>
  );
};
