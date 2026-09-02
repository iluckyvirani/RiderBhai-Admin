import React, { useState } from 'react';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  Clock,
  IndianRupee,
  AlertTriangle,
  ArrowRight,
  Send,
  Zap
} from 'lucide-react';
import { INITIAL_REFUNDS, RefundItem } from '../../data/mockRefunds';

export const RefundListView: React.FC = () => {
  const [refunds, setRefunds] = useState<RefundItem[]>(INITIAL_REFUNDS);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  const totalPendingRefunds = refunds
    .filter((r) => r.status === 'pending')
    .reduce((acc, r) => acc + r.amount, 0);

  const totalProcessedRefunds = refunds
    .filter((r) => r.status === 'processed')
    .reduce((acc, r) => acc + r.amount, 0);

  const handleProcessRefund = (id: string) => {
    setProcessingId(id);
    setTimeout(() => {
      const refundTxnId = `REF-UPI-${Math.floor(1000000 + Math.random() * 9000000)}`;
      setRefunds((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: 'processed',
                processedAt: new Date().toLocaleString(),
                refundTxnId,
              }
            : r
        )
      );
      setProcessingId(null);
      setStatusMsg(`Instant refund sent via UPI! Reference: ${refundTxnId}`);
      setTimeout(() => setStatusMsg(''), 4000);
    }, 600);
  };

  const filteredRefunds = refunds.filter(
    (r) =>
      r.refundNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.riderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C1C1C] flex items-center gap-2 font-display">
            <RotateCcw className="w-6 h-6 text-[#F15A24]" />
            <span>Refunds</span>
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Partner posting-plan refunds only. There is no customer fare in the app.
          </p>
        </div>

        {totalPendingRefunds > 0 && (
          <button
            onClick={() => {
              setProcessingId('all');
              setTimeout(() => {
                setRefunds((prev) =>
                  prev.map((r) => ({
                    ...r,
                    status: 'processed',
                    processedAt: new Date().toLocaleString(),
                    refundTxnId: `BATCH-REF-${Math.floor(100000 + Math.random() * 900000)}`,
                  }))
                );
                setProcessingId(null);
                setStatusMsg('All pending refunds processed via Instant UPI!');
                setTimeout(() => setStatusMsg(''), 4000);
              }, 700);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-[#F15A24] to-[#FF7A45] text-white text-xs font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all active-press flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>Process All Pending (₹{totalPendingRefunds})</span>
          </button>
        )}
      </div>

      {statusMsg && (
        <div className="p-4 bg-[#EBF7EE] border border-[#BDE8C7] text-[#00A86B] text-xs font-extrabold rounded-2xl flex items-center gap-2 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FAF6EE] p-5 rounded-3xl border border-[#EBE5D8] space-y-1">
          <span className="text-[11px] font-extrabold text-red-600 uppercase tracking-wider">
            Pending Refunds
          </span>
          <p className="text-2xl font-extrabold text-[#1C1C1C]">
            ₹{totalPendingRefunds.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#6B6B6B]">
            {refunds.filter((r) => r.status === 'pending').length} Cases requiring authorization
          </p>
        </div>

        <div className="bg-[#FAF6EE] p-5 rounded-3xl border border-[#EBE5D8] space-y-1">
          <span className="text-[11px] font-extrabold text-[#00A86B] uppercase tracking-wider">
            Processed Refunds
          </span>
          <p className="text-2xl font-extrabold text-[#1C1C1C]">
            ₹{totalProcessedRefunds.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#6B6B6B]">Credited to source UPI/Card within 2 hours</p>
        </div>

        <div className="bg-[#FAF6EE] p-5 rounded-3xl border border-[#EBE5D8] space-y-1">
          <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
            Resolution Guarantee
          </span>
          <p className="text-2xl font-extrabold text-[#1C1C1C]">100% Policy</p>
          <p className="text-[11px] text-[#6B6B6B]">No-questions-asked refund on driver cancellation</p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EBE5D8] flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search refund ID, rider, route, reason..."
            className="w-full text-xs font-bold text-[#1C1C1C] bg-white pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EBE5D8] focus:outline-none focus:border-[#F15A24]"
          />
        </div>
      </div>

      {/* Refunds Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#EBE5D8] text-[#6B6B6B] uppercase font-bold text-[10px] tracking-wider bg-[#FAF6EE]/50">
              <th className="py-3 px-4">Refund ID</th>
              <th className="py-3 px-4">Partner / customer</th>
              <th className="py-3 px-4">Route</th>
              <th className="py-3 px-4">Refund Amount</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2ECE1]">
            {filteredRefunds.map((ref) => (
              <tr key={ref.id} className="hover:bg-[#FFFDF9] transition-colors">
                {/* Ref ID */}
                <td className="py-3.5 px-4 font-mono font-extrabold text-xs text-[#1C1C1C]">
                  {ref.refundNumber}
                </td>

                {/* Rider */}
                <td className="py-3.5 px-4">
                  <div>
                    <p className="font-bold text-xs text-[#1C1C1C]">{ref.riderName}</p>
                    <p className="text-[10px] text-[#6B6B6B] font-mono">{ref.riderPhone}</p>
                  </div>
                </td>

                {/* Route */}
                <td className="py-3.5 px-4 font-bold text-xs text-[#1C1C1C]">
                  {ref.route}
                </td>

                {/* Amount */}
                <td className="py-3.5 px-4 font-extrabold text-sm text-[#F15A24]">
                  ₹{ref.amount}
                </td>

                {/* Reason */}
                <td className="py-3.5 px-4">
                  <span className="text-[11px] font-bold bg-[#FAF6EE] px-2 py-0.5 rounded border border-[#EBE5D8] text-[#1C1C1C]">
                    {ref.reason}
                  </span>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  {ref.status === 'processed' ? (
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#00A86B] bg-[#EBF7EE] px-2.5 py-1 rounded-full border border-[#BDE8C7]">
                        <CheckCircle2 className="w-3 h-3" />
                        Refunded
                      </span>
                      {ref.refundTxnId && (
                        <p className="text-[9px] text-[#6B6B6B] font-mono mt-0.5">{ref.refundTxnId}</p>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      <Clock className="w-3 h-3" />
                      Pending Approval
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  {ref.status === 'pending' ? (
                    <button
                      onClick={() => handleProcessRefund(ref.id)}
                      disabled={processingId === ref.id}
                      className="px-3 py-1.5 bg-[#00A86B] hover:bg-[#2E9E5B] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all active-press disabled:opacity-50"
                    >
                      {processingId === ref.id ? 'Processing...' : 'Approve Refund'}
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
