import React, { useEffect, useState } from 'react';
import { Car, Search, ChevronRight, Tag } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { api, getToken } from '../../lib/api';
import {
  kycClass,
  vehicleStatusLabel,
  mapAdminVehicle,
  type AdminVehicleRow,
} from '../../lib/directory';
import { formatVehicleId } from '../../lib/displayId';
import { AdminPageSkeleton } from '../common/AdminLoading';
import { VehicleDetailsView } from './VehicleDetailsView';

export const AllVehiclesView: React.FC<{ hideTitle?: boolean; verifiedOnly?: boolean }> = ({
  hideTitle,
  verifiedOnly,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'pending' | 'verified' | 'rejected' | 'all'>(
    verifiedOnly ? 'verified' : 'pending'
  );
  const [rows, setRows] = useState<AdminVehicleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = () => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      return;
    }
    setLoading(true);
    api<any[]>('/admin/vehicles')
      .then((data) => setRows((data || []).map(mapAdminVehicle)))
      .catch((err: any) => setError(err?.message || 'Could not load vehicles.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const counts = {
    pending: rows.filter((v) => v.verificationStatus === 'pending_verification').length,
    verified: rows.filter((v) => v.verificationStatus === 'verified').length,
    rejected: rows.filter((v) => v.verificationStatus === 'rejected').length,
    all: rows.length,
  };

  const filtered = rows.filter((veh) => {
    if (filter === 'pending' && veh.verificationStatus !== 'pending_verification') return false;
    if (filter === 'verified' && veh.verificationStatus !== 'verified') return false;
    if (filter === 'rejected' && veh.verificationStatus !== 'rejected') return false;
    const q = searchTerm.toLowerCase();
    const vehicleId = (veh.displayId || formatVehicleId(veh.id)).toLowerCase();
    return (
      !q ||
      vehicleId.includes(q) ||
      veh.make.toLowerCase().includes(q) ||
      veh.model.toLowerCase().includes(q) ||
      veh.plate.toLowerCase().includes(q) ||
      veh.ownerName.toLowerCase().includes(q) ||
      veh.ownerPhone.includes(searchTerm)
    );
  });

  const selected = rows.find((v) => v.id === selectedId);
  if (selected) {
    return (
      <VehicleDetailsView
        vehicle={selected}
        onBack={() => setSelectedId(null)}
        onUpdated={(next) => {
          setRows((prev) => prev.map((v) => (v.id === next.id ? next : v)));
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
            <Car className="w-6 h-6 text-[#F15A24]" />
            {verifiedOnly ? 'All cars verified' : 'All vehicles'}
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-1">
            {verifiedOnly
              ? 'Cars admin has already verified. Documents stay in details.'
              : 'Review RC cars. New vehicles start as pending verification.'}
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
            placeholder="Search Vehicle ID (e.g. RB-VH-1001), model, plate, owner…"
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
          icon={Car}
          title="No record found"
          description={
            searchTerm
              ? 'No vehicle matches this search. Try model, plate or owner.'
              : filter === 'pending'
                ? 'No vehicles are waiting for verification.'
                : 'No vehicles in this filter.'
          }
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((veh) => (
            <button
              key={veh.id}
              type="button"
              onClick={() => setSelectedId(veh.id)}
              className="text-left rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-4 space-y-3 active-press"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono font-extrabold text-xs bg-[#1C1C1C] text-white px-2.5 py-1 rounded-xl">
                    {veh.plate}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl text-[10px] font-mono font-extrabold bg-white border border-[#EBE5D8] text-[#1C1C1C] shadow-2xs whitespace-nowrap">
                    <Tag className="w-2.5 h-2.5 text-[#F15A24]" />
                    {veh.displayId || formatVehicleId(veh.id)}
                  </span>
                </div>
                {veh.year ? (
                  <span className="text-[10px] font-extrabold text-[#6B6B6B] bg-white px-2 py-0.5 rounded-lg border border-[#EBE5D8]">
                    {veh.year}
                  </span>
                ) : null}
              </div>
              <div>
                <h3 className="text-sm font-extrabold">
                  {veh.make} {veh.model}
                </h3>
                <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                  {veh.seats} seats{veh.color ? ` · ${veh.color}` : ''}
                  {veh.fuelType ? ` · ${veh.fuelType}` : ''}
                </p>
              </div>
              <div className="pt-2 border-t border-[#EBE5D8] text-xs">
                <p className="font-extrabold">{veh.ownerName}</p>
                <p className="text-[11px] text-[#6B6B6B] font-mono">+91 {veh.ownerPhone}</p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex px-2 py-0.5 rounded-full font-extrabold text-[10px] border ${kycClass(veh.verificationStatus)}`}>
                  {vehicleStatusLabel(veh.verificationStatus)}
                </span>
                <span className="text-[11px] font-extrabold text-[#F15A24] inline-flex items-center gap-0.5">
                  Details <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
