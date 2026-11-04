import React, { useCallback, useEffect, useState } from 'react';
import { Users, Search, MapPin, ShieldCheck, Eye, Pencil, Trash2, Ban, CheckCircle, ShieldAlert, Tag, Landmark } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { api, getToken } from '../../lib/api';
import { isListedAdmin, kycClass, kycLabel, mapAdminUser, type AdminUserRow } from '../../lib/directory';
import { formatUserId } from '../../lib/displayId';
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
  const [blockUser, setBlockUser] = useState<AdminUserRow | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [blocking, setBlocking] = useState(false);

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

  const openBlockModal = (user: AdminUserRow) => {
    setBlockUser(user);
    setBlockReason(user.blockedReason || (user.isBlocked ? '' : 'Violated community guidelines'));
  };

  const handleToggleBlock = async () => {
    if (!blockUser) return;
    setBlocking(true);
    const targetState = !blockUser.isBlocked;
    try {
      let updated: any;
      try {
        updated = await api<any>(`/admin/users/${blockUser.id}/block`, {
          method: 'POST',
          json: {
            isBlocked: targetState,
            reason: targetState ? blockReason : undefined,
          },
        });
      } catch {
        updated = await api<any>(`/admin/users/${blockUser.id}`, {
          method: 'PATCH',
          json: {
            isBlocked: targetState,
            blockedReason: targetState ? blockReason : null,
          },
        });
      }

      setRows((prev) =>
        prev.map((row) =>
          row.id === blockUser.id
            ? {
                ...row,
                isBlocked: Boolean(updated.is_blocked !== undefined ? updated.is_blocked : targetState),
                blockedReason: (updated.blocked_reason !== undefined ? updated.blocked_reason : (targetState ? blockReason : undefined)) || undefined,
              }
            : row
        )
      );
      setBlockUser(null);
    } catch (err: any) {
      setError(err?.message || `Could not ${targetState ? 'block' : 'unblock'} user.`);
    } finally {
      setBlocking(false);
    }
  };

  const filtered = rows.filter((user) => {
    if (verifiedOnly && user.profileStatus !== 'verified') return false;
    const q = searchTerm.toLowerCase();
    const userId = (user.displayId || formatUserId(user.id)).toLowerCase();
    return (
      !q ||
      userId.includes(q) ||
      user.name.toLowerCase().includes(q) ||
      user.phone.includes(searchTerm) ||
      user.email.toLowerCase().includes(q) ||
      (user.city || '').toLowerCase().includes(q) ||
      (user.agencyName || '').toLowerCase().includes(q) ||
      (user.bankName || '').toLowerCase().includes(q) ||
      (user.accountNumber || '').includes(q) ||
      (user.ifsc || '').toLowerCase().includes(q) ||
      (user.upiId || '').toLowerCase().includes(q)
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
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold bg-[#FFF0EB] text-[#F15A24] px-3 py-1.5 rounded-2xl border border-[#FFD8CB] w-fit">
            {filtered.length} {verifiedOnly ? 'verified' : 'users'}
          </span>
          {rows.some((r) => r.isBlocked) && (
            <span className="text-xs font-extrabold bg-red-100 text-red-700 px-3 py-1.5 rounded-2xl border border-red-200 w-fit">
              {rows.filter((r) => r.isBlocked).length} blocked
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B6B6B]" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search User ID (e.g. RB-US-1001), name, phone, email, city, agency…"
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
              <th className="py-3 px-4">User ID</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">City</th>
              <th className="py-3 px-4">Tour agency</th>
              <th className="py-3 px-4">Bank details</th>
              <th className="py-3 px-4">KYC</th>
              <th className="py-3 px-4">Plan</th>
              <th className="py-3 px-4">Joined</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2ECE1]">
            {filtered.map((user) => (
              <tr key={user.id} className={`hover:bg-[#FFFDF9] transition ${user.isBlocked ? 'bg-red-50/40' : ''}`}>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-extrabold bg-white border border-[#EBE5D8] text-[#1C1C1C] shadow-2xs">
                    <Tag className="w-3 h-3 text-[#F15A24]" />
                    {user.displayId || formatUserId(user.id)}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-extrabold text-[#1C1C1C]">{user.name || 'Unnamed'}</p>
                    {user.isBlocked && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-black uppercase text-red-700 border border-red-300">
                        <Ban className="h-2.5 w-2.5" /> Blocked
                      </span>
                    )}
                  </div>
                  {user.isBlocked && user.blockedReason && (
                    <p className="text-[10px] text-red-600 font-semibold mt-0.5 italic">"{user.blockedReason}"</p>
                  )}
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
                  {user.hasBank || user.bankName || user.accountNumber ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 font-extrabold text-[#1C1C1C] text-xs">
                        <Landmark className="w-3.5 h-3.5 text-[#F15A24] shrink-0" />
                        <span className="truncate max-w-[130px]">{user.bankName || 'Bank'}</span>
                      </div>
                      <p className="font-mono text-[11px] font-bold text-[#6B6B6B]">
                        A/C: {user.accountNumber ? `••••${user.accountNumber.slice(-4)}` : '—'}
                      </p>
                      <p className="font-mono text-[10px] text-[#8A8478]">
                        IFSC: {user.ifsc || '—'}
                      </p>
                      {user.upiId && (
                        <p className="text-[10px] text-[#00A86B] font-semibold truncate max-w-[130px]">
                          UPI: {user.upiId}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-[#B8B2A6] text-[11px] font-bold">— Not added —</span>
                  )}
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
                      title="View user details"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditUser(user)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#EBE5D8] bg-white px-2 py-1 text-[11px] font-extrabold hover:border-[#F15A24] hover:text-[#F15A24]"
                      title="Edit user details"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => openBlockModal(user)}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-extrabold transition ${
                        user.isBlocked
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                          : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white'
                      }`}
                      title={user.isBlocked ? 'Unblock user' : 'Block user from platform'}
                    >
                      {user.isBlocked ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" /> Unblock
                        </>
                      ) : (
                        <>
                          <Ban className="h-3.5 w-3.5" /> Block
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteUser(user)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-extrabold text-red-600 hover:bg-red-600 hover:text-white"
                      title="Delete user account"
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

      {/* Block / Unblock Modal */}
      {blockUser && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md space-y-4 rounded-3xl bg-white p-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${blockUser.isBlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {blockUser.isBlocked ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#1C1C1C]">
                  {blockUser.isBlocked ? 'Unblock' : 'Block'} {blockUser.name || blockUser.phone}?
                </h3>
                <p className="text-xs text-[#6B6B6B]">
                  Phone: +91 {blockUser.phone}
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-[#6B6B6B]">
              {blockUser.isBlocked
                ? 'Unblocking will immediately restore the user’s ability to log in, post vehicles/tours, and chat with buyers.'
                : 'Blocking this user will immediately revoke their access. They will be prevented from logging in or using any booking, chat, or posting features.'}
            </p>

            {!blockUser.isBlocked && (
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
                Reason for blocking
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Fraudulent behavior, fake docs, violation of terms"
                  className="mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#1C1C1C] outline-none focus:border-[#F15A24]"
                />
              </label>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleToggleBlock}
                disabled={blocking}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-extrabold text-white transition disabled:opacity-60 ${
                  blockUser.isBlocked
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {blocking ? (
                  <>
                    <ButtonSpinner /> {blockUser.isBlocked ? 'Unblocking…' : 'Blocking…'}
                  </>
                ) : blockUser.isBlocked ? (
                  'Confirm Unblock'
                ) : (
                  'Confirm Block'
                )}
              </button>
              <button
                type="button"
                onClick={() => setBlockUser(null)}
                className="flex-1 rounded-2xl bg-[#FAF6EE] py-2.5 text-xs font-extrabold text-[#1C1C1C] hover:bg-[#EBE5D8]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
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
