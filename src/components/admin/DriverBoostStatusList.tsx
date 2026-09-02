import React, { useState } from 'react';
import {
  Sparkles,
  ZapOff,
  Zap,
  Clock,
  Car,
  Search,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const DriverBoostStatusList: React.FC = () => {
  const {
    drivers,
    packages,
    driverPackages,
    isDriverBoosted,
    getDriverActivePackage,
    simulatePackageExpiry,
    grantDriverBoost,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredDrivers = drivers.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGrantBoost = (driverId: string, pkgId: string = 'pkg-weekly-boost') => {
    grantDriverBoost(driverId, pkgId);
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-extrabold text-[#1C1C1C]">Legacy boost directory</h3>
          <p className="text-xs text-[#6B6B6B]">Live computed package statuses & rank controls</p>
        </div>
        <span className="text-xs font-extrabold text-[#F15A24] bg-[#FFF0EB] px-2.5 py-1 rounded-full border border-[#FFD8CB]">
          {drivers.filter((d) => isDriverBoosted(d.id)).length} Boosted
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search driver by name or city..."
          className="w-full bg-white border border-[#EBE5D8] rounded-2xl pl-9 pr-3 py-2 text-xs text-[#1C1C1C] focus:outline-none focus:border-[#F15A24]"
        />
      </div>

      {/* Drivers List */}
      <div className="space-y-3">
        {filteredDrivers.map((driver) => {
          const isBoosted = isDriverBoosted(driver.id);
          const activeInfo = getDriverActivePackage(driver.id);
          const rawDp = driverPackages.find((dp) => dp.driverId === driver.id);
          const wasExpired = rawDp && rawDp.expiresAt <= Date.now();

          const daysLeft = activeInfo
            ? Math.max(0, Math.ceil((activeInfo.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)))
            : 0;

          return (
            <div
              key={driver.id}
              className={`bg-white rounded-3xl p-4 border shadow-card space-y-3 transition-all ${
                isBoosted ? 'border-[#FF8A00]' : 'border-[#EBE5D8]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={driver.avatar}
                      alt={driver.name}
                      className="w-11 h-11 rounded-full object-cover border border-[#EBE5D8]"
                    />
                    {isBoosted && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#FF8A00] flex items-center justify-center text-white text-[8px] font-bold">
                        ★
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#1C1C1C] flex items-center gap-1.5">
                      {driver.name}
                    </h4>
                    <p className="text-[10px] text-[#6B6B6B]">
                      {driver.vehicle.make} {driver.vehicle.model} • {driver.city}
                    </p>
                  </div>
                </div>

                <div>
                  {isBoosted ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-white brand-gradient px-2.5 py-0.5 rounded-full shadow-xs">
                      <Sparkles className="w-2.5 h-2.5" />
                      {activeInfo?.pkg?.name || 'Boosted'} ({daysLeft}d)
                    </span>
                  ) : wasExpired ? (
                    <span className="text-[10px] font-semibold text-[#D64545] bg-[#FDEDED] px-2 py-0.5 rounded-full">
                      Expired
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-[#6B6B6B] bg-[#FAF6EE] px-2 py-0.5 rounded-full">
                      No Plan
                    </span>
                  )}
                </div>
              </div>

              {/* Status Details */}
              <div className="bg-[#FAF6EE] rounded-2xl p-2.5 border border-[#EBE5D8] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#6B6B6B]">
                  Search Ranking:
                </span>
                <span className={`font-bold ${isBoosted ? 'text-[#F15A24]' : 'text-[#6B6B6B]'}`}>
                  {isBoosted ? '#1 Featured (Direct Phone Call)' : 'Regular Listing (Phone Masked)'}
                </span>
              </div>

              {/* Action Buttons: Force Expire or Grant Boost */}
              <div className="flex items-center gap-2 pt-1 border-t border-[#F2ECE1]">
                {isBoosted ? (
                  <button
                    onClick={() => {
                      simulatePackageExpiry(driver.id);
                      alert(`⚡ Package expired for ${driver.name}! Their rides have now reverted to regular.`);
                    }}
                    className="flex-1 py-2 rounded-xl bg-[#FDEDED] hover:bg-[#FACBCB] text-[#D64545] font-extrabold text-xs flex items-center justify-center gap-1 active-press"
                  >
                    <ZapOff className="w-3.5 h-3.5" />
                    <span>Simulate Package Expiry</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleGrantBoost(driver.id);
                      alert(`🌟 Weekly Boost granted to ${driver.name}!`);
                    }}
                    className="flex-1 py-2 rounded-xl brand-gradient text-white font-extrabold text-xs flex items-center justify-center gap-1 active-press shadow-xs"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Grant Weekly Boost (₹99)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
