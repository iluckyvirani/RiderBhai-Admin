import React, { useCallback, useEffect, useState } from 'react';
import { Users, Search, MapPin, ShieldCheck, Eye, Pencil, Trash2 } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { api, getToken } from '../../lib/api';
import { isListedAdmin, kycClass, kycLabel, mapAdminUser, type AdminUserRow } from '../../lib/directory';
import { AdminPageSkeleton, ButtonSpinner } from '../common/AdminLoading';
import { UserProfileModal } from './UserProfileModal';
import { UserEditModal } from './UserEditModal';

export const AllUsersView: React.FC<{ verifiedOnly?: boolean }> = ({ verifiedOnly }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewId, setViewId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<AdminUserRow | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api<any[]>('/admin/users');
      setRows((data || []).filter((row) => !isListedAdmin(row)).map(mapAdminUser));
    } catch (err: any) {
      setError(err?.message || 'Could not load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removeUser = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      await api(`/admin/users/${deleteUser.id}`, { method: 'DELETE' });
      setRows((prev) => prev.filter((row) => row.id !== deleteUser.id));
      setDeleteUser(null);
    } catch (err: any) {
      setError(err?.message || 'Could not delete user.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = rows.filter((user) => {
    if (verifiedOnly && user.profileStatus !== 'verified') return false;
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      user.name.toLowerCase().includes(q) ||
      user.phone.includes(searchTerm) ||
      user.email.toLowerCase().includes(q) ||
      (user.city || '').toLowerCase().includes(q) ||
      (user.agencyName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C1C1C] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#F15A24]" />
            {verifiedOnly ? 'All users verified' : 'All users'}
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-1">
            {verifiedOnly
              ? 'Accounts admin has already verified.'
              : 'Every account on Neon — KYC, plan, and driver status.'}
          </p>
        </div>
        <span className="text-xs font-extrabold bg-[#FFF0EB] text-[#F15A24] px-3 py-1.5 rounded-2xl border border-[#FFD8CB] w-fit">
          {filtered.length} {verifiedOnly ? 'verified' : 'users'}
        </span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B6B6B]" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search name, phone, email, city, agency…"
          className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] text-xs font-bold"
        />
      </div>

      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
      {loading && <AdminPageSkeleton variant="table" rows={6} />}
      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={Users}
          title="No record found"
          description={
            searchTerm
              ? 'No user matches this search. Try another name, phone or city.'
              : 'No customer accounts yet. New sign-ups will appear here.'
          }
        />
      )}

      {!loading && filtered.length > 0 && (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#EBE5D8] text-[#6B6B6B] uppercase font-bold text-[10px] tracking-wider bg-[#FAF6EE]/50">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">City</th>
              <th className="py-3 px-4">Tour agency</th>
              <th className="py-3 px-4">KYC</th>
              <th className="py-3 px-4">Plan</th>
              <th className="py-3 px-4">Joined</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2ECE1]">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-[#FFFDF9]">
                <td className="py-3.5 px-4">
                  <p className="font-extrabold text-[#1C1C1C]">{user.name || 'Unnamed'}</p>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-[#1C1C1C] whitespace-nowrap">
                  {user.phone ? `+91 ${user.phone}` : <span className="text-[#B8B2A6]">—</span>}
                </td>
                <td className="py-3.5 px-4 font-bold text-[#1C1C1C]">
                  {user.email || <span className="text-[#B8B2A6] font-bold">—</span>}
                </td>
                <td className="py-3.5 px-4 font-bold">
                  {user.city ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#F15A24]" />
                      {user.city}
                    </span>
                  ) : (
                    <span className="text-[#B8B2A6]">—</span>
                  )}
                </td>
                <td className="py-3.5 px-4 font-bold text-[#1C1C1C]">
                  {user.agencyName || <span className="text-[#B8B2A6] font-bold">—</span>}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-extrabold text-[10px] border ${kycClass(user.profileStatus)}`}>
                    <ShieldCheck className="w-3 h-3" />
                    {kycLabel(user.profileStatus)}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-extrabold">
                  {user.hasPlan ? <span className="text-[#00A86B]">Active</span> : <span className="text-[#B8B2A6]">None</span>}
                </td>
                <td className="py-3.5 px-4 text-[#6B6B6B]">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewId(user.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#EBE5D8] bg-[#FAF6EE] px-2 py-1 text-[11px] font-extrabold hover:bg-[#1C1C1C] hover:text-white"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditUser(user)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#EBE5D8] bg-white px-2 py-1 text-[11px] font-extrabold hover:border-[#F15A24] hover:text-[#F15A24]"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteUser(user)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-extrabold text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {viewId && <UserProfileModal userId={viewId} onClose={() => setViewId(null)} />}
      {editUser && (
        <UserEditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={(next) => {
            setRows((prev) => prev.map((row) => (row.id === next.id ? next : row)));
            setEditUser(null);
          }}
        />
      )}
      {deleteUser && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md space-y-3 rounded-3xl bg-white p-5">
            <h3 className="text-sm font-extrabold">Delete {deleteUser.name || deleteUser.phone}?</h3>
            <p className="text-xs font-medium text-[#6B6B6B]">
              This removes the account, vehicles, posts, chats and deals for +91 {deleteUser.phone}. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={removeUser}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 py-2.5 text-xs font-extrabold text-white disabled:opacity-60"
              >
                {deleting ? <><ButtonSpinner /> Deleting</> : 'Delete user'}
              </button>
              <button type="button" onClick={() => setDeleteUser(null)} className="flex-1 rounded-2xl bg-[#FAF6EE] py-2.5 text-xs font-extrabold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
