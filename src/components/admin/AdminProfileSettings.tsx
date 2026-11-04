import React, { useEffect, useState } from 'react';
import { Pencil, Settings, UserRound, KeyRound, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';
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

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!currentPassword) {
      setPwdError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    setPwdSaving(true);
    try {
      const res = await api<{ message: string }>('/admin/change-password', {
        method: 'POST',
        json: { currentPassword, newPassword },
      });
      setPwdSuccess(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdError(err?.message || 'Could not change password.');
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold flex items-center gap-2 text-[#1C1C1C]">
          <Settings className="w-6 h-6 text-[#F15A24]" />
          Admin settings
        </h2>
        <p className="text-xs text-[#6B6B6B] mt-1">
          Manage your administrator profile details and change your account login password.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Admin Profile Card */}
        <section className="rounded-3xl border border-[#EBE5D8] bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#8A8478] inline-flex items-center gap-1.5">
              <UserRound className="h-4 w-4 text-[#F15A24]" /> Admin profile
            </p>
            <span className="px-2.5 py-1 rounded-full bg-[#FFF0EB] text-[#F15A24] border border-[#FFD8CB] text-[10px] font-extrabold">
              Super Admin
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FAF6EE] p-3.5 rounded-2xl border border-[#EBE5D8]">
              <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Admin Name</p>
              <p className="text-sm font-extrabold text-[#1C1C1C] mt-0.5">{adminUser.name || 'Ride Bhai Admin'}</p>
            </div>
            <div className="bg-[#FAF6EE] p-3.5 rounded-2xl border border-[#EBE5D8]">
              <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Admin Email</p>
              <p className="text-sm font-extrabold text-[#1C1C1C] mt-0.5 truncate">{adminUser.email || 'admin@ridebhai.com'}</p>
            </div>
            <div className="bg-[#FAF6EE] p-3.5 rounded-2xl border border-[#EBE5D8]">
              <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Phone Number</p>
              <p className="text-sm font-extrabold font-mono text-[#1C1C1C] mt-0.5">
                {adminUser.phone ? `+91 ${adminUser.phone}` : '+91 9999999999'}
              </p>
            </div>
            <div className="bg-[#FAF6EE] p-3.5 rounded-2xl border border-[#EBE5D8]">
              <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Role / Access</p>
              <p className="text-sm font-extrabold text-[#00A86B] mt-0.5 inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Full access
              </p>
            </div>
          </div>

          {/* Edit Profile Form */}
          <form onSubmit={saveProfile} className="pt-2 border-t border-[#F2ECE1] space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#8A8478] inline-flex items-center gap-1.5">
              <Pencil className="h-3.5 w-3.5 text-[#F15A24]" /> Edit profile details
            </p>

            {profileError && (
              <p className="rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs font-bold text-red-600">
                {profileError}
              </p>
            )}
            {profileSaved && (
              <p className="rounded-xl bg-[#EBF7EE] border border-[#BDE8C7] p-2.5 text-xs font-bold text-[#00A86B] inline-flex items-center gap-1.5 w-full">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Profile details saved successfully.
              </p>
            )}

            <div>
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478] mb-1">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Admin Name"
                className="w-full rounded-2xl border border-[#EBE5D8] bg-[#FAF6EE] px-3.5 py-2.5 text-xs font-bold text-[#1C1C1C] focus:bg-white focus:outline-none focus:border-[#F15A24]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478] mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ridebhai.com"
                className="w-full rounded-2xl border border-[#EBE5D8] bg-[#FAF6EE] px-3.5 py-2.5 text-xs font-bold text-[#1C1C1C] focus:bg-white focus:outline-none focus:border-[#F15A24]"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="w-full py-2.5 rounded-2xl bg-[#1C1C1C] text-white text-xs font-extrabold disabled:opacity-60 inline-flex items-center justify-center gap-2 hover:bg-black transition active-press"
            >
              {saving && <ButtonSpinner />}
              {saving ? 'Saving profile…' : 'Save profile details'}
            </button>
          </form>
        </section>

        {/* Right Column: Change Password Card */}
        <section className="rounded-3xl border border-[#EBE5D8] bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#8A8478] inline-flex items-center gap-1.5">
              <KeyRound className="h-4 w-4 text-[#F15A24]" /> Change password
            </p>
            <span className="text-[10px] text-[#6B6B6B] font-bold">Min 6 characters</span>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {pwdError && (
              <p className="rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs font-bold text-red-600">
                {pwdError}
              </p>
            )}
            {pwdSuccess && (
              <p className="rounded-xl bg-[#EBF7EE] border border-[#BDE8C7] p-2.5 text-xs font-bold text-[#00A86B] inline-flex items-center gap-1.5 w-full">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {pwdSuccess}
              </p>
            )}

            {/* Current Password */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478] mb-1">
                Current password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-2xl border border-[#EBE5D8] bg-[#FAF6EE] pl-3.5 pr-10 py-2.5 text-xs font-bold text-[#1C1C1C] focus:bg-white focus:outline-none focus:border-[#F15A24]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-[#8A8478] hover:text-[#1C1C1C]"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478] mb-1">
                New password
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-2xl border border-[#EBE5D8] bg-[#FAF6EE] pl-3.5 pr-10 py-2.5 text-xs font-bold text-[#1C1C1C] focus:bg-white focus:outline-none focus:border-[#F15A24]"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-2.5 text-[#8A8478] hover:text-[#1C1C1C]"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478] mb-1">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full rounded-2xl border border-[#EBE5D8] bg-[#FAF6EE] pl-3.5 pr-10 py-2.5 text-xs font-bold text-[#1C1C1C] focus:bg-white focus:outline-none focus:border-[#F15A24]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 text-[#8A8478] hover:text-[#1C1C1C]"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={pwdSaving || !currentPassword || !newPassword || !confirmPassword}
              className="w-full py-3 rounded-2xl bg-[#F15A24] text-white text-xs font-extrabold disabled:opacity-60 inline-flex items-center justify-center gap-2 hover:bg-[#d94918] transition active-press shadow-xs"
            >
              {pwdSaving && <ButtonSpinner />}
              {pwdSaving ? 'Updating password…' : 'Update password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
