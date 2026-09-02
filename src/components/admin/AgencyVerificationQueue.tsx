import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Building,
  CreditCard,
  FileText,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TravelAgency } from '../../types';

export const AgencyVerificationQueue: React.FC = () => {
  const { agencies, adminVerifyAgency } = useAppStore();

  const [filter, setFilter] = useState<'pending' | 'all' | 'verified' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgency, setSelectedAgency] = useState<TravelAgency | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const filteredAgencies = agencies.filter((agency) => {
    if (filter === 'pending' && agency.status !== 'pending_verification') return false;
    if (filter === 'verified' && agency.status !== 'verified') return false;
    if (filter === 'rejected' && agency.status !== 'rejected') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        agency.agencyName.toLowerCase().includes(q) ||
        agency.ownerName.toLowerCase().includes(q) ||
        agency.city.toLowerCase().includes(q) ||
        (agency.documents?.gstNumber && agency.documents.gstNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pendingCount = agencies.filter((a) => a.status === 'pending_verification').length;

  const handleApprove = (agencyId: string) => {
    adminVerifyAgency(agencyId, 'verified');
    if (selectedAgency?.id === agencyId) {
      setSelectedAgency(null);
    }
  };

  const handleRejectSubmit = () => {
    if (!selectedAgency) return;
    adminVerifyAgency(selectedAgency.id, 'rejected', rejectionReason || 'Documents verification failed.');
    setIsRejectModalOpen(false);
    setRejectionReason('');
    setSelectedAgency(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#1C1C1C]">
              Firm KYC queue
            </h2>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F15A24] text-white text-xs font-extrabold">
                {pendingCount} Pending Review
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Review GSTIN, trade license, and PAN so the firm can post cars and tours.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-[#FAF6EE] p-1 rounded-2xl border border-[#EBE5D8]">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'pending'
                ? 'bg-[#F15A24] text-white shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#1C1C1C]'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'verified'
                ? 'bg-[#1C1C1C] text-white shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#1C1C1C]'
            }`}
          >
            Verified
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-[#1C1C1C] text-white shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#1C1C1C]'
            }`}
          >
            All Agencies ({agencies.length})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by agency name, owner, city, or GSTIN..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#EBE5D8] text-xs font-medium text-[#1C1C1C] bg-white focus:border-[#F15A24] outline-none"
        />
      </div>

      {/* Agency Cards List */}
      <div className="space-y-4">
        {filteredAgencies.length === 0 ? (
          <div className="p-12 text-center bg-[#FAF6EE] rounded-3xl border border-[#EBE5D8]">
            <Building className="w-10 h-10 text-[#C4BCAB] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#1C1C1C]">No agencies in this queue</p>
            <p className="text-xs text-[#6B6B6B] mt-1">All agency verifications are up to date.</p>
          </div>
        ) : (
          filteredAgencies.map((agency) => {
            const isPending = agency.status === 'pending_verification';
            const isVerified = agency.status === 'verified';

            return (
              <div
                key={agency.id}
                className={`p-6 rounded-3xl bg-white border transition-all shadow-card space-y-4 ${
                  isPending
                    ? 'border-amber-200 ring-2 ring-amber-100'
                    : 'border-[#EBE5D8]'
                }`}
              >
                {/* Agency Basic Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#F15A24] font-black text-base flex items-center justify-center border border-orange-100">
                      {agency.agencyName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-[#1C1C1C]">
                          {agency.agencyName}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            isVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPending
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : agency.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {agency.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B6B6B] mt-0.5">
                        Owner: <strong>{agency.ownerName}</strong> • Phone: {agency.phone} • {agency.city}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleApprove(agency.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active-press"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Verify</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedAgency(agency);
                            setIsRejectModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-all active-press border border-rose-200"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {!isPending && (
                      <button
                        onClick={() =>
                          adminVerifyAgency(
                            agency.id,
                            isVerified ? 'pending_verification' : 'verified'
                          )
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-[#FAF6EE] text-[#1C1C1C] hover:bg-[#EBE5D8] text-xs font-bold transition-all border border-[#EBE5D8]"
                      >
                        {isVerified ? 'Re-open Review' : 'Mark Verified'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Document Verification Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-[#FAF6EE]">
                  {/* GST */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] space-y-1">
                    <span className="text-[10px] font-bold text-[#6B6B6B] uppercase flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-[#F15A24]" />
                      GSTIN Number
                    </span>
                    <p className="text-xs font-extrabold text-[#1C1C1C] font-mono">
                      {agency.documents?.gstNumber || 'Not Submitted'}
                    </p>
                    {agency.documents?.gstDoc && (
                      <a
                        href={agency.documents.gstDoc}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-[#F15A24] flex items-center gap-1 hover:underline pt-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Certificate File</span>
                      </a>
                    )}
                  </div>

                  {/* PAN */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] space-y-1">
                    <span className="text-[10px] font-bold text-[#6B6B6B] uppercase flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[#F15A24]" />
                      Business PAN
                    </span>
                    <p className="text-xs font-extrabold text-[#1C1C1C] font-mono">
                      {agency.documents?.panNumber || 'Not Submitted'}
                    </p>
                    {agency.documents?.panDoc && (
                      <a
                        href={agency.documents.panDoc}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-[#F15A24] flex items-center gap-1 hover:underline pt-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View PAN Copy</span>
                      </a>
                    )}
                  </div>

                  {/* Trade License */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] space-y-1">
                    <span className="text-[10px] font-bold text-[#6B6B6B] uppercase flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-[#F15A24]" />
                      Trade / Municipal License
                    </span>
                    <p className="text-xs font-extrabold text-[#1C1C1C] font-mono">
                      {agency.documents?.tradeLicenseNumber || 'Not Submitted'}
                    </p>
                    {agency.documents?.tradeLicenseDoc && (
                      <a
                        href={agency.documents.tradeLicenseDoc}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-[#F15A24] flex items-center gap-1 hover:underline pt-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Trade License</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Reason Modal */}
      {isRejectModalOpen && selectedAgency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#EBE5D8] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#1C1C1C]">
                  Reject Verification: {selectedAgency.agencyName}
                </h3>
                <p className="text-xs text-[#6B6B6B]">Specify reason for document rejection</p>
              </div>
            </div>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. GST certificate is expired or unreadable. Please upload a clear valid copy."
              className="w-full p-3 rounded-2xl border border-[#EBE5D8] text-xs font-medium text-[#1C1C1C] bg-[#FAF6EE] focus:bg-white focus:border-[#F15A24] outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B6B6B] hover:bg-[#FAF6EE]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
