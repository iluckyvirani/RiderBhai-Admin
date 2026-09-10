import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Car, Eye, MapPin, Search } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { api, getToken } from '../../lib/api';
import { mapCarListing } from '../../lib/listings';
import { CarListing } from '../../types';
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

function stamp(date?: string, time?: string) {
  if (!date && !time) return '—';
  const pretty = date ? date.split('-').reverse().join('/') : '';
  return [pretty, time].filter(Boolean).join(' · ');
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

export const AllCarListingsView: React.FC<{ liveOnly?: boolean }> = () => {
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'hidden'>('all');
  const [rows, setRows] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      setRows([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api<any[]>('/admin/listings/cars');
      setRows((data || []).map(mapCarListing));
    } catch (err: any) {
      setError(err?.message || 'Could not load cars.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: string, status: 'available' | 'inactive') => {
    try {
      await api(`/admin/listings/cars/${id}`, { method: 'PATCH', json: { status } });
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
    } catch (err: any) {
      setError(err?.message || 'Could not update listing.');
    }
  };

  const counts = {
    all: rows.length,
    live: rows.filter((c) => c.status === 'available').length,
    hidden: rows.filter((c) => c.status !== 'available').length,
  };

  const filtered = rows.filter((c) => {
    if (statusFilter === 'live' && c.status !== 'available') return false;
    if (statusFilter === 'hidden' && c.status === 'available') return false;
    const s = q.toLowerCase();
    return (
      !s ||
      c.carName.toLowerCase().includes(s) ||
      c.partnerName.toLowerCase().includes(s) ||
      c.currentCity.toLowerCase().includes(s) ||
      (c.toCity || '').toLowerCase().includes(s) ||
      (c.plate || '').toLowerCase().includes(s)
    );
  });

  const selected = rows.find((c) => c.id === selectedId);

  if (selected) {
    const live = selected.status === 'available';
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="text-xs font-extrabold text-[#F15A24] inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Live cars
        </button>
        <div className="rounded-3xl border border-[#EBE5D8] bg-white p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#F15A24]">Car post details</p>
              <h2 className="text-lg font-black text-[#1C1C1C] mt-1">{selected.carName}</h2>
              <p className="text-xs font-bold text-[#6B6B6B] mt-0.5">
                {selected.partnerName} · {selected.plate || '—'}
              </p>
            </div>
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                live ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-[#FAF6EE] text-[#6B6B6B] border-[#EBE5D8]'
              }`}
            >
              {live ? 'Live on website' : 'Hidden from website'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Detail
              label="Route"
              value={
                selected.availability === 'route'
                  ? `${selected.currentCity} → ${selected.toCity || '—'}`
                  : `Currently in ${selected.currentCity} · All India`
              }
            />
            <Detail label="Price" value={money(selected.fullCarPrice)} />
            <Detail label="Seats" value={`${selected.seats} seater`} />
            <Detail label="Fuel" value={selected.fuelType || '—'} />
            <Detail label="Color" value={selected.color || '—'} />
            <Detail label="Year" value={selected.year || '—'} />
            <Detail label="Driver" value={selected.driverName || '—'} />
            <Detail
              label="Driver experience"
              value={
                selected.driverExperienceYears !== undefined ? `${selected.driverExperienceYears} years` : '—'
              }
            />
            <Detail label="Posted" value={stamp(selected.postedDate, selected.postedTime)} />
            <Detail label="Available from" value={stamp(selected.bookingDate, selected.bookingTime)} />
            <Detail label="Available to" value={stamp(selected.availableTillDate, selected.availableTillTime)} />
            <Detail label="Created" value={when(selected.createdAt)} />
          </div>
          {selected.notes && (
            <div className="rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] p-3">
              <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Notes</p>
              <p className="text-xs font-bold mt-1">{selected.notes}</p>
            </div>
          )}
          {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
          {live ? (
            <button
              type="button"
              onClick={() => setStatus(selected.id, 'inactive')}
              className="w-full py-2.5 rounded-xl bg-[#1C1C1C] text-white text-[11px] font-extrabold"
            >
              Hide from website
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStatus(selected.id, 'available')}
              className="w-full py-2.5 rounded-xl bg-[#FAF6EE] border border-[#EBE5D8] text-[11px] font-extrabold"
            >
              Show on website
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C1C1C] flex items-center gap-2">
            <Car className="w-6 h-6 text-[#F15A24]" /> Live cars
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Hidden cars stay here. Hide only takes a listing off the public Cars tab.
          </p>
        </div>
        <div className="flex gap-2 bg-[#FAF6EE] p-1 rounded-2xl border border-[#EBE5D8]">
          {(['all', 'live', 'hidden'] as const).map((key) => (
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
        <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-3" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search car, partner, city, plate…"
          className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] text-xs font-bold"
        />
      </div>
      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
      {loading && <AdminPageSkeleton variant="table" rows={6} />}
      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={Car}
          title="No record found"
          description={
            q
              ? 'No car matches this search.'
              : statusFilter === 'live'
                ? 'No cars are live on the website right now.'
                : statusFilter === 'hidden'
                  ? 'No hidden cars.'
                  : 'No car listings have been posted yet.'
          }
        />
      )}
      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border border-[#EBE5D8] bg-white">
          <table className="w-full text-left text-xs border-collapse min-w-[920px]">
            <thead>
              <tr className="border-b border-[#EBE5D8] text-[#6B6B6B] uppercase font-bold text-[10px] tracking-wider bg-[#FAF6EE]/50">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Car</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Partner</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Available</th>
                <th className="py-3 px-4">Posted</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE1]">
              {filtered.map((c) => {
                const live = c.status === 'available';
                const posted = stamp(c.postedDate, c.postedTime);
                return (
                  <tr key={c.id} className="hover:bg-[#FFFDF9]">
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          live
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-[#FAF6EE] text-[#6B6B6B] border-[#EBE5D8]'
                        }`}
                      >
                        {live ? 'Live' : 'Hidden'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-[#1C1C1C]">{c.carName}</p>
                      <p className="text-[11px] text-[#6B6B6B]">{c.plate || '—'} · {c.seats} seater</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#F15A24] shrink-0" />
                        {c.availability === 'route'
                          ? `${c.currentCity} → ${c.toCity || '—'}`
                          : `${c.currentCity} · All India`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1C1C1C]">{c.partnerName || '—'}</td>
                    <td className="py-3.5 px-4 font-extrabold text-[#F15A24] whitespace-nowrap">{money(c.fullCarPrice)}</td>
                    <td className="py-3.5 px-4 text-[#6B6B6B] whitespace-nowrap text-[11px]">
                      {stamp(c.bookingDate, c.bookingTime)} → {stamp(c.availableTillDate, c.availableTillTime)}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B6B6B] whitespace-nowrap">
                      {posted !== '—'
                        ? posted
                        : c.createdAt
                          ? new Date(c.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                          : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedId(c.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#EBE5D8] bg-[#FAF6EE] px-2 py-1 text-[11px] font-extrabold hover:bg-[#1C1C1C] hover:text-white"
                        >
                          <Eye className="h-3.5 w-3.5" /> Show details
                        </button>
                        {live ? (
                          <button
                            type="button"
                            onClick={() => setStatus(c.id, 'inactive')}
                            className="rounded-lg bg-[#1C1C1C] px-2 py-1 text-[11px] font-extrabold text-white"
                          >
                            Hide
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStatus(c.id, 'available')}
                            className="rounded-lg bg-[#FAF6EE] border border-[#EBE5D8] px-2 py-1 text-[11px] font-extrabold"
                          >
                            Show
                          </button>
                        )}
                      </div>
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
