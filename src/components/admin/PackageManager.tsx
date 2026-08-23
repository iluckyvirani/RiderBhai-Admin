import React, { useState } from 'react';
import {
  Package as PackageIcon,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Package } from '../../types';

export const PackageManager: React.FC = () => {
  const { packages, savePackage, deletePackage } = useAppStore();
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState(99);
  const [durationDays, setDurationDays] = useState(7);
  const [badgeText, setBadgeText] = useState('Featured');
  const [benefitsText, setBenefitsText] = useState('Top search ranking\nDirect call button enabled\n3.5x faster seat booking');
  const [isActive, setIsActive] = useState(true);

  const startEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setIsCreatingNew(false);
    setName(pkg.name);
    setPrice(pkg.price);
    setDurationDays(pkg.durationDays);
    setBadgeText(pkg.badgeText || 'Featured');
    setBenefitsText(pkg.benefitsDescription.join('\n'));
    setIsActive(pkg.isActive);
  };

  const startCreate = () => {
    setIsCreatingNew(true);
    setEditingPackage(null);
    setName('Weekend Surge Boost');
    setPrice(149);
    setDurationDays(3);
    setBadgeText('Surge Pro');
    setBenefitsText('Top search placement for 3 weekend days\nInstant SMS notification to riders\nDirect WhatsApp chat button');
    setIsActive(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const benefitsArray = benefitsText
      .split('\n')
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    const pkgToSave: Package = {
      id: editingPackage?.id || `pkg-${Date.now()}`,
      name,
      price: Number(price),
      durationDays: Number(durationDays),
      badgeText,
      benefitsDescription: benefitsArray,
      isActive,
    };

    savePackage(pkgToSave);
    setEditingPackage(null);
    setIsCreatingNew(false);
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-extrabold text-[#1C1C1C]">Package Management (CRUD)</h3>
          <p className="text-xs text-[#6B6B6B]">Configure driver boost plans & pricing</p>
        </div>
        <button
          onClick={startCreate}
          className="py-1.5 px-3 rounded-xl brand-gradient text-white text-xs font-bold flex items-center gap-1 shadow-xs active-press"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Plan</span>
        </button>
      </div>

      {/* Package List */}
      <div className="space-y-3">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-white rounded-3xl p-4 border shadow-card space-y-3 ${
              pkg.isActive ? 'border-[#EBE5D8]' : 'border-gray-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-extrabold text-sm text-[#1C1C1C]">{pkg.name}</h4>
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    pkg.isActive ? 'bg-[#EBF7F0] text-[#2E9E5B]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {pkg.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  Valid: {pkg.durationDays} Days • Badge: "{pkg.badgeText}"
                </p>
              </div>

              <div className="text-right">
                <span className="text-lg font-extrabold text-[#F15A24]">₹{pkg.price}</span>
              </div>
            </div>

            {/* Benefits preview */}
            <div className="bg-[#FAF6EE] rounded-2xl p-2.5 space-y-1 text-[11px] text-[#6B6B6B]">
              {pkg.benefitsDescription.slice(0, 3).map((b, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-[#2E9E5B] flex-shrink-0" />
                  <span className="truncate">{b}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1]">
              <button
                onClick={() => savePackage({ ...pkg, isActive: !pkg.isActive })}
                className="text-xs font-bold text-[#6B6B6B] flex items-center gap-1.5 hover:text-[#1C1C1C]"
              >
                {pkg.isActive ? (
                  <ToggleRight className="w-5 h-5 text-[#2E9E5B]" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
                <span>{pkg.isActive ? 'Enabled' : 'Disabled'}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => startEdit(pkg)}
                  className="py-1 px-2.5 rounded-lg bg-[#FAF6EE] text-[#1C1C1C] text-xs font-bold flex items-center gap-1 hover:bg-[#FFF0EB] hover:text-[#F15A24]"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${pkg.name}?`)) deletePackage(pkg.id);
                  }}
                  className="p-1.5 rounded-lg bg-red-50 text-[#D64545] hover:bg-red-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Form Modal */}
      {(editingPackage || isCreatingNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-[#EBE5D8] animate-scale-in space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-[#1C1C1C]">
                {isCreatingNew ? 'Create Boost Package' : `Edit: ${editingPackage?.name}`}
              </h4>
              <button
                onClick={() => {
                  setEditingPackage(null);
                  setIsCreatingNew(false);
                }}
                className="w-7 h-7 rounded-full bg-[#FAF6EE] flex items-center justify-center text-[#6B6B6B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-[#6B6B6B] uppercase block mb-1">
                  Package Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF6EE] border border-[#EBE5D8] rounded-xl px-3 py-2 text-xs font-bold text-[#1C1C1C]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#6B6B6B] uppercase block mb-1">
                    Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-[#FAF6EE] border border-[#EBE5D8] rounded-xl px-3 py-2 text-xs font-bold text-[#1C1C1C]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#6B6B6B] uppercase block mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full bg-[#FAF6EE] border border-[#EBE5D8] rounded-xl px-3 py-2 text-xs font-bold text-[#1C1C1C]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#6B6B6B] uppercase block mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full bg-[#FAF6EE] border border-[#EBE5D8] rounded-xl px-3 py-2 text-xs font-bold text-[#1C1C1C]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#6B6B6B] uppercase block mb-1">
                  Benefits (One per line)
                </label>
                <textarea
                  rows={3}
                  value={benefitsText}
                  onChange={(e) => setBenefitsText(e.target.value)}
                  className="w-full bg-[#FAF6EE] border border-[#EBE5D8] rounded-xl p-2.5 text-xs text-[#1C1C1C]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activePkgToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-[#F15A24]"
                />
                <label htmlFor="activePkgToggle" className="text-xs font-bold text-[#1C1C1C]">
                  Active for Drivers to Purchase
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl brand-gradient text-white font-extrabold text-xs shadow-md active-press flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Package</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
