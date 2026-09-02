import React, { useState } from 'react';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  PlayCircle,
  MapPin,
  Star,
  User,
  Car,
  Key,
  Filter,
  Eye,
  IndianRupee
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { BookingStatus, Booking } from '../../types';

export const AllBookingsView: React.FC = () => {
  const { bookings, rides, drivers, currentRider } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const enrichedBookings = bookings.map((b) => {
    const ride = rides.find((r) => r.id === b.rideId);
    const driver = drivers.find((d) => d.id === b.driverId);
    return {
      ...b,
      ride,
      driver,
      rider: currentRider,
    };
  });

  const filteredBookings = enrichedBookings.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.ride && (b.ride.fromCity.toLowerCase().includes(searchTerm.toLowerCase()) || b.ride.toCity.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (b.driver && b.driver.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      b.rider.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EBF7EE] text-[#00A86B] font-extrabold text-[10px] border border-[#BDE8C7]">
            <CheckCircle2 className="w-3 h-3" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-extrabold text-[10px] border border-amber-200">
            <Clock className="w-3 h-3" />
            Pending Approval
          </span>
        );
      case 'started':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[10px] border border-blue-200 animate-pulse">
            <PlayCircle className="w-3 h-3" />
            In Transit
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-extrabold text-[10px] border border-purple-200">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'cancelled':
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-extrabold text-[10px] border border-red-200">
            <XCircle className="w-3 h-3" />
            {status === 'cancelled' ? 'Cancelled' : 'Declined'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C1C1C] flex items-center gap-2 font-display">
            <CalendarCheck className="w-6 h-6 text-[#F15A24]" />
            <span>Legacy seat booking log</span>
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Older per-seat records kept for demo history. Live marketplace uses Call / WhatsApp inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold bg-[#FFF0EB] text-[#F15A24] px-3 py-1.5 rounded-2xl border border-[#FFD8CB]">
            Total: {bookings.length} Bookings
          </span>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EBE5D8]">
          <p className="text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider">Confirmed Rides</p>
          <p className="text-xl font-extrabold text-[#00A86B] mt-0.5">
            {bookings.filter((b) => b.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EBE5D8]">
          <p className="text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider">In Transit / Started</p>
          <p className="text-xl font-extrabold text-blue-600 mt-0.5">
            {bookings.filter((b) => b.status === 'started').length}
          </p>
        </div>
        <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EBE5D8]">
          <p className="text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider">Completed Trips</p>
          <p className="text-xl font-extrabold text-purple-600 mt-0.5">
            {bookings.filter((b) => b.status === 'completed').length}
          </p>
        </div>
        <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EBE5D8]">
          <p className="text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider">Pending Approval</p>
          <p className="text-xl font-extrabold text-amber-600 mt-0.5">
            {bookings.filter((b) => b.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EBE5D8] flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search booking ID, route, passenger, driver..."
            className="w-full text-xs font-bold text-[#1C1C1C] bg-white pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EBE5D8] focus:outline-none focus:border-[#F15A24]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'pending', label: 'Pending' },
            { id: 'started', label: 'Started' },
            { id: 'completed', label: 'Completed' },
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

      {/* Bookings Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#EBE5D8] text-[#6B6B6B] uppercase font-bold text-[10px] tracking-wider bg-[#FAF6EE]/50">
              <th className="py-3 px-4">Booking Ref</th>
              <th className="py-3 px-4">Intercity Route</th>
              <th className="py-3 px-4">Passenger / Rider</th>
              <th className="py-3 px-4">Driver Partner</th>
              <th className="py-3 px-4">Seats & Fare</th>
              <th className="py-3 px-4">Pickup OTP</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Booked At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2ECE1]">
            {filteredBookings.map((b) => (
              <tr key={b.id} className="hover:bg-[#FFFDF9] transition-colors">
                {/* Ref */}
                <td className="py-3.5 px-4 font-mono font-extrabold text-xs text-[#1C1C1C]">
                  {b.id.toUpperCase()}
                </td>

                {/* Route */}
                <td className="py-3.5 px-4">
                  <div>
                    <p className="font-extrabold text-[#1C1C1C] text-xs">
                      {b.ride ? `${b.ride.fromCity} → ${b.ride.toCity}` : 'Intercity Journey'}
                    </p>
                    <p className="text-[10px] text-[#6B6B6B]">
                      {b.ride?.date} • {b.ride?.departureTime}
                    </p>
                  </div>
                </td>

                {/* Rider */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={b.rider.avatar}
                      alt={b.rider.name}
                      className="w-7 h-7 rounded-xl object-cover border border-[#EBE5D8]"
                    />
                    <div>
                      <p className="font-bold text-[#1C1C1C] text-xs leading-none">{b.rider.name}</p>
                      <p className="text-[10px] text-[#6B6B6B] font-mono mt-0.5">{b.rider.phone}</p>
                    </div>
                  </div>
                </td>

                {/* Driver */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={b.driver?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={b.driver?.name}
                      className="w-7 h-7 rounded-xl object-cover border border-[#EBE5D8]"
                    />
                    <div>
                      <p className="font-bold text-[#1C1C1C] text-xs leading-none">{b.driver?.name || 'Aman Singhal'}</p>
                      <p className="text-[10px] text-[#6B6B6B] font-mono mt-0.5">{b.driver?.vehicle.plate || 'DL 01 AB 8844'}</p>
                    </div>
                  </div>
                </td>

                {/* Seats & Price */}
                <td className="py-3.5 px-4">
                  <div>
                    <span className="font-extrabold text-sm text-[#00A86B]">
                      ₹{b.totalPrice}
                    </span>
                    <span className="text-[10px] text-[#6B6B6B] block">
                      ({b.seatsBooked} Seat{b.seatsBooked > 1 ? 's' : ''})
                    </span>
                  </div>
                </td>

                {/* Pickup OTP */}
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-extrabold text-[#F15A24] bg-[#FFF0EB] px-2 py-0.5 rounded-lg border border-[#FFD8CB]">
                    <Key className="w-3 h-3" />
                    {b.pickupOtp || '4829'}
                  </span>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  {getStatusBadge(b.status)}
                </td>

                {/* Booked At */}
                <td className="py-3.5 px-4 text-right text-xs text-[#6B6B6B]">
                  {new Date(b.bookedAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
