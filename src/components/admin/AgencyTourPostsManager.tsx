import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Eye, MapPin, Search, Trash2 } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { api, getToken } from '../../lib/api';
import { mapTourListing } from '../../lib/listings';
import { AgencyTripPost } from '../../types';
import { AdminPageSkeleton } from '../common/AdminLoading';

function money(n: number) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

function when(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function statusClass(status: AgencyTripPost['status']) {
  if (status === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'cancelled') return 'bg-red-50 text-red-600 border-red-200';
  return 'bg-[#FAF6EE] text-[#6B6B6B] border-[#EBE5D8]';
}

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  const text = value === 0 ? '0' : value ? String(value) : '—';
  return (
    <div className="rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] p-2.5">
      <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">{label}</p>
      <p className="text-xs font-extrabold text-[#1C1C1C] mt-0.5 break-words">{text}</p>
    </div>
  );
}

export const AgencyTourPostsManager: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [posts, setPosts] = useState<AgencyTripPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      setPosts([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api<any[]>('/admin/listings/tours');
      setPosts((data || []).map(mapTourListing));
    } catch (err: any) {
      setError(err?.message || 'Could not load tours.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removeTour = async (id: string, title: string) => {
    if (!window.confirm(`Delete tour ${title}? Related inquiries and chats will also be removed.`)) return;
    try {
      await api(`/admin/listings/tours/${id}`, { method: 'DELETE' });
      setSelectedId(null);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not delete tour.');
    }
  };

  const setStatus = async (id: string, status: 'active' | 'closed') => {
    try {
      await api(`/admin/listings/tours/${id}`, { method: 'PATCH', json: { status } });
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not update tour.');
    }
  };

  const counts = {
    all: posts.length,
    active: posts.filter((p) => p.status === 'active').length,
    closed: posts.filter((p) => p.status !== 'active').length,
  };

  const filteredPosts = posts.filter((post) => {
    if (statusFilter === 'active' && post.status !== 'active') return false;
    if (statusFilter === 'closed' && post.status === 'active') return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        post.fromCity.toLowerCase().includes(q) ||
        post.toCity.toLowerCase().includes(q) ||
        post.agencyName.toLowerCase().includes(q) ||
        (post.agencyPhone || '').includes(search) ||
        (post.tripDetails || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selected = posts.find((p) => p.id === selectedId);

  if (selected) {
    const extras = [
      ['Pickup', selected.pickupLocation],
      ['Drop', selected.dropLocation],
      ['Vehicle', selected.requiredVehicleType || selected.desiredCar?.name],
    ].filter(([, value]) => Boolean(value));

    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="text-xs font-extrabold text-[#F15A24] inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> All tours
        </button>

        <div className="rounded-3xl border border-[#EBE5D8] bg-white p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#F15A24]">Tour details</p>
              <h2 className="text-lg font-black text-[#1C1C1C] mt-1">
                {selected.fromCity} → {selected.toCity}
              </h2>
              <p className="text-xs font-bold text-[#6B6B6B] mt-0.5">
                {selected.agencyName || 'Agency'} · +91 {selected.agencyPhone || '—'}
              </p>
            </div>
            <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${statusClass(selected.status)}`}>
              {selected.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Detail label="Passengers" value={`${selected.passengers} pax`} />
            <Detail
              label="Customer price"
              value={selected.totalCustomerPrice > 0 ? money(selected.totalCustomerPrice) : 'Quotation invited'}
            />
            <Detail
              label="Agency commission"
              value={selected.totalCustomerPrice > 0 ? money(selected.agencyCommission) : '—'}
            />
            <Detail
              label="Driver payout"
              value={selected.totalCustomerPrice > 0 ? money(selected.driverNetPayout) : 'Open for quotes'}
            />
            <Detail label="Travel date" value={selected.startDate || '—'} />
            <Detail label="Pickup time" value={selected.pickupTime || '—'} />
            <Detail label="Posted" value={when(selected.createdAt)} />
            <Detail label="Phone" value={selected.agencyPhone ? `+91 ${selected.agencyPhone}` : '—'} />
          </div>

          {extras.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {extras.map(([label, value]) => (
                <Detail key={label} label={label} value={value} />
              ))}
            </div>
          )}

          {selected.desiredCar?.specs?.length ? (
            <p className="text-[11px] text-[#6B6B6B]">Car specs: {selected.desiredCar.specs.join(', ')}</p>
          ) : null}

          {selected.tripDetails && (
            <div className="rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] p-3">
              <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Trip notes</p>
              <p className="text-xs font-bold text-[#1C1C1C] mt-1 whitespace-pre-wrap">{selected.tripDetails}</p>
            </div>
          )}

          {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}

          <div className="flex flex-wrap gap-2">
            {selected.status === 'active' ? (
              <button
                type="button"
                onClick={() => setStatus(selected.id, 'closed')}
                className="flex-1 min-w-[140px] py-2.5 rounded-xl bg-[#1C1C1C] text-white text-[11px] font-extrabold"
              >
                Close & hide
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStatus(selected.id, 'active')}
                className="flex-1 min-w-[140px] py-2.5 rounded-xl bg-[#FAF6EE] text-[11px] font-extrabold"
              >
                Show again
              </button>
            )}
            <button
              type="button"
              onClick={() => removeTour(selected.id, `${selected.fromCity} → ${selected.toCity}`)}
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[11px] font-extrabold text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold">All tours ({posts.length})</h2>
          <p className="text-xs text-[#6B6B6B] mt-1">Live from Neon. Open a row to see full tour details.</p>
        </div>
        <div className="flex gap-2 bg-[#FAF6EE] p-1 rounded-2xl border border-[#EBE5D8]">
          {(['all', 'active', 'closed'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize ${
                statusFilter === key ? 'bg-[#1C1C1C] text-white' : 'text-[#6B6B6B]'
              }`}
            >
              {key} {counts[key]}
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3.5 top-3.5" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search city, agency or phone…"
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#EBE5D8] text-xs font-medium"
        />
      </div>
      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
      {loading && <AdminPageSkeleton variant="table" rows={6} />}
      {!loading && filteredPosts.length === 0 && (
        <EmptyState
          icon={MapPin}
          title="No record found"
          description={
            search
              ? 'No tour matches this search. Try city, agency or phone.'
              : statusFilter === 'active'
                ? 'No live tours on the website right now.'
                : 'No tour listings have been posted yet.'
          }
        />
      )}
      {!loading && filteredPosts.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border border-[#EBE5D8] bg-white">
          <table className="w-full text-left text-xs border-collapse min-w-[860px]">
            <thead>
              <tr className="border-b border-[#EBE5D8] text-[#6B6B6B] uppercase font-bold text-[10px] tracking-wider bg-[#FAF6EE]/50">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Agency</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Pax</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Posted</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE1]">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-[#FFFDF9]">
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${statusClass(post.status)}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-extrabold text-[#1C1C1C] inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#F15A24] shrink-0" />
                      {post.fromCity} → {post.toCity}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#1C1C1C]">{post.agencyName || '—'}</td>
                  <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                    {post.agencyPhone ? `+91 ${post.agencyPhone}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-[#F15A24] whitespace-nowrap">
                    {post.totalCustomerPrice > 0 ? money(post.totalCustomerPrice) : 'Quotation'}
                  </td>
                  <td className="py-3.5 px-4 text-[#6B6B6B] whitespace-nowrap">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedId(post.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#EBE5D8] bg-[#FAF6EE] px-2 py-1 text-[11px] font-extrabold hover:bg-[#1C1C1C] hover:text-white"
                      >
                        <Eye className="h-3.5 w-3.5" /> View details
                      </button>
                      {post.status === 'active' ? (
                        <button
                          type="button"
                          onClick={() => setStatus(post.id, 'closed')}
                          className="rounded-lg bg-[#1C1C1C] px-2 py-1 text-[11px] font-extrabold text-white"
                        >
                          Close & hide
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setStatus(post.id, 'active')}
                          className="rounded-lg bg-[#FAF6EE] border border-[#EBE5D8] px-2 py-1 text-[11px] font-extrabold"
                        >
                          Show again
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeTour(post.id, `${post.fromCity} → ${post.toCity}`)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-extrabold text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
