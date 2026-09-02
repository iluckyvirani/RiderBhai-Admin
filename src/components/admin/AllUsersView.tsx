import React, { useState } from 'react';
import {
  Users,
  Search,
  Star,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Car
} from 'lucide-react';
import { CURRENT_RIDER, OTHER_RIDERS } from '../../data/mockRiders';
import { useAppStore } from '../../store/useAppStore';

export const AllUsersView: React.FC = () => {
  const { bookings } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const allRiders = [
    CURRENT_RIDER,
    ...OTHER_RIDERS,
    {
      id: 'rdr-5',
      name: 'Pooja Hegde',
      phone: '+91 98330 11998',
      email: 'pooja.h@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      gender: 'female' as const,
      city: 'Delhi NCR',
      idVerified: true,
      emergencyContact: '+91 98220 99881 (Mother)',
      rating: 4.9,
      totalRides: 7,
      memberSince: 'Jan 2024',
    },
  ];

  const filteredRiders = allRiders.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm) ||
      r.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C1C1C] flex items-center gap-2 font-display">
            <Users className="w-6 h-6 text-[#F15A24]" />
            <span>Customers</span>
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            People who browse cars and tours, then Call / WhatsApp the partner. No in-app customer payment.
          </p>
        </div>

        <span className="text-xs font-extrabold bg-[#FFF0EB] text-[#F15A24] px-3 py-1.5 rounded-2xl border border-[#FFD8CB] w-fit">
          Total: {allRiders.length} Active Riders
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
            placeholder="Search rider by name, phone, city..."
            className="w-full text-xs font-bold text-[#1C1C1C] bg-white pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EBE5D8] focus:outline-none focus:border-[#F15A24]"
          />
        </div>
      </div>

      {/* Riders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#EBE5D8] text-[#6B6B6B] uppercase font-bold text-[10px] tracking-wider bg-[#FAF6EE]/50">
              <th className="py-3 px-4">Rider Profile</th>
              <th className="py-3 px-4">City</th>
              <th className="py-3 px-4">Emergency Contact</th>
              <th className="py-3 px-4">Trips Taken</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4">ID Verification</th>
              <th className="py-3 px-4 text-right">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2ECE1]">
            {filteredRiders.map((rider) => (
              <tr key={rider.id} className="hover:bg-[#FFFDF9] transition-colors">
                {/* Profile */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={rider.avatar}
                      alt={rider.name}
                      className="w-10 h-10 rounded-2xl object-cover border border-[#EBE5D8] shadow-xs flex-shrink-0"
                    />
                    <div>
                      <p className="font-extrabold text-[#1C1C1C] text-xs">{rider.name}</p>
                      <p className="text-[11px] text-[#6B6B6B] font-mono">{rider.phone}</p>
                    </div>
                  </div>
                </td>

                {/* City */}
                <td className="py-3.5 px-4 font-bold text-[#1C1C1C]">
                  <div className="flex items-center gap-1 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-[#F15A24]" />
                    <span>{rider.city}</span>
                  </div>
                </td>

                {/* Emergency Contact */}
                <td className="py-3.5 px-4 text-xs text-[#6B6B6B]">
                  {rider.emergencyContact ? (
                    <span className="font-medium">{rider.emergencyContact}</span>
                  ) : (
                    <span className="text-gray-400 italic">Not specified</span>
                  )}
                </td>

                {/* Trips */}
                <td className="py-3.5 px-4 font-extrabold text-xs text-[#1C1C1C]">
                  {rider.totalRides} Trips
                </td>

                {/* Rating */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-extrabold text-xs text-[#1C1C1C]">{rider.rating}</span>
                  </div>
                </td>

                {/* ID Status */}
                <td className="py-3.5 px-4">
                  {rider.idVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EBF7EE] text-[#00A86B] font-extrabold text-[10px] border border-[#BDE8C7]">
                      <ShieldCheck className="w-3 h-3" />
                      Aadhaar Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF6EE] text-[#6B6B6B] font-bold text-[10px] border border-[#EBE5D8]">
                      Unverified
                    </span>
                  )}
                </td>

                {/* Member Since */}
                <td className="py-3.5 px-4 text-right text-xs text-[#6B6B6B] font-medium">
                  {rider.memberSince}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
