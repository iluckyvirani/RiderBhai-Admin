import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, IdCard } from 'lucide-react';
import { api } from '../../lib/api';
import {
  kycClass,
  kycLabel,
  vehicleStatusLabel,
  type AdminDriverRow,
} from '../../lib/directory';
import { DocumentPreview } from '../common/DocumentPreview';

export const DriverDetailsView: React.FC<{
  driver: AdminDriverRow;
  onBack: () => void;
  onUpdated: (next: AdminDriverRow) => void;
  backLabel?: string;
}> = ({ driver, onBack, onUpdated, backLabel = 'All drivers' }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState('');

  const decide = async (decision: 'verified' | 'rejected', reason?: string) => {
    if (!driver.id) return;
    setBusy(true);
    setError('');
    try {
      await api(`/admin/drivers/${driver.id}`, {
        method: 'POST',
        json: { decision, rejectionReason: reason },
      });
      onUpdated({
        ...driver,
        verificationStatus: decision,
        rejectionReason: decision === 'rejected' ? reason : undefined,
      });
      setRejectOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Could not update driver.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-xs font-extrabold text-[#F15A24] inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> {backLabel}
      </button>

      <div className="rounded-3xl border border-[#EBE5D8] bg-white p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#F15A24] flex items-center gap-1.5">
              <IdCard className="w-3.5 h-3.5" /> Driver details
            </p>
            <h2 className="text-lg font-black text-[#1C1C1C] mt-1">{driver.name}</h2>
            <p className="text-xs font-bold text-[#6B6B6B] mt-0.5">+91 {driver.phone}</p>
            <p className="text-[11px] text-[#6B6B6B]">{driver.email}</p>
          </div>
          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${kycClass(driver.verificationStatus)}`}>
            {vehicleStatusLabel(driver.verificationStatus)}
          </span>
        </div>

        {driver.verificationStatus === 'rejected' && driver.rejectionReason && (
          <p className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl p-3">
            Rejection note: {driver.rejectionReason}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] p-2.5">
            <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Experience</p>
            <p className="text-xs font-extrabold mt-0.5">{driver.experienceYears} years</p>
          </div>
          <div className="rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] p-2.5">
            <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">City</p>
            <p className="text-xs font-extrabold mt-0.5">{driver.city || '—'}</p>
          </div>
          <div className="rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] p-2.5">
            <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Account owner</p>
            <p className="text-xs font-extrabold mt-0.5">{driver.ownerName || '—'}</p>
          </div>
        </div>

        {driver.experienceNote && (
          <p className="text-[11px] text-[#6B6B6B]">{driver.experienceNote}</p>
        )}

        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${kycClass(driver.profileStatus)}`}>
          Owner {kycLabel(driver.profileStatus)}
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DocumentPreview label="Driver Aadhaar" src={driver.aadhaarDoc} />
          <DocumentPreview label="Driver selfie" src={driver.selfieDoc} />
        </div>

        {error && <p className="text-[11px] font-bold text-red-600 bg-red-50 p-2.5 rounded-2xl">{error}</p>}

        {driver.verificationStatus !== 'verified' && (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => decide('verified')}
              className="flex-1 py-3 rounded-2xl bg-[#00A86B] text-white text-xs font-extrabold disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4 inline mr-1" /> Verify driver
            </button>
            {driver.verificationStatus === 'pending_verification' && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setNote('');
                  setRejectOpen(true);
                }}
                className="flex-1 py-3 rounded-2xl bg-white border border-red-200 text-red-600 text-xs font-extrabold disabled:opacity-60"
              >
                <XCircle className="w-4 h-4 inline mr-1" /> Reject
              </button>
            )}
          </div>
        )}
      </div>

      {rejectOpen && (
        <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md space-y-3">
            <h3 className="text-sm font-extrabold">Reject this driver?</h3>
            <p className="text-[11px] text-[#6B6B6B]">The owner will see this note on My drivers.</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Why is this driver rejected?"
              className="w-full rounded-2xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRejectOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#FAF6EE] text-xs font-extrabold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || note.trim().length < 4}
                onClick={() => decide('rejected', note.trim())}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-extrabold disabled:opacity-50"
              >
                Reject driver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
