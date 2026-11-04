import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Search, ShieldCheck, Landmark } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { api, getToken } from '../../lib/api';
import { mapKycUser, type KycUser } from '../../lib/kyc';
import { isListedAdmin } from '../../lib/directory';
import { AdminPageSkeleton } from '../common/AdminLoading';
import { DocumentPreview } from '../common/DocumentPreview';

export const UserKycQueue: React.FC<{ hideTitle?: boolean }> = ({ hideTitle }) => {
  const [filter, setFilter] = useState<'pending' | 'all' | 'verified' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<KycUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<KycUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState('');

  const load = useCallback(async () => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      setUsers([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const rows = await api<any[]>('/admin/kyc?status=all');
      setUsers((rows || []).filter((row) => !isListedAdmin(row)).map(mapKycUser));
    } catch (err: any) {
      setError(err?.message || 'Could not load KYC.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = {
    pending: users.filter((u) => u.profileStatus === 'pending_verification').length,
    verified: users.filter((u) => u.profileStatus === 'verified').length,
    rejected: users.filter((u) => u.profileStatus === 'rejected').length,
    all: users.length,
  };

  const filtered = users.filter((user) => {
    if (filter === 'pending' && user.profileStatus !== 'pending_verification') return false;
    if (filter === 'verified' && user.profileStatus !== 'verified') return false;
    if (filter === 'rejected' && user.profileStatus !== 'rejected') return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.phone.includes(q) ||
      (user.city || '').toLowerCase().includes(q) ||
      (user.agencyName || '').toLowerCase().includes(q)
    );
  });

  const decide = async (userId: string, decision: 'verified' | 'rejected', reason?: string) => {
    await api(`/admin/kyc/${userId}`, { method: 'POST', json: { decision, rejectionReason: reason } });
    await load();
  };

  return (
    <div className="space-y-6">
      {!hideTitle && (
        <div>
          <h2 className="text-xl font-extrabold text-[#1C1C1C]">User KYC</h2>
          <p className="text-xs text-[#6B6B6B] mt-1">Live from Neon. Review Aadhaar and selfie.</p>
        </div>
      )}
      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B6B6B]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, email"
            className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] text-xs font-bold"
          />
        </div>
        <div className="flex gap-1">
          {(['pending', 'verified', 'rejected', 'all'] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`px-3 py-2 rounded-xl text-[11px] font-extrabold capitalize ${
                filter === id ? 'bg-[#1C1C1C] text-white' : 'bg-[#FAF6EE] text-[#6B6B6B]'
              }`}
            >
              {id} {counts[id]}
            </button>
          ))}
        </div>
      </div>
      {loading && <AdminPageSkeleton variant="cards" rows={4} />}
      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={ShieldCheck}
          title="No record found"
          description={
            searchQuery
              ? 'No KYC record matches this search.'
              : filter === 'pending'
                ? 'No users are waiting for KYC review.'
                : 'No KYC records in this filter.'
          }
        />
      )}
      {!loading && filtered.length > 0 && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((user) => (
          <article key={user.id} className="p-4 rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold">{user.name || 'Unnamed'}</h3>
                <p className="text-[11px] text-[#6B6B6B]">+91 {user.phone} · {user.email}</p>
                {user.agencyName && <p className="text-[11px] font-bold">{user.agencyName}</p>}
                {user.profileStatus === 'rejected' && user.rejectionReason && (
                  <p className="mt-1 text-[11px] font-bold text-red-600">Note: {user.rejectionReason}</p>
                )}
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white border border-[#EBE5D8]">
                {user.profileStatus.replace('_', ' ')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <DocumentPreview label="Aadhaar" src={user.aadhaarDoc} />
              <DocumentPreview label="Selfie" src={user.selfieDoc} emptyText={user.selfieName || 'Not uploaded'} />
            </div>

            {/* Bank Details section */}
            <div className="p-3 rounded-2xl bg-white border border-[#EBE5D8] space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-[#F15A24]">
                <Landmark className="w-3.5 h-3.5 text-[#F15A24]" />
                <span>Bank & Settlement Account</span>
              </div>
              {user.hasBank || user.bankName || user.accountNumber ? (
                <div className="text-xs space-y-0.5">
                  <p className="font-extrabold text-[#1C1C1C]">
                    {user.bankName || 'Bank'} · <span className="font-normal text-[#6B6B6B]">{user.accountHolderName || user.name}</span>
                  </p>
                  <p className="font-mono text-[11px] font-bold text-[#1C1C1C]">
                    A/C: {user.accountNumber || '—'} · IFSC: {user.ifsc || '—'}
                  </p>
                  {user.branchName && (
                    <p className="text-[10px] text-[#6B6B6B]">Branch: {user.branchName}</p>
                  )}
                  {user.upiId && (
                    <p className="text-[11px] text-[#00A86B] font-bold">
                      UPI: <span className="font-mono">{user.upiId}</span>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-[#8A8478] font-bold italic">
                  No bank details submitted yet.
                </p>
              )}
            </div>
            {user.profileStatus === 'pending_verification' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => decide(user.id, 'verified')}
                  className="flex-1 py-2.5 rounded-xl bg-[#00A86B] text-white text-xs font-extrabold"
                >
                  <CheckCircle2 className="w-4 h-4 inline mr-1" /> Verify
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(user);
                    setRejectionReason('');
                    setRejectError('');
                    setRejectOpen(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-white border border-red-200 text-red-600 text-xs font-extrabold"
                >
                  <XCircle className="w-4 h-4 inline mr-1" /> Reject
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
      )}
      {rejectOpen && selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md space-y-3">
            <h3 className="text-sm font-extrabold">Reject {selected.name}?</h3>
            <p className="text-[11px] font-medium text-[#6B6B6B]">
              Write a note. {selected.name || 'The user'} will see this on their profile and must fix it before resubmitting.
            </p>
            <label className="block">
              <span className="text-[10px] font-extrabold uppercase text-[#8A8478]">Note for the user *</span>
              <textarea
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  setRejectError('');
                }}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-[#FAF6EE] border border-[#EBE5D8] text-xs font-bold"
                rows={4}
                placeholder="e.g. Aadhaar photo is blurry. Upload a clearer copy."
                autoFocus
              />
            </label>
            {rejectError && <p className="text-xs font-bold text-red-600">{rejectError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={rejecting}
                onClick={async () => {
                  const note = rejectionReason.trim();
                  if (note.length < 4) {
                    setRejectError('Add a short note the user will see.');
                    return;
                  }
                  setRejecting(true);
                  try {
                    await decide(selected.id, 'rejected', note);
                    setRejectOpen(false);
                    setSelected(null);
                    setRejectionReason('');
                    setRejectError('');
                  } catch (err: any) {
                    setRejectError(err?.message || 'Could not reject.');
                  } finally {
                    setRejecting(false);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-extrabold disabled:opacity-60"
              >
                {rejecting ? 'Rejecting…' : 'Reject & send note'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRejectOpen(false);
                  setRejectError('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#FAF6EE] text-xs font-extrabold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
