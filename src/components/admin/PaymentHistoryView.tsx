import React, { useState } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  IndianRupee,
  CreditCard,
  Download,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const PaymentHistoryView: React.FC = () => {
  const { bookings, rides, drivers, currentRider } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | 'upi' | 'card' | 'wallet'>('all');

  const payments = bookings.map((b) => {
    const ride = rides.find((r) => r.id === b.rideId);
    const driver = drivers.find((d) => d.id === b.driverId);
    return {
      txnId: `TXN-${b.id.toUpperCase()}`,
      bookingId: b.id,
      amount: b.totalPrice,
      method: b.paymentMethod || 'upi',
      status: b.status === 'cancelled' ? 'refunded' : 'success',
      date: new Date(b.bookedAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      customer: currentRider.name,
      customerPhone: currentRider.phone,
      driverName: driver?.name || 'Aman Singhal',
      route: ride ? `${ride.fromCity} → ${ride.toCity}` : 'Intercity Highway Trip',
      seats: b.seatsBooked,
    };
  });

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.txnId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.route.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod = methodFilter === 'all' || p.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalVolume = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C1C1C] flex items-center gap-2 font-display">
            <FileText className="w-6 h-6 text-[#F15A24]" />
            <span>All Payment Transactions</span>
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Complete transactional ledger for seat bookings, instant UPI charges, and boost purchases.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting complete transaction statement (CSV format)...')}
          className="px-3.5 py-2 rounded-2xl bg-white border border-[#EBE5D8] hover:bg-[#FAF6EE] text-xs font-bold text-[#1C1C1C] transition-all flex items-center gap-1.5 shadow-xs active-press"
        >
          <Download className="w-4 h-4 text-[#F15A24]" />
          <span>Export Statement</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FAF6EE] p-5 rounded-3xl border border-[#EBE5D8] space-y-1">
          <span className="text-[11px] font-extrabold text-[#6B6B6B] uppercase tracking-wider">
            Total Transaction Volume
          </span>
          <p className="text-2xl font-extrabold text-[#1C1C1C]">
            ₹{totalVolume.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#00A86B] font-bold">100% Processed via Escrow Gateway</p>
        </div>

        <div className="bg-[#FAF6EE] p-5 rounded-3xl border border-[#EBE5D8] space-y-1">
          <span className="text-[11px] font-extrabold text-[#6B6B6B] uppercase tracking-wider">
            Successful Bookings
          </span>
          <p className="text-2xl font-extrabold text-[#1C1C1C]">
            {payments.filter((p) => p.status === 'success').length}
          </p>
          <p className="text-[11px] text-[#6B6B6B]">Zero gateway drop-offs</p>
        </div>

        <div className="bg-[#FAF6EE] p-5 rounded-3xl border border-[#EBE5D8] space-y-1">
          <span className="text-[11px] font-extrabold text-[#6B6B6B] uppercase tracking-wider">
            Average Seat Fare
          </span>
          <p className="text-2xl font-extrabold text-[#1C1C1C]">
            ₹{payments.length ? Math.round(totalVolume / payments.length) : 0}
          </p>
          <p className="text-[11px] text-[#6B6B6B]">Per passenger intercity trip</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EBE5D8] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search txn ID, rider, driver, route..."
            className="w-full text-xs font-bold text-[#1C1C1C] bg-white pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EBE5D8] focus:outline-none focus:border-[#F15A24]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Methods' },
            { id: 'upi', label: 'UPI' },
            { id: 'card', label: 'Card' },
            { id: 'wallet', label: 'Wallet' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setMethodFilter(pill.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 active-press ${
                methodFilter === pill.id
                  ? 'bg-[#F15A24] text-white shadow-xs'
                  : 'bg-white text-[#6B6B6B] border border-[#EBE5D8] hover:text-[#1C1C1C]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#EBE5D8] text-[#6B6B6B] uppercase font-bold text-[10px] tracking-wider bg-[#FAF6EE]/50">
              <th className="py-3 px-4">Transaction ID</th>
              <th className="py-3 px-4">Route & Seats</th>
              <th className="py-3 px-4">Passenger / Rider</th>
              <th className="py-3 px-4">Driver Partner</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4 text-right">Date & Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2ECE1]">
            {filteredPayments.map((p, idx) => (
              <tr key={idx} className="hover:bg-[#FFFDF9] transition-colors">
                {/* Txn ID */}
                <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#1C1C1C]">
                  {p.txnId}
                </td>

                {/* Route */}
                <td className="py-3.5 px-4">
                  <div>
                    <p className="font-extrabold text-xs text-[#1C1C1C]">{p.route}</p>
                    <span className="text-[10px] text-[#6B6B6B]">{p.seats} Seat(s) Booked</span>
                  </div>
                </td>

                {/* Rider */}
                <td className="py-3.5 px-4 font-bold text-[#1C1C1C] text-xs">
                  {p.customer}
                </td>

                {/* Driver */}
                <td className="py-3.5 px-4 font-bold text-[#1C1C1C] text-xs">
                  {p.driverName}
                </td>

                {/* Amount */}
                <td className="py-3.5 px-4 font-extrabold text-sm text-[#00A86B]">
                  ₹{p.amount}
                </td>

                {/* Method */}
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center uppercase tracking-wider font-extrabold text-[10px] bg-[#FAF6EE] px-2 py-0.5 rounded border border-[#EBE5D8] text-[#1C1C1C]">
                    {p.method}
                  </span>
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 text-right text-xs text-[#6B6B6B]">
                  {p.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
