import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Building,
  Trash2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const AgencyTourPostsManager: React.FC = () => {
  const { agencyTripPosts, updateAgencyTripPosts, updateAgencyTripStatus } = useAppStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');

  const filteredPosts = agencyTripPosts.filter((post) => {
    if (statusFilter === 'active' && post.status !== 'active') return false;
    if (statusFilter === 'closed' && post.status !== 'closed' && post.status !== 'claimed' && post.status !== 'completed')
      return false;

    if (search) {
      const q = search.toLowerCase();
      return (
        post.fromCity.toLowerCase().includes(q) ||
        post.toCity.toLowerCase().includes(q) ||
        post.agencyName.toLowerCase().includes(q) ||
        post.tripDetails.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDelete = (id: string) => {
    if (confirm('Delete this tour lead post from the platform?')) {
      updateAgencyTripPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C1C1C]">
            Tour packages ({agencyTripPosts.length})
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Partner tour posts. Customers Call / WhatsApp — no in-app pay. Close a tour after the partner confirms offline.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-[#FAF6EE] p-1 rounded-2xl border border-[#EBE5D8]">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all' ? 'bg-[#1C1C1C] text-white shadow-xs' : 'text-[#6B6B6B]'
            }`}
          >
            All ({agencyTripPosts.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'active' ? 'bg-emerald-600 text-white shadow-xs' : 'text-[#6B6B6B]'
            }`}
          >
            Live ({agencyTripPosts.filter((p) => p.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('closed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'closed' ? 'bg-[#F15A24] text-white shadow-xs' : 'text-[#6B6B6B]'
            }`}
          >
            Closed (
            {
              agencyTripPosts.filter((p) => p.status === 'closed' || p.status === 'claimed' || p.status === 'completed')
                .length
            }
            )
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by city (Agra, Jaipur, Manali...), agency name, itinerary..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#EBE5D8] text-xs font-medium text-[#1C1C1C] bg-white focus:border-[#F15A24] outline-none"
        />
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center bg-[#FAF6EE] rounded-3xl border border-[#EBE5D8]">
            <Building className="w-10 h-10 text-[#C4BCAB] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#1C1C1C]">No tour packages found</p>
            <p className="text-xs text-[#6B6B6B] mt-1">Try clearing search or filter query.</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-5 rounded-3xl bg-white border border-[#EBE5D8] shadow-card space-y-3.5 hover:border-[#F15A24]/40 transition-all"
            >
              {/* Header: Agency Info & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#F15A24] flex items-center justify-center font-bold text-xs">
                    {post.agencyName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-[#1C1C1C]">
                      {post.agencyName}
                    </h3>
                    <p className="text-[10px] text-[#6B6B6B]">
                      {post.agencyCity} • Phone: {post.agencyPhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      post.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    {post.status}
                  </span>
                  {post.status === 'active' && (
                    <button
                      onClick={() => updateAgencyTripStatus(post.id, 'closed')}
                      className="px-2 py-1 rounded-lg bg-[#1C1C1C] text-white text-[10px] font-extrabold"
                    >
                      Close & hide
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Route & Tour Specs */}
              <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-black text-[#1C1C1C]">
                    <MapPin className="w-4 h-4 text-[#F15A24]" />
                    <span>{post.fromCity}</span>
                    <span className="text-[#F15A24]">→</span>
                    <span>{post.toCity}</span>
                  </div>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    {post.passengers} Pax • {post.duration} • Vehicle: <strong>{post.requiredVehicleType}</strong>
                    {post.desiredCar?.name ? ` • Desired: ${post.desiredCar.name}` : ''}
                  </p>
                  {post.desiredCar?.specs?.length ? (
                    <p className="text-[10px] text-[#6B6B6B] mt-0.5">
                      Specs: {post.desiredCar.specs.filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                </div>

                {/* Financial breakdown */}
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-[#6B6B6B] block">Client Total</span>
                    <strong className="text-xs text-[#1C1C1C]">₹{post.totalCustomerPrice}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6B6B6B] block">Partner cut</span>
                    <strong className="text-xs text-[#F15A24]">₹{post.agencyCommission}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#00A86B] font-bold block">Net to car</span>
                    <strong className="text-sm font-black text-[#00A86B]">₹{post.driverNetPayout}</strong>
                  </div>
                </div>
              </div>

              {/* Itinerary Preview */}
              <p className="text-xs text-[#555555] leading-relaxed bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 whitespace-pre-line">
                {post.tripDetails}
              </p>

              {/* Extended Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                {post.tourType && (
                  <div className="p-2 rounded-lg bg-[#FAF6EE] border border-[#EBE5D8]">
                    <span className="text-[#6B6B6B] block">Category</span>
                    <strong className="text-[#1C1C1C] truncate block">{post.tourType}</strong>
                  </div>
                )}
                {post.tollTaxOption && (
                  <div className="p-2 rounded-lg bg-[#FAF6EE] border border-[#EBE5D8]">
                    <span className="text-[#6B6B6B] block">Toll Rule</span>
                    <strong className="text-[#1C1C1C] truncate block">{post.tollTaxOption}</strong>
                  </div>
                )}
                {post.driverNightAllowance && (
                  <div className="p-2 rounded-lg bg-[#FAF6EE] border border-[#EBE5D8]">
                    <span className="text-[#6B6B6B] block">Night Allowance</span>
                    <strong className="text-[#00A86B] truncate block">{post.driverNightAllowance}</strong>
                  </div>
                )}
                {post.kmLimit && (
                  <div className="p-2 rounded-lg bg-[#FAF6EE] border border-[#EBE5D8]">
                    <span className="text-[#6B6B6B] block">Km Limit</span>
                    <strong className="text-[#1C1C1C] truncate block">{post.kmLimit}</strong>
                  </div>
                )}
              </div>

              {/* Claimed Driver Details if any */}
              {post.claimedByDriverName && (
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
                  <span>
                    Claimed by: <strong>{post.claimedByDriverName}</strong> ({post.claimedByDriverPhone})
                  </span>
                  <span className="text-[10px] text-blue-700">
                    {post.claimedAt ? new Date(post.claimedAt).toLocaleDateString() : ''}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
