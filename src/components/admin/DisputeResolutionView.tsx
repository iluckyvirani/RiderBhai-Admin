import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const DisputeResolutionView: React.FC = () => {
  const { disputes, resolveDispute } = useAppStore();

  const openDisputes = disputes.filter((d) => d.status === 'open');
  const resolvedDisputes = disputes.filter((d) => d.status === 'resolved');

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-extrabold text-[#1C1C1C]">Disputes & Support</h3>
          <p className="text-xs text-[#6B6B6B]">Passenger refund & cancellation tickets</p>
        </div>
        <span className="text-xs font-extrabold text-[#D64545] bg-[#FDEDED] px-2.5 py-1 rounded-full">
          {openDisputes.length} Open
        </span>
      </div>

      {/* Disputes List */}
      <div className="space-y-3">
        {disputes.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-3xl p-4 border shadow-card space-y-2.5 ${
              item.status === 'open' ? 'border-[#FACBCB]' : 'border-[#EBE5D8]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#9E9E9E]">Ticket #{item.id}</span>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  item.status === 'open'
                    ? 'text-[#D64545] bg-[#FDEDED]'
                    : 'text-[#2E9E5B] bg-[#EBF7F0]'
                }`}
              >
                {item.status === 'open' ? '● Open Dispute' : '✓ Resolved'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-extrabold text-[#1C1C1C]">
                <span>{item.riderName} (Rider) vs {item.driverName} (Driver)</span>
                <span className="text-[#F15A24]">₹{item.amount}</span>
              </div>
              <p className="text-[11px] text-[#6B6B6B]">Route: {item.route} • {item.createdAt}</p>
            </div>

            <p className="text-xs text-[#1C1C1C] bg-[#FAF6EE] p-2.5 rounded-2xl border border-[#EBE5D8] italic">
              "{item.reason}"
            </p>

            {item.status === 'open' ? (
              <button
                onClick={() => {
                  resolveDispute(item.id);
                  alert(`✅ Dispute resolved and ₹${item.amount} refunded to rider.`);
                }}
                className="w-full py-2.5 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs active-press"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Resolved & Issue Refund</span>
              </button>
            ) : (
              <div className="text-[11px] text-[#2E9E5B] font-semibold text-center py-1">
                Resolved by Admin
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
