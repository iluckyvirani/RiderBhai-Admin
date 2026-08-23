import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  IndianRupee,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Send,
  Building2,
  Sparkles
} from 'lucide-react';
import { INITIAL_SETTLEMENTS, DriverSettlement } from '../../data/mockSettlements';

export const SettlePaymentsView: React.FC = () => {
  const [settlements, setSettlements] = useState<DriverSettlement[]>(INITIAL_SETTLEMENTS);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [settleSuccessMsg, setSettleSuccessMsg] = useState('');

  const totalPending = settlements
    .filter((s) => s.status === 'pending')
    .reduce((acc, s) => acc + s.netPayable, 0);

  const totalSettled = settlements
    .filter((s) => s.status === 'settled')
    .reduce((acc, s) => acc + s.netPayable, 0);

  const handleSettleNow = (id: string) => {
    setSettlingId(id);
    setTimeout(() => {
      const txnRef = `UPI-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
      setSettlements((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: 'settled',
                settledAt: new Date().toLocaleString(),
                txnRef,
              }
            : s
        )
      );
      setSettlingId(null);
      setSettleSuccessMsg(`Payout settled successfully! Ref: ${txnRef}`);
      setTimeout(() => setSettleSuccessMsg(''), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C1C1C] flex items-center gap-2 font-display">
            <CreditCard className="w-6 h-6 text-[#F15A24]" />
            <span>Driver Payouts & Settlement Queue</span>
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Process direct UPI & Bank settlements for completed passenger carpool trips.
          </p>
        </div>

        <button
          onClick={() => {
            const pending = settlements.filter((s) => s.status === 'pending');
            if (pending.length === 0) return;
            setSettlingId('all');
            setTimeout(() => {
              setSettlements((prev) =>
                prev.map((s) => ({
                  ...s,
                  status: 'settled',
                  settledAt: new Date().toLocaleString(),
                  txnRef: `BATCH-${Math.floor(100000 + Math.random() * 900000)}`,
                }))
              );
              setSettlingId(null);
              setSettleSuccessMsg('All pending driver payouts have been settled via UPI Batch!');
              setTimeout(() => setSettleSuccessMsg(''), 4000);
            }, 800);
          }}
          disabled={totalPending === 0}
          className="px-4 py-2.5 bg-gradient-to-r from-[#00A86B] to-[#2E9E5B] text-white text-xs font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all active-press flex items-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>Settle All Pending (₹{totalPending.toLocaleString('en-IN')})</span>
        </button>
      </div>

      {settleSuccessMsg && (
        <div className="p-4 bg-[#EBF7EE] border border-[#BDE8C7] text-[#00A86B] text-xs font-extrabold rounded-2xl flex items-center gap-2 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{settleSuccessMsg}</span>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FAF6EE] p-5 rounded-3xl border border-[#EBE5D8] space-y-1.5">
          <span className="text-[11px] font-extrabold text-[#F15A24] uppercase tracking-wider">
            Pending Settlements
          </span>
          <p className="text-2xl font-extrabold text-[#1C1C1C]">
            ₹{totalPending.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#6B6B6B]">
            {settlements.filter((s) => s.status === 'pending').length} Drivers waiting for payout
          </p>
        </div>

        <div className="bg-[#FAF6EE] p-5 rounded-3xl border border-[#EBE5D8] space-y-1.5">
          <span className="text-[11px] font-extrabold text-[#00A86B] uppercase tracking-wider">
            Total Settled Payouts
          </span>
          <p className="text-2xl font-extrabold text-[#1C1C1C]">
            ₹{totalSettled.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#6B6B6B]">100% On-time UPI transfers</p>
        </div>

        <div className="bg-[#FAF6EE] p-5 rounded-3xl border border-[#EBE5D8] space-y-1.5">
          <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
            Platform Take Rate
          </span>
          <p className="text-2xl font-extrabold text-[#1C1C1C]">0% Cut</p>
          <p className="text-[11px] text-[#6B6B6B]">Drivers keep 100% of seat fares</p>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#EBE5D8] text-[#6B6B6B] uppercase font-bold text-[10px] tracking-wider bg-[#FAF6EE]/50">
              <th className="py-3 px-4">Driver Partner</th>
              <th className="py-3 px-4">Payout Destination</th>
              <th className="py-3 px-4">Trips</th>
              <th className="py-3 px-4">Gross Fare</th>
              <th className="py-3 px-4">Net Payable</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2ECE1]">
            {settlements.map((item) => (
              <tr key={item.id} className="hover:bg-[#FFFDF9] transition-colors">
                {/* Driver */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.driverAvatar}
                      alt={item.driverName}
                      className="w-10 h-10 rounded-2xl object-cover border border-[#EBE5D8] shadow-xs flex-shrink-0"
                    />
                    <div>
                      <p className="font-extrabold text-[#1C1C1C] text-xs">{item.driverName}</p>
                      <p className="text-[11px] text-[#6B6B6B] font-mono">{item.driverPhone}</p>
                    </div>
                  </div>
                </td>

                {/* Destination */}
                <td className="py-3.5 px-4">
                  <div>
                    <span className="font-mono font-bold text-xs text-[#1C1C1C] bg-[#FAF6EE] px-2 py-0.5 rounded border border-[#EBE5D8]">
                      {item.upiId}
                    </span>
                    <p className="text-[10px] text-[#6B6B6B] mt-1">{item.bankAccount}</p>
                  </div>
                </td>

                {/* Trips */}
                <td className="py-3.5 px-4 font-bold text-xs text-[#1C1C1C]">
                  {item.totalTripsCompleted} Trips
                </td>

                {/* Gross */}
                <td className="py-3.5 px-4 text-xs text-[#6B6B6B]">
                  ₹{item.grossFareAmount.toLocaleString('en-IN')}
                </td>

                {/* Net */}
                <td className="py-3.5 px-4 font-extrabold text-sm text-[#00A86B]">
                  ₹{item.netPayable.toLocaleString('en-IN')}
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  {item.status === 'settled' ? (
                    <div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EBF7EE] text-[#00A86B] font-extrabold text-[10px] border border-[#BDE8C7]">
                        <CheckCircle2 className="w-3 h-3" />
                        Settled
                      </span>
                      {item.txnRef && (
                        <p className="text-[9px] text-[#6B6B6B] font-mono mt-0.5">{item.txnRef}</p>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-extrabold text-[10px] border border-amber-200">
                      <Clock className="w-3 h-3" />
                      Pending Payout
                    </span>
                  )}
                </td>

                {/* Action */}
                <td className="py-3.5 px-4 text-right">
                  {item.status === 'pending' ? (
                    <button
                      onClick={() => handleSettleNow(item.id)}
                      disabled={settlingId === item.id}
                      className="px-3 py-1.5 bg-[#F15A24] hover:bg-[#E8380D] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all active-press disabled:opacity-50"
                    >
                      {settlingId === item.id ? 'Processing...' : 'Settle UPI'}
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#6B6B6B] font-medium">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
