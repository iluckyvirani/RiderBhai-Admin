import React, { useEffect, useState } from 'react';
import { Pencil, Settings, UserRound } from 'lucide-react';
import { api } from '../../lib/api';
import { ButtonSpinner } from '../common/AdminLoading';

export type AdminAccount = {
  id?: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
};

export const AdminProfileSettings: React.FC<{
  adminUser: AdminAccount;
  onUpdated: (next: AdminAccount) => void;
}> = ({ adminUser, onUpdated }) => {
  const [name, setName] = useState(adminUser.name);
  const [email, setEmail] = useState(adminUser.email);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    api<{ name?: string; email?: string; phone?: string }>('/admin/profile')
      .then((row) => {
        if (row.name) setName(row.name);
        if (row.email) setEmail(row.email);
      })
      .catch(() => undefined);
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileError('');
    setProfileSaved(false);
    try {
      const row = await api<{ name?: string; email?: string; phone?: string }>('/admin/profile', {
        method: 'PATCH',
        json: { name: name.trim(), email: email.trim() },
      });
      onUpdated({
        ...adminUser,
        name: row.name || name.trim(),
        email: row.email || email.trim(),
        phone: row.phone || adminUser.phone,
      });
      setProfileSaved(true);
    } catch (err: any) {
      setProfileError(err?.message || 'Could not save admin profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#F15A24]" />
          Settings
        </h2>
        <p className="text-xs text-[#6B6B6B] mt-1">
          Check and edit the admin profile. Login stays phone + OTP.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-5 space-y-3">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8478] inline-flex items-center gap-1">
            <UserRound className="h-3.5 w-3.5" /> Admin profile
          </p>
          <div>
            <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Name</p>
            <p className="text-sm font-extrabold">{adminUser.name || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Phone</p>
            <p className="text-sm font-extrabold font-mono">{adminUser.phone ? `+91 ${adminUser.phone}` : '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Email</p>
            <p className="text-sm font-extrabold">{adminUser.email || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Role</p>
            <p className="text-sm font-extrabold">{adminUser.role}</p>
          </div>
        </section>

        <form onSubmit={saveProfile} className="rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-5 space-y-3">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8478] inline-flex items-center gap-1">
            <Pencil className="h-3.5 w-3.5" /> Edit admin
          </p>
          {profileError && <p className="rounded-xl bg-red-50 p-2.5 text-xs font-bold text-red-600">{profileError}</p>}
          {profileSaved && <p className="rounded-xl bg-[#EBF7EE] p-2.5 text-xs font-bold text-[#00A86B]">Profile saved.</p>}
          <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#EBE5D8] bg-white px-3 py-2.5 text-xs font-bold text-[#1C1C1C]"
            />
          </label>
          <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#EBE5D8] bg-white px-3 py-2.5 text-xs font-bold text-[#1C1C1C]"
            />
          </label>
          <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
            Phone
            <input
              value={adminUser.phone ? `+91 ${adminUser.phone}` : '—'}
              disabled
              className="mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#F4F1EA] px-3 py-2.5 text-xs font-bold text-[#6B6B6B]"
            />
          </label>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="w-full py-3 rounded-2xl bg-[#F15A24] text-white text-xs font-extrabold disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {saving && <ButtonSpinner />}
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </div>
    </div>
  );
};
