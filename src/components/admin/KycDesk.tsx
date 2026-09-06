import React from 'react';
import { ShieldCheck, IdCard, Car } from 'lucide-react';
import { UserKycQueue } from './UserKycQueue';
import { AllDriversView } from './AllDriversView';
import { AllVehiclesView } from './AllVehiclesView';

export type KycKind = 'users' | 'drivers' | 'vehicles';

export const KycDesk: React.FC<{
  kind: KycKind;
  onKindChange: (kind: KycKind) => void;
}> = ({ kind, onKindChange }) => {
  const tabs: { id: KycKind; label: string; icon: typeof Car }[] = [
    { id: 'users', label: 'Users', icon: ShieldCheck },
    { id: 'drivers', label: 'Drivers', icon: IdCard },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-[#1C1C1C]">KYC</h2>
        <p className="text-xs text-[#6B6B6B] mt-1">
          Verify users, drivers and vehicles in one place. Filter by pending, verified or rejected.
        </p>
      </div>

      <div className="flex gap-1 p-1 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] w-full sm:w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = kind === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onKindChange(tab.id)}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold ${
                active ? 'bg-[#1C1C1C] text-white' : 'text-[#6B6B6B]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {kind === 'users' && <UserKycQueue hideTitle />}
      {kind === 'drivers' && <AllDriversView hideTitle />}
      {kind === 'vehicles' && <AllVehiclesView hideTitle />}
    </div>
  );
};
