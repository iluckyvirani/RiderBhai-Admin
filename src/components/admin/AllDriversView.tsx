import React, { useState } from 'react';
import {
  Car,
  Search,
  Star,
  ShieldCheck,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Filter,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Driver } from '../../types';
import { DriverDetailModal } from './DriverDetailModal';

export const AllDriversView: React.FC = () => {
  const { drivers, isDriverBoosted, simulateDriverStatusChange, grantDriverBoost } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending_verification' | 'unverified' | 'rejected'>('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm) ||
      d.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C1C1C] flex items-center gap-2 font-display">
            <Car className="w-6 h-6 text-[#F15A24]" />
            <span>All partners</span>
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Drivers and travel firms in one partner list — KYC, cars, and posting-plan status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold bg-[#FFF0EB] text-[#F15A24] px-3 py-1.5 rounded-2xl border border-[#FFD8CB]">
            Total: {drivers.length} Partners
          </span>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EBE5D8] flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Box */}
        <div className="relative w-full sm:w-80">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, city, plate..."
            className="w-full text-xs font-bold text-[#1C1C1C] bg-white pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EBE5D8] focus:outline-none focus:border-[#F15A24]"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'verified', label: 'Verified' },
            { id: 'pending_verification', label: 'Pending KYC' },
            { id: 'unverified', label: 'Unverified' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 active-press ${
                statusFilter === pill.id
                  ? 'bg-[#F15A24] text-white shadow-xs'
                  : 'bg-white text-[#6B6B6B] border border-[#EBE5D8] hover:text-[#1C1C1C]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drivers Table / Cards */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#EBE5D8] text-[#6B6B6B] uppercase font-bold text-[10px] tracking-wider bg-[#FAF6EE]/50">
              <th className="py-3 px-4">Driver Profile</th>
              <th className="py-3 px-4">City</th>
              <th className="py-3 px-4">Vehicle Details</th>
              <th className="py-3 px-4">Rides & Rating</th>
              <th className="py-3 px-4">KYC Status</th>
              <th className="py-3 px-4">Boost Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2ECE1]">
            {filteredDrivers.map((driver) => {
              const boosted = isDriverBoosted(driver.id);
              return (
                <tr
                  key={driver.id}
                  className="hover:bg-[#FFFDF9] transition-colors cursor-pointer"
                  onClick={() => setSelectedDriver(driver)}
                >
                  {/* Profile */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={driver.avatar}
                        alt={driver.name}
                        className="w-10 h-10 rounded-2xl object-cover border border-[#EBE5D8] shadow-xs flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-extrabold text-[#1C1C1C] text-xs hover:text-[#F15A24] transition-colors">
                            {driver.name}
                          </p>
                          {driver.idVerified && (
                            <span title="Aadhaar Verified">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#00A86B]" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#6B6B6B] font-mono">{driver.phone}</p>
                      </div>
                    </div>
                  </td>

                  {/* City */}
                  <td className="py-3.5 px-4 font-bold text-[#1C1C1C]">
                    <div className="flex items-center gap-1 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-[#F15A24]" />
                      <span>{driver.city}</span>
                    </div>
                  </td>

                  {/* Vehicle */}
                  <td className="py-3.5 px-4">
                    <div>
                      <p className="font-extrabold text-[#1C1C1C] text-xs">
                        {driver.vehicle.make} {driver.vehicle.model}
                      </p>
                      <span className="text-[10px] font-mono font-bold bg-[#FAF6EE] px-1.5 py-0.5 rounded border border-[#EBE5D8] text-[#1C1C1C]">
                        {driver.vehicle.plate}
                      </span>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-extrabold text-xs text-[#1C1C1C]">{driver.rating}</span>
                      <span className="text-[10px] text-[#6B6B6B]">({driver.totalRides} rides)</span>
                    </div>
                  </td>

                  {/* KYC Status */}
                  <td className="py-3.5 px-4">
                    {driver.status === 'verified' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EBF7EE] text-[#00A86B] font-extrabold text-[10px] border border-[#BDE8C7]">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {driver.status === 'pending_verification' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-extrabold text-[10px] border border-amber-200">
                        <AlertTriangle className="w-3 h-3" />
                        Pending Review
                      </span>
                    )}
                    {driver.status === 'unverified' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF6EE] text-[#6B6B6B] font-bold text-[10px] border border-[#EBE5D8]">
                        Unverified
                      </span>
                    )}
                    {driver.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-extrabold text-[10px] border border-red-200">
                        <XCircle className="w-3 h-3" />
                        Rejected
                      </span>
                    )}
                  </td>

                  {/* Boost Status */}
                  <td className="py-3.5 px-4">
                    {boosted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF0EB] text-[#F15A24] font-extrabold text-[10px] border border-[#FFD8CB] shadow-xs animate-pulse">
                        <Sparkles className="w-3 h-3" />
                        Active Boost
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#6B6B6B] font-bold">Standard</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedDriver(driver)}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF6EE] hover:bg-[#1C1C1C] text-[#1C1C1C] hover:text-white font-extrabold text-[11px] border border-[#EBE5D8] transition-all flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      {driver.status !== 'verified' ? (
                        <button
                          onClick={() => simulateDriverStatusChange(driver.id, 'verified')}
                          className="px-2.5 py-1 rounded-lg bg-[#EBF7EE] hover:bg-[#00A86B] text-[#00A86B] hover:text-white font-extrabold text-[11px] border border-[#BDE8C7] transition-all"
                        >
                          Verify
                        </button>
                      ) : (
                        <button
                          onClick={() => simulateDriverStatusChange(driver.id, 'rejected', 'Suspended by admin')}
                          className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-extrabold text-[11px] border border-red-200 transition-all"
                          title="Suspend Driver"
                        >
                          Suspend
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

      {/* Driver Details Comprehensive Modal */}
      {selectedDriver && (
        <DriverDetailModal
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
        />
      )}
    </div>
  );
};
