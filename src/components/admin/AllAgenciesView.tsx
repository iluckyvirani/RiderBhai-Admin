import React, { useState } from 'react';
import {
  Building,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  PackageCheck,
  Calendar,
  Sparkles,
  Zap,
  MoreVertical
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const AllAgenciesView: React.FC = () => {
  const {
    agencies,
    agencySubscriptions,
    agencyPackages,
    agencyTripPosts,
    adminVerifyAgency,
    purchaseAgencyPackage,
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending' | 'unverified'>('all');

  const filtered = agencies.filter((a) => {
    if (filter === 'verified' && a.status !== 'verified') return false;
    if (filter === 'pending' && a.status !== 'pending_verification') return false;
    if (filter === 'unverified' && a.status !== 'unverified') return false;

    if (search) {
      const q = search.toLowerCase();
      return (
        a.agencyName.toLowerCase().includes(q) ||
        a.ownerName.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C1C1C]">
            Partner firms ({agencies.length})
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Travel firms that post cars and tours. Posting plans are the only in-app payment.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-[#FAF6EE] p-1 rounded-2xl border border-[#EBE5D8]">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all' ? 'bg-[#1C1C1C] text-white shadow-xs' : 'text-[#6B6B6B]'
            }`}
          >
            All ({agencies.length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'verified' ? 'bg-emerald-600 text-white shadow-xs' : 'text-[#6B6B6B]'
            }`}
          >
            Verified ({agencies.filter((a) => a.status === 'verified').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'pending' ? 'bg-[#F15A24] text-white shadow-xs' : 'text-[#6B6B6B]'
            }`}
          >
            Pending KYC ({agencies.filter((a) => a.status === 'pending_verification').length})
          </button>
        </div>
      </div>

      {/* Search Box */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search agency by firm name, owner name, city, phone..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#EBE5D8] text-xs font-medium text-[#1C1C1C] bg-white focus:border-[#F15A24] outline-none"
        />
      </div>

      {/* Table / Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((agency) => {
          const activeSub = agencySubscriptions.find(
            (s) => s.agencyId === agency.id && s.expiresAt > Date.now()
          );
          const pkg = activeSub
            ? agencyPackages.find((p) => p.id === activeSub.packageId)
            : null;
          const postsCount = agencyTripPosts.filter((p) => p.agencyId === agency.id).length;

          return (
            <div
              key={agency.id}
              className="p-5 rounded-3xl bg-white border border-[#EBE5D8] shadow-card hover:border-[#F15A24]/40 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#F15A24] font-black text-base flex items-center justify-center border border-orange-100">
                    {agency.agencyName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1C1C1C]">
                      {agency.agencyName}
                    </h3>
                    <p className="text-xs text-[#6B6B6B]">
                      Owner: <strong>{agency.ownerName}</strong>
                    </p>
                    <p className="text-[11px] text-[#6B6B6B] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#F15A24]" />
                      {agency.city}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    agency.status === 'verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : agency.status === 'pending_verification'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  {agency.status}
                </span>
              </div>

              {/* Contact & Subscription stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8]">
                  <span className="text-[10px] text-[#6B6B6B] block">Active Plan</span>
                  <strong className="text-xs text-[#F15A24]">
                    {pkg ? pkg.name : 'No Active Plan'}
                  </strong>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8]">
                  <span className="text-[10px] text-[#6B6B6B] block">Tours Posted</span>
                  <strong className="text-xs text-[#1C1C1C]">
                    {postsCount} Tour Leads
                  </strong>
                </div>
              </div>

              {/* Footer Quick Controls */}
              <div className="pt-2 border-t border-[#FAF6EE] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${agency.phone}`}
                    className="text-xs font-bold text-[#6B6B6B] hover:text-[#1C1C1C] flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{agency.phone}</span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  {agency.status !== 'verified' ? (
                    <button
                      onClick={() => adminVerifyAgency(agency.id, 'verified')}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold"
                    >
                      Verify
                    </button>
                  ) : (
                    <button
                      onClick={() => purchaseAgencyPackage(agency.id, 'pkg-agency-pro')}
                      className="px-3 py-1 rounded-xl bg-orange-100 hover:bg-orange-200 text-[#F15A24] text-[11px] font-bold flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Grant Pro</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
