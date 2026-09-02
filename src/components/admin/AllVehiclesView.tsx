import React, { useState } from 'react';
import {
  Car,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  Users,
  Wind,
  Eye
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Driver } from '../../types';
import { DriverDetailModal } from './DriverDetailModal';

export const AllVehiclesView: React.FC = () => {
  const { drivers } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const vehicles = drivers.map((d) => ({
    ...d.vehicle,
    driver: d,
    driverId: d.id,
    driverName: d.name,
    driverPhone: d.phone,
    driverCity: d.city,
    driverStatus: d.status,
    rcVerified: d.status === 'verified',
  }));

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C1C1C] flex items-center gap-2 font-display">
            <Car className="w-6 h-6 text-[#F15A24]" />
            <span>Partner cars (My Cars)</span>
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Cars saved on partner profiles. Full-car hire only — customers contact via Call / WhatsApp.
          </p>
        </div>

        <span className="text-xs font-extrabold bg-[#FFF0EB] text-[#F15A24] px-3 py-1.5 rounded-2xl border border-[#FFD8CB] w-fit">
          Total: {vehicles.length} Vehicles
        </span>
      </div>

      {/* Search Bar */}
      <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EBE5D8] flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vehicle model, plate, driver..."
            className="w-full text-xs font-bold text-[#1C1C1C] bg-white pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EBE5D8] focus:outline-none focus:border-[#F15A24]"
          />
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVehicles.map((veh, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedDriver(veh.driver)}
            className="bg-white rounded-3xl p-5 border border-[#EBE5D8] shadow-card hover:shadow-lg transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
          >
            <div>
              {/* Top plate and year */}
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-xs bg-[#1C1C1C] text-white px-2.5 py-1 rounded-xl shadow-xs">
                  {veh.plate}
                </span>
                <span className="text-[10px] font-extrabold text-[#6B6B6B] bg-[#FAF6EE] px-2 py-0.5 rounded-lg border border-[#EBE5D8]">
                  Model {veh.year}
                </span>
              </div>

              {/* Vehicle Title */}
              <div className="mt-3">
                <h3 className="text-base font-extrabold text-[#1C1C1C] group-hover:text-[#F15A24] transition-colors">
                  {veh.make} {veh.model}
                </h3>
                <p className="text-xs text-[#6B6B6B] flex items-center gap-1.5 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                  <span>Color: {veh.color}</span>
                  <span>•</span>
                  <span>{veh.seats} Passenger Seats</span>
                </p>
              </div>

              {/* Driver Owner */}
              <div className="mt-4 pt-3 border-t border-[#F2ECE1] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={veh.driver.avatar}
                    alt={veh.driverName}
                    className="w-7 h-7 rounded-xl object-cover border border-[#EBE5D8]"
                  />
                  <div>
                    <p className="font-bold text-[#1C1C1C] leading-none">{veh.driverName}</p>
                    <p className="text-[10px] text-[#6B6B6B] mt-0.5 font-mono">{veh.driverPhone}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#6B6B6B]">{veh.driverCity}</span>
                </div>
              </div>
            </div>

            {/* RC Verification Status & Action */}
            <div className="pt-2 border-t border-[#F2ECE1] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#6B6B6B] font-bold">Registration RC:</span>
              <div className="flex items-center gap-2">
                {veh.rcVerified ? (
                  <span className="inline-flex items-center gap-1 text-[#00A86B] font-extrabold text-[11px] bg-[#EBF7EE] px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-600 font-extrabold text-[11px] bg-amber-50 px-2 py-0.5 rounded-md">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Pending
                  </span>
                )}
                <span className="text-[10px] font-bold text-[#F15A24] flex items-center gap-0.5">
                  <Eye className="w-3 h-3" />
                  Details
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Driver & Vehicle Detail Modal */}
      {selectedDriver && (
        <DriverDetailModal
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
        />
      )}
    </div>
  );
};
