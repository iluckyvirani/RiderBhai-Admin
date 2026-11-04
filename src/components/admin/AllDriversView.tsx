import React, { useEffect, useState } from 'react';
import { IdCard, Search, MapPin, ChevronRight, Ban, CheckCircle2, ShieldAlert, Tag } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { api, getToken } from '../../lib/api';
import {
  kycClass,
  vehicleStatusLabel,
  mapAdminDriver,
  type AdminDriverRow,
} from '../../lib/directory';
import { formatDriverId } from '../../lib/displayId';
import { isPreviewableImage } from '../../lib/kyc';
import { AdminPageSkeleton } from '../common/AdminLoading';
import { DriverDetailsView } from './DriverDetailsView';

export const AllDriversView: React.FC<{ hideTitle?: boolean; verifiedOnly?: boolean }> = ({
  hideTitle,
  verifiedOnly,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'pending' | 'verified' | 'rejected' | 'blocked' | 'all'>(
    verifiedOnly ? 'verified' : 'pending'
  );
  const [rows, setRows] = useState<AdminDriverRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [blockTarget, setBlockTarget] = useState<AdminDriverRow | null>(null);
  const [blockReason, setBlockReason] = useState('Violated community guidelines / unsafe driving');
  const [blocking, setBlocking] = useState(false);

  const load = () => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      return;
    }
    setLoading(true);
    api<any[]>('/admin/drivers')
      .then((data) => setRows((data || []).map(mapAdminDriver)))
      .catch((err: any) => setError(err?.message || 'Could not load drivers.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const counts = {
    pending: rows.filter((d) => d.verificationStatus === 'pending_verification').length,
    verified: rows.filter((d) => d.verificationStatus === 'verified').length,
    rejected: rows.filter((d) => d.verificationStatus === 'rejected').length,
    blocked: rows.filter((d) => d.verificationStatus === 'blocked').length,
    all: rows.length,
  };

  const handleToggleBlock = async (driver: AdminDriverRow, targetState: boolean, reason?: string) => {
    if (!driver.id) return;
    setBlocking(true);
    try {
      await api(`/admin/drivers/${driver.id}`, {
        method: 'POST',
        json: {
          decision: targetState ? 'blocked' : 'verified',
          rejectionReason: targetState ? reason || 'Blocked by admin' : undefined,
        },
      });
      setRows((prev) =>
        prev.map((d) =>
          d.id === driver.id
            ? {
                ...d,
                verificationStatus: targetState ? 'blocked' : 'verified',
                rejectionReason: targetState ? reason || 'Blocked by admin' : undefined,
              }
            : d
        )
      );
      setBlockTarget(null);
    } catch (err: any) {
      setError(err?.message || `Could not ${targetState ? 'block' : 'unblock'} driver.`);
    } finally {
      setBlocking(false);
    }
  };

  const filtered = rows.filter((driver) => {
    if (filter === 'pending' && driver.verificationStatus !== 'pending_verification') return false;
    if (filter === 'verified' && driver.verificationStatus !== 'verified') return false;
    if (filter === 'rejected' && driver.verificationStatus !== 'rejected') return false;
    if (filter === 'blocked' && driver.verificationStatus !== 'blocked') return false;
    const q = searchTerm.toLowerCase();
    const driverId = (driver.displayId || formatDriverId(driver.id)).toLowerCase();
    return (
      !q ||
      driverId.includes(q) ||
      driver.name.toLowerCase().includes(q) ||
      driver.phone.includes(searchTerm) ||
      driver.email.toLowerCase().includes(q) ||
      (driver.city || '').toLowerCase().includes(q)
    );
  });

  const selected = rows.find((d) => (d.id || `${d.userId}-${d.phone}`) === selectedId);
  if (selected) {
    return (
      <DriverDetailsView
        driver={selected}
        onBack={() => setSelectedId(null)}
        onUpdated={(next) => {
          setRows((prev) =>
            prev.map((d) => ((d.id || `${d.userId}-${d.phone}`) === (next.id || `${next.userId}-${next.phone}`) ? next : d))
          );
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {!hideTitle && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C1C1C] flex items-center gap-2">
            <IdCard className="w-6 h-6 text-[#F15A24]" />
            {verifiedOnly ? 'All drivers verified' : 'All drivers'}
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-1">
            {verifiedOnly
              ? 'Drivers admin has already verified. Phone and documents stay in details.'
              : 'Review driver profiles only. Vehicles stay on All vehicles.'}
          </p>
        </div>
        <span className="text-xs font-extrabold bg-[#FFF0EB] text-[#F15A24] px-3 py-1.5 rounded-2xl border border-[#FFD8CB] w-fit">
          {verifiedOnly ? `${counts.verified} verified` : `${counts.pending} pending`}
        </span>
      </div>
      )}
      {hideTitle && (
        <div className="flex justify-end">
          <span className="text-xs font-extrabold bg-[#FFF0EB] text-[#F15A24] px-3 py-1.5 rounded-2xl border border-[#FFD8CB] w-fit">
            {counts.pending} pending
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B6B6B]" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Driver ID (e.g. RB-DR-1001), driver, phone, city…"
            className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] text-xs font-bold"
          />
        </div>
        {!verifiedOnly && (
        <div className="flex flex-wrap gap-1">
          {(['pending', 'verified', 'rejected', 'blocked', 'all'] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`px-3 py-2 rounded-xl text-[11px] font-extrabold capitalize ${
                filter === id ? 'bg-[#1C1C1C] text-white' : 'bg-[#FAF6EE] text-[#6B6B6B]'
              }`}
            >
              {id} {counts[id]}
            </button>
          ))}
        </div>
        )}
      </div>

      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
      {loading && <AdminPageSkeleton variant="cards" rows={6} />}
      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={IdCard}
          title="No record found"
          description={
            searchTerm
              ? 'No driver matches this search.'
              : filter === 'pending'
                ? 'No drivers are waiting for verification.'
                : 'No drivers in this filter.'
          }
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((driver) => {
            const key = driver.id || `${driver.userId}-${driver.phone}`;
            const isBlocked = driver.verificationStatus === 'blocked';
            return (
              <div
                key={key}
                className="rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-4 space-y-3 flex flex-col justify-between"
              >
                <div
                  onClick={() => setSelectedId(key)}
                  className="space-y-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {isPreviewableImage(driver.selfieDoc) ? (
                      <img
                        src={driver.selfieDoc}
                        alt=""
                        className="w-12 h-12 rounded-2xl object-cover border border-[#EBE5D8]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-[#FFF0EB] text-[#F15A24] flex items-center justify-center font-extrabold">
                        {(driver.name || 'D').slice(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-extrabold truncate">{driver.name}</p>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl text-[10px] font-mono font-extrabold bg-white border border-[#EBE5D8] text-[#1C1C1C] shadow-2xs whitespace-nowrap">
                          <Tag className="w-2.5 h-2.5 text-[#F15A24]" />
                          {driver.displayId || formatDriverId(driver.id)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B6B6B] font-mono">+91 {driver.phone}</p>
                      <p className="text-[11px] text-[#6B6B6B] truncate">{driver.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="inline-flex items-center gap-1 text-[#6B6B6B]">
                      <MapPin className="w-3 h-3 text-[#F15A24]" />
                      {driver.city || '—'}
                    </span>
                    <span>{driver.experienceYears} yrs</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#EBE5D8]">
                  <span className={`inline-flex px-2 py-0.5 rounded-full font-extrabold text-[10px] border ${kycClass(driver.verificationStatus)}`}>
                    {vehicleStatusLabel(driver.verificationStatus)}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    {isBlocked ? (
                      <button
                        type="button"
                        onClick={() => handleToggleBlock(driver, false)}
                        className="px-2.5 py-1 rounded-xl bg-[#00A86B] text-white text-[10px] font-extrabold flex items-center gap-1 hover:bg-[#008f5b] transition-all"
                        title="Unblock driver"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Unblock
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setBlockTarget(driver);
                          setBlockReason('Violated community guidelines / unsafe driving');
                        }}
                        className="px-2 py-1 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-extrabold flex items-center gap-1 transition-all"
                        title="Block driver"
                      >
                        <Ban className="w-3 h-3" /> Block
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedId(key)}
                      className="text-[11px] font-extrabold text-[#F15A24] inline-flex items-center gap-0.5 hover:underline"
                    >
                      Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {blockTarget && (
        <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <Ban className="w-5 h-5" />
              <h3 className="text-sm font-extrabold">Block Driver: {blockTarget.name}</h3>
            </div>
            <p className="text-[11px] text-[#6B6B6B]">
              Blocking this driver will immediately cancel and hide all active car postings for this driver. An instant notification will be sent to the owner.
            </p>
            <div>
              <label className="text-[10px] font-extrabold text-[#6B6B6B] uppercase block mb-1">
                Reason for blocking *
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={3}
                placeholder="Reason for blocking..."
                className="w-full rounded-2xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setBlockTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#FAF6EE] text-xs font-extrabold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={blocking || blockReason.trim().length < 3}
                onClick={() => handleToggleBlock(blockTarget, true, blockReason.trim())}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold disabled:opacity-50"
              >
                {blocking ? 'Blocking...' : 'Confirm Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
