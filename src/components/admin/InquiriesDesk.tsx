import React, { useEffect, useRef, useState } from 'react';
import { Car, MapPin, Phone, Search, Send, StickyNote, Trash2 } from 'lucide-react';
import { api, getToken } from '../../lib/api';
import { mapDeal, type Deal } from '../../lib/deals';
import { AdminPageSkeleton, ButtonSpinner } from '../common/AdminLoading';
import { EmptyState } from '../common/EmptyState';
import { chatClock, withDaySeparators } from '../../lib/chatTime';
import { DealRatings } from './DealRatings';

type ChatMsg = { id: string; sender_name: string; body: string; created_at: string };

function money(n: number) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

export const InquiriesDesk: React.FC = () => {
  const [rows, setRows] = useState<Deal[]>([]);
  const [kind, setKind] = useState<'car' | 'tour'>('car');
  const [statusFilter, setStatusFilter] = useState<'all' | Deal['status']>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<Deal['status']>('pending');
  const [saving, setSaving] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [chatBody, setChatBody] = useState('');
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const chatEnd = useRef<HTMLDivElement | null>(null);

  const kindRows = rows.filter((row) => row.listingType === kind);
  const visible = kindRows.filter((row) => {
    if (statusFilter !== 'all' && row.status !== statusFilter) return false;
    const q = search.toLowerCase();
    return (
      !q ||
      row.title.toLowerCase().includes(q) ||
      row.buyerName.toLowerCase().includes(q) ||
      row.sellerName.toLowerCase().includes(q) ||
      (row.fromCity || '').toLowerCase().includes(q) ||
      (row.toCity || '').toLowerCase().includes(q)
    );
  });
  const selected = visible.find((row) => row.id === selectedId) || visible[0] || null;
  const counts = {
    car: rows.filter((r) => r.listingType === 'car').length,
    tour: rows.filter((r) => r.listingType === 'tour').length,
    pending: kindRows.filter((r) => r.status === 'pending').length,
    open: kindRows.filter((r) => r.status === 'open').length,
    success: kindRows.filter((r) => r.status === 'success').length,
    cancelled: kindRows.filter((r) => r.status === 'cancelled').length,
    all: kindRows.length,
  };

  const load = async () => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api<any[]>(`/admin/deals?channel=ridebhai&status=all`);
      const next = (data || []).map(mapDeal);
      setRows(next);
      setSelectedId((cur) => (cur && next.some((row) => row.id === cur) ? cur : null));
    } catch (err: any) {
      setError(err?.message || 'Could not load inquiries.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id);
    if (!selected) setSelectedId(null);
  }, [kind, statusFilter, search, rows]);

  useEffect(() => {
    if (!selected) {
      setNote('');
      setStatus('pending');
      setMessages([]);
      setThreadId(null);
      return;
    }
    setNote(selected.adminNote || '');
    setStatus(selected.status);
    setThreadId(selected.threadId || null);
    if (selected.threadId) {
      api<{ messages: ChatMsg[] }>(`/admin/chats/${selected.threadId}/messages`)
        .then((data) => setMessages(data.messages || []))
        .catch(() => setMessages([]));
    } else {
      setMessages([]);
    }
  }, [selectedId, selected?.threadId, selected?.adminNote, selected?.status]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const saveInquiry = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      await api(`/admin/deals/${selected.id}`, {
        method: 'PATCH',
        json: { status, adminNote: note },
      });
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not update inquiry.');
    } finally {
      setSaving(false);
    }
  };

  const deleteInquiry = async () => {
    if (!selected) return;
    if (!window.confirm(`Delete this ${selected.listingType} inquiry for ${selected.title}?`)) return;
    setDeleting(true);
    setError('');
    try {
      await api(`/admin/deals/${selected.id}`, { method: 'DELETE' });
      setSelectedId(null);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not delete inquiry.');
    } finally {
      setDeleting(false);
    }
  };

  const deleteAllInquiries = async () => {
    if (!visible.length) return;
    if (!window.confirm(`Delete all ${visible.length} ${kind} inquiries on this list?`)) return;
    setDeleting(true);
    setError('');
    try {
      await Promise.all(visible.map((row) => api(`/admin/deals/${row.id}`, { method: 'DELETE' })));
      setSelectedId(null);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not delete inquiries.');
    } finally {
      setDeleting(false);
    }
  };

  const openChat = async () => {
    if (!selected) return;
    setSending(true);
    try {
      const thread = await api<{ id: string }>(`/admin/deals/${selected.id}/thread`, { method: 'POST' });
      setThreadId(thread.id);
      const data = await api<{ messages: ChatMsg[] }>(`/admin/chats/${thread.id}/messages`);
      setMessages(data.messages || []);
      setRows((prev) => prev.map((row) => (row.id === selected.id ? { ...row, threadId: thread.id } : row)));
    } catch (err: any) {
      setError(err?.message || 'Could not open chat.');
    } finally {
      setSending(false);
    }
  };

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatBody.trim() || !threadId) return;
    setSending(true);
    try {
      const msg = await api<ChatMsg>(`/admin/chats/${threadId}/messages`, {
        method: 'POST',
        json: { body: chatBody.trim() },
      });
      setMessages((prev) => [...prev, msg]);
      setChatBody('');
    } catch (err: any) {
      setError(err?.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold">Inquiries</h2>
        <p className="text-xs text-[#6B6B6B] mt-1">
          Deal with Ride Bhai only. Cars and tours are separate tabs so you can filter each list.
        </p>
      </div>

      <div className="flex gap-1 p-1 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] w-full sm:w-fit">
        {([
          ['car', 'Cars', Car, counts.car],
          ['tour', 'Tours', MapPin, counts.tour],
        ] as const).map(([id, label, Icon, n]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setKind(id);
              setStatusFilter('all');
              setSearch('');
            }}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold ${
              kind === id ? 'bg-[#1C1C1C] text-white' : 'text-[#6B6B6B]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label} {n}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B6B6B]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${kind === 'car' ? 'car' : 'tour'} buyer, seller or title…`}
            className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] text-xs font-bold"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {(['all', 'pending', 'open', 'success', 'cancelled'] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setStatusFilter(id)}
              className={`shrink-0 px-3 py-2 rounded-xl text-[11px] font-extrabold capitalize ${
                statusFilter === id ? 'bg-[#1C1C1C] text-white' : 'bg-[#FAF6EE] text-[#6B6B6B]'
              }`}
            >
              {id} {id === 'all' ? counts.all : counts[id]}
            </button>
          ))}
        </div>
      </div>

      {visible.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={deleteAllInquiries}
            disabled={deleting}
            className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-extrabold text-red-600 disabled:opacity-60"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete all {kind === 'car' ? 'car' : 'tour'} inquiries on this list
          </button>
        </div>
      )}

      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
      {loading && <AdminPageSkeleton variant="list" rows={4} />}

      {!loading && visible.length === 0 && (
        <EmptyState
          icon={kind === 'car' ? Car : MapPin}
          title="No record found"
          description={
            search || statusFilter !== 'all'
              ? `No ${kind === 'car' ? 'car' : 'tour'} inquiries match these filters.`
              : `No Ride Bhai ${kind === 'car' ? 'car' : 'tour'} inquiries yet.`
          }
        />
      )}

      {!loading && visible.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4">
          <div className="space-y-2 xl:max-h-[640px] xl:overflow-y-auto">
            {visible.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelectedId(row.id)}
                className={`w-full text-left rounded-2xl border p-3 ${
                  selected?.id === row.id ? 'border-[#F15A24] bg-[#FFF0EB]' : 'border-[#EBE5D8] bg-[#FAF6EE]'
                }`}
              >
                <p className="text-[10px] font-extrabold uppercase text-[#F15A24]">
                  {row.listingType === 'car' ? 'Car inquiry' : 'Tour inquiry'} · {row.status}
                </p>
                <p className="text-xs font-extrabold mt-0.5">{row.title}</p>
                <p className="text-[11px] text-[#6B6B6B]">{row.buyerName} → {row.sellerName}</p>
              </button>
            ))}
          </div>

          {selected && (
            <div className="space-y-4 rounded-3xl border border-[#EBE5D8] p-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase text-[#F15A24]">
                  {selected.listingType === 'car' ? 'Car inquiry' : 'Tour inquiry'} · Ride Bhai
                </p>
                <h3 className="text-base font-black">{selected.title}</h3>
                <p className="text-xs font-bold text-[#6B6B6B]">
                  Buyer {selected.buyerName} ({selected.buyerPhone || '—'}) → Seller {selected.sellerName} (
                  {selected.sellerPhone || '—'})
                </p>
                <p className="text-sm font-extrabold text-[#F15A24] mt-1">{money(selected.price)}</p>
              </div>
              <DealRatings deal={selected} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-[11px] font-extrabold uppercase text-[#8A8478]">
                  Change status
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Deal['status'])}
                    className="mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#1C1C1C]"
                  >
                    <option value="pending">Pending</option>
                    <option value="open">Open</option>
                    <option value="success">Success</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
                <label className="text-[11px] font-extrabold uppercase text-[#8A8478] sm:col-span-2">
                  Add note
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Internal note for this inquiry"
                    className="mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#1C1C1C]"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveInquiry}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#1C1C1C] px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-60"
                >
                  {saving ? <ButtonSpinner /> : <StickyNote className="w-3.5 h-3.5" />}
                  Save status & note
                </button>
                <button
                  type="button"
                  onClick={deleteInquiry}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-extrabold text-red-600 disabled:opacity-60"
                >
                  {deleting ? <ButtonSpinner /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete inquiry
                </button>
              </div>

              <div className="rounded-2xl border border-[#EBE5D8] bg-[#FAF6EE] overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#EBE5D8]">
                  <p className="text-[11px] font-extrabold uppercase text-[#8A8478]">Chat with</p>
                  {!threadId && (
                    <button
                      type="button"
                      onClick={openChat}
                      disabled={sending}
                      className="text-[11px] font-extrabold text-[#F15A24]"
                    >
                      Start chat
                    </button>
                  )}
                </div>
                <div className="h-56 overflow-y-auto p-3 space-y-2">
                  {messages.length === 0 && (
                    <p className="text-[11px] font-bold text-[#8A8478]">No messages yet. Start chat to message both sides.</p>
                  )}
                  {withDaySeparators(messages).map((item) => {
                    if (item.type === 'day') {
                      return (
                        <div key={item.id} className="flex justify-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#E8E2D4] text-[10px] font-extrabold text-[#6B6B6B]">
                            {item.label}
                          </span>
                        </div>
                      );
                    }
                    const msg = item.msg;
                    return (
                    <div
                      key={msg.id}
                      className={`max-w-[85%] rounded-2xl px-3 pt-2 pb-1 text-xs ${
                        msg.sender_name === 'Ride Bhai admin'
                          ? 'ml-auto bg-[#F15A24] text-white'
                          : 'bg-white border border-[#EBE5D8]'
                      }`}
                    >
                      <p className="text-[10px] font-extrabold opacity-80">{msg.sender_name}</p>
                      <p className="font-bold">{msg.body}</p>
                      <p className={`text-[9px] text-right mt-1 ${msg.sender_name === 'Ride Bhai admin' ? 'text-white/75' : 'text-[#8A8478]'}`}>
                        {chatClock(msg.created_at)}
                      </p>
                    </div>
                    );
                  })}
                  <div ref={chatEnd} />
                </div>
                <form onSubmit={sendChat} className="flex gap-2 p-2 border-t border-[#EBE5D8] bg-white">
                  <input
                    value={chatBody}
                    onChange={(e) => setChatBody(e.target.value)}
                    disabled={!threadId}
                    placeholder={threadId ? 'Type a message…' : 'Start chat first'}
                    className="flex-1 rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold"
                  />
                  <button
                    type="submit"
                    disabled={!threadId || sending || !chatBody.trim()}
                    className="rounded-xl bg-[#F15A24] px-3 text-white disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
