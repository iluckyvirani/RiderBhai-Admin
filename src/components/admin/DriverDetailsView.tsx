import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, IdCard, Ban, ShieldAlert } from 'lucide-react';
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
  const [blockOpen, setBlockOpen] = useState(false);
  const [note, setNote] = useState('');
  const [blockReason, setBlockReason] = useState('Violated community guidelines / unsafe driving');

  const decide = async (decision: 'verified' | 'rejected' | 'blocked', reason?: string) => {
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
        rejectionReason: decision === 'rejected' || decision === 'blocked' ? reason : undefined,
      });
      setRejectOpen(false);
      setBlockOpen(false);
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

        {driver.verificationStatus === 'blocked' && (
          <div className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-2xl p-3 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-red-800">This driver is currently BLOCKED</p>
              <p className="mt-0.5 text-red-600">{driver.rejectionReason || 'Violated community guidelines'}</p>
              <p className="mt-1 text-[10px] text-red-500">All car postings with this driver are automatically hidden from users.</p>
            </div>
          </div>
        )}

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
          <div className="rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] p-2.5">
            <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">DL number</p>
            <p className="text-xs font-extrabold mt-0.5 tracking-wide">{driver.dlNumber || '—'}</p>
          </div>
        </div>

        {driver.experienceNote && (
          <p className="text-[11px] text-[#6B6B6B]">{driver.experienceNote}</p>
        )}

        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${kycClass(driver.profileStatus)}`}>
          Owner {kycLabel(driver.profileStatus)}
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DocumentPreview label="Driving licence" src={driver.dlDoc} />
          <DocumentPreview label="Driver Aadhaar" src={driver.aadhaarDoc} />
          <DocumentPreview label="Driver selfie" src={driver.selfieDoc} />
        </div>

        {error && <p className="text-[11px] font-bold text-red-600 bg-red-50 p-2.5 rounded-2xl">{error}</p>}

        {driver.verificationStatus === 'blocked' ? (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => decide('verified')}
              className="flex-1 py-3 rounded-2xl bg-[#00A86B] hover:bg-[#008f5b] text-white text-xs font-extrabold disabled:opacity-60 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Unblock & Verify Driver
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {driver.verificationStatus !== 'verified' && (
              <button
                type="button"
                disabled={busy}
                onClick={() => decide('verified')}
                className="flex-1 min-w-[140px] py-3 rounded-2xl bg-[#00A86B] hover:bg-[#008f5b] text-white text-xs font-extrabold disabled:opacity-60 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Verify driver
              </button>
            )}
            {driver.verificationStatus === 'pending_verification' && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setNote('');
                  setRejectOpen(true);
                }}
                className="flex-1 min-w-[120px] py-3 rounded-2xl bg-white border border-red-200 text-red-600 text-xs font-extrabold disabled:opacity-60 transition-all flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setBlockReason('Violated community guidelines / unsafe driving');
                setBlockOpen(true);
              }}
              className="flex-1 min-w-[120px] py-3 rounded-2xl bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 text-red-600 text-xs font-extrabold disabled:opacity-60 transition-all flex items-center justify-center gap-1.5"
            >
              <Ban className="w-4 h-4" /> Block Driver
            </button>
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

      {blockOpen && (
        <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <Ban className="w-5 h-5" />
              <h3 className="text-sm font-extrabold">Block Driver: {driver.name}</h3>
            </div>
            <p className="text-[11px] text-[#6B6B6B]">
              Blocking this driver will automatically cancel and hide all their active car listings. The user will receive an instant notification.
            </p>
            <div>
              <label className="text-[10px] font-extrabold text-[#6B6B6B] uppercase block mb-1">
                Reason for blocking *
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={3}
                placeholder="Reason for blocking (e.g. misconduct, expired documents, reckless driving)..."
                className="w-full rounded-2xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setBlockOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#FAF6EE] text-xs font-extrabold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || blockReason.trim().length < 3}
                onClick={() => decide('blocked', blockReason.trim())}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold disabled:opacity-50"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
