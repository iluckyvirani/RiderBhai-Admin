import React, { useState } from 'react';
import {
  PackageCheck,
  Plus,
  Edit2,
  Trash2,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { AgencyPackage } from '../../types';

export const AgencyPackageManager: React.FC = () => {
  const { agencyPackages, saveAgencyPackage, deleteAgencyPackage } = useAppStore();

  const [editingPkg, setEditingPkg] = useState<AgencyPackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState(1499);
  const [durationDays, setDurationDays] = useState(30);
  const [postLimit, setPostLimit] = useState(9999);
  const [badgeText, setBadgeText] = useState('Pro Operator');
  const [benefits, setBenefits] = useState<string[]>([
    'Unlimited tour postings',
    'Direct WhatsApp & phone call button',
    'Featured placement on driver dashboard',
  ]);
  const [popular, setPopular] = useState(false);

  const handleOpenNew = () => {
    setEditingPkg(null);
    setName('');
    setPrice(999);
    setDurationDays(30);
    setPostLimit(50);
    setBadgeText('Agency Plan');
    setBenefits(['Post up to 50 tour leads', 'Direct driver WhatsApp button', 'Zero platform commission']);
    setPopular(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: AgencyPackage) => {
    setEditingPkg(pkg);
    setName(pkg.name);
    setPrice(pkg.price);
    setDurationDays(pkg.durationDays);
    setPostLimit(pkg.postLimit);
    setBadgeText(pkg.badgeText);
    setBenefits(pkg.benefitsDescription);
    setPopular(Boolean(pkg.popular));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newPkg: AgencyPackage = {
      id: editingPkg ? editingPkg.id : `pkg-agency-${Date.now()}`,
      name,
      price: Number(price),
      durationDays: Number(durationDays),
      postLimit: Number(postLimit),
      badgeText,
      benefitsDescription: benefits.filter(Boolean),
      isActive: true,
      popular,
    };

    saveAgencyPackage(newPkg);
    setIsModalOpen(false);
  };

  const handleAddBenefit = () => {
    setBenefits([...benefits, '']);
  };

  const handleBenefitChange = (index: number, val: string) => {
    const updated = [...benefits];
    updated[index] = val;
    setBenefits(updated);
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C1C1C]">
            Travel Agency Posting Packages ({agencyPackages.length})
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Define pricing, post limits, and validity for Travel Agency tour subscriptions
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-2xl bg-[#F15A24] hover:bg-[#d94815] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active-press self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Agency Plan</span>
        </button>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {agencyPackages.map((pkg) => (
          <div
            key={pkg.id}
            className={`p-6 rounded-3xl bg-white border shadow-card flex flex-col justify-between relative overflow-hidden ${
              pkg.popular ? 'border-[#F15A24] ring-2 ring-[#F15A24]/10' : 'border-[#EBE5D8]'
            }`}
          >
            {pkg.popular && (
              <div className="absolute top-0 right-0 bg-[#F15A24] text-white text-[9px] font-extrabold px-3 py-1 rounded-bl-xl uppercase">
                Popular
              </div>
            )}

            <div>
              <span className="text-[10px] font-extrabold text-[#F15A24] uppercase tracking-wider">
                {pkg.badgeText}
              </span>
              <h3 className="text-base font-extrabold text-[#1C1C1C] mt-1">
                {pkg.name}
              </h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-[#1C1C1C]">
                  ₹{pkg.price.toLocaleString()}
                </span>
                <span className="text-xs text-[#6B6B6B]">
                  / {pkg.durationDays} days ({pkg.postLimit > 5000 ? 'Unlimited' : `${pkg.postLimit} posts`})
                </span>
              </div>

              {/* Benefits */}
              <div className="mt-5 pt-4 border-t border-[#FAF6EE] space-y-2">
                {pkg.benefitsDescription.map((b, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#6B6B6B]">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-[#FAF6EE] flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(pkg)}
                className="p-2 rounded-xl hover:bg-[#FAF6EE] text-[#1C1C1C] text-xs font-bold flex items-center gap-1.5 border border-[#EBE5D8]"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete plan ${pkg.name}?`)) {
                    deleteAgencyPackage(pkg.id);
                  }
                }}
                className="p-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors"
                title="Delete Plan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#EBE5D8] space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#FAF6EE]">
              <h3 className="text-sm font-extrabold text-[#1C1C1C]">
                {editingPkg ? 'Edit Agency Package' : 'Create Agency Package'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#FAF6EE] text-[#6B6B6B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#6B6B6B] mb-1">
                  Package Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Agency Pro Monthly"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-[#EBE5D8] text-xs font-bold text-[#1C1C1C] bg-[#FAF6EE] focus:bg-white focus:border-[#F15A24] outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#6B6B6B] mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min={0}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EBE5D8] text-xs font-bold text-[#1C1C1C] bg-[#FAF6EE] focus:bg-white focus:border-[#F15A24] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#6B6B6B] mb-1">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EBE5D8] text-xs font-bold text-[#1C1C1C] bg-[#FAF6EE] focus:bg-white focus:border-[#F15A24] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#6B6B6B] mb-1">
                    Post Limit (9999 = Unl)
                  </label>
                  <input
                    type="number"
                    value={postLimit}
                    onChange={(e) => setPostLimit(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EBE5D8] text-xs font-bold text-[#1C1C1C] bg-[#FAF6EE] focus:bg-white focus:border-[#F15A24] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6B6B6B] mb-1">
                  Badge Tag (e.g. Verified Partner, Top Operator)
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#EBE5D8] text-xs font-bold text-[#1C1C1C] bg-[#FAF6EE] focus:bg-white focus:border-[#F15A24] outline-none"
                />
              </div>

              {/* Benefits list */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#6B6B6B]">
                    Plan Benefits / Bullet Points
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="text-[11px] font-bold text-[#F15A24] hover:underline"
                  >
                    + Add Bullet
                  </button>
                </div>
                <div className="space-y-2">
                  {benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={b}
                        onChange={(e) => handleBenefitChange(i, e.target.value)}
                        placeholder="e.g. Direct driver WhatsApp button"
                        className="flex-1 px-3 py-2 rounded-xl border border-[#EBE5D8] text-xs font-medium text-[#1C1C1C] bg-[#FAF6EE] focus:bg-white focus:border-[#F15A24] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(i)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  className="w-4 h-4 rounded text-[#F15A24] accent-[#F15A24]"
                />
                <span className="text-xs font-bold text-[#1C1C1C]">
                  Mark as &quot;Most Popular&quot; featured plan
                </span>
              </label>

              <div className="pt-3 border-t border-[#FAF6EE] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6B6B6B] hover:bg-[#FAF6EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#F15A24] hover:bg-[#d94815] text-white text-xs font-bold shadow-sm active-press"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
