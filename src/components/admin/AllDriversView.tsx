import React, { useEffect, useState } from 'react';
import { IdCard, Search, MapPin, ChevronRight } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { api, getToken } from '../../lib/api';
import {
  kycClass,
  vehicleStatusLabel,
  mapAdminDriver,
  type AdminDriverRow,
} from '../../lib/directory';
import { isPreviewableImage } from '../../lib/kyc';
import { AdminPageSkeleton } from '../common/AdminLoading';
import { DriverDetailsView } from './DriverDetailsView';

export const AllDriversView: React.FC<{ hideTitle?: boolean; verifiedOnly?: boolean }> = ({
  hideTitle,
  verifiedOnly,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'pending' | 'verified' | 'rejected' | 'all'>(
    verifiedOnly ? 'verified' : 'pending'
  );
  const [rows, setRows] = useState<AdminDriverRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
    all: rows.length,
  };

  const filtered = rows.filter((driver) => {
    if (filter === 'pending' && driver.verificationStatus !== 'pending_verification') return false;
    if (filter === 'verified' && driver.verificationStatus !== 'verified') return false;
    if (filter === 'rejected' && driver.verificationStatus !== 'rejected') return false;
    const q = searchTerm.toLowerCase();
    return (
      !q ||
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
            placeholder="Search driver, phone, city…"
            className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] text-xs font-bold"
          />
        </div>
        {!verifiedOnly && (
        <div className="flex gap-1">
          {(['pending', 'verified', 'rejected', 'all'] as const).map((id) => (
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
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedId(key)}
                className="text-left rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-4 space-y-3"
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
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold truncate">{driver.name}</p>
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
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#EBE5D8]">
                  <span className={`inline-flex px-2 py-0.5 rounded-full font-extrabold text-[10px] border ${kycClass(driver.verificationStatus)}`}>
                    {vehicleStatusLabel(driver.verificationStatus)}
                  </span>
                  <span className="text-[11px] font-extrabold text-[#F15A24] inline-flex items-center gap-0.5">
                    Details <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
