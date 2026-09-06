import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../../lib/api';
import type { AdminUserRow } from '../../lib/directory';
import { ButtonSpinner } from '../common/AdminLoading';

export function UserEditModal({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUserRow;
  onClose: () => void;
  onSaved: (next: AdminUserRow) => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [city, setCity] = useState(user.city || '');
  const [agencyName, setAgencyName] = useState(user.agencyName || '');
  const [profileStatus, setProfileStatus] = useState(user.profileStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const row = await api<any>(`/admin/users/${user.id}`, {
        method: 'PATCH',
        json: { name, email, phone, city, agencyName, profileStatus },
      });
      onSaved({
        ...user,
        name: row.name || name,
        email: row.email || email,
        phone: row.phone || phone,
        city: row.city || undefined,
        agencyName: row.agency_name || undefined,
        profileStatus: row.profile_status || profileStatus,
      });
    } catch (err: any) {
      setError(err?.message || 'Could not save user.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4">
      <form onSubmit={save} className="w-full max-w-md space-y-3 rounded-3xl bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold">Edit user</h3>
          <button type="button" onClick={onClose} className="rounded-xl bg-[#FAF6EE] p-2">
            <X className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="rounded-xl bg-red-50 p-2.5 text-xs font-bold text-red-600">{error}</p>}
        <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#1C1C1C]" />
        </label>
        <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#1C1C1C]" />
        </label>
        <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#1C1C1C]" />
        </label>
        <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
          City
          <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#1C1C1C]" />
        </label>
        <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
          Tour agency
          <input value={agencyName} onChange={(e) => setAgencyName(e.target.value)} className="mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#1C1C1C]" />
        </label>
        <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
          KYC status
          <select value={profileStatus} onChange={(e) => setProfileStatus(e.target.value as AdminUserRow['profileStatus'])} className="mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#1C1C1C]">
            <option value="incomplete">Incomplete</option>
            <option value="pending_verification">Pending KYC</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <button type="submit" disabled={saving} className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#F15A24] text-xs font-extrabold text-white disabled:opacity-60">
          {saving ? <><ButtonSpinner /> Saving</> : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
