import React, { useEffect, useRef, useState } from 'react';
import { Car, MapPin, MessageCircle, Search } from 'lucide-react';
import { api, getToken } from '../../lib/api';
import { AdminPageSkeleton } from '../common/AdminLoading';
import { EmptyState } from '../common/EmptyState';
import { chatClock, chatListTime, withDaySeparators } from '../../lib/chatTime';

type Thread = {
  id: string;
  listing_type: string;
  title?: string;
  buyer_name?: string;
  buyer_phone?: string;
  seller_name?: string;
  seller_agency?: string;
  seller_phone?: string;
  last_message?: string;
  last_at?: string;
  message_count: number;
  created_at?: string;
};

type ChatMsg = { id: string; sender_name: string; body: string; created_at: string };

export const AdminChatsView: React.FC = () => {
  const [kind, setKind] = useState<'car' | 'tour'>('car');
  const [when, setWhen] = useState<'all' | 'today' | 'week'>('all');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<Thread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const chatEnd = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      setLoading(false);
      return;
    }
    api<Thread[]>('/admin/chats')
      .then((data) => {
        const next = data || [];
        setRows(next);
        setSelectedId(null);
      })
      .catch((err: any) => setError(err?.message || 'Could not load chats.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    api<{ messages: ChatMsg[] }>(`/admin/chats/${selectedId}/messages`)
      .then((data) => setMessages(data.messages || []))
      .catch(() => setMessages([]));
  }, [selectedId]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const kindRows = rows.filter((row) => (row.listing_type === 'tour' ? 'tour' : 'car') === kind);
  const filtered = kindRows.filter((row) => {
    if (when !== 'all') {
      const ts = row.last_at || row.created_at;
      if (!ts) return false;
      const age = Date.now() - new Date(ts).getTime();
      if (when === 'today' && age > 24 * 60 * 60 * 1000) return false;
      if (when === 'week' && age > 7 * 24 * 60 * 60 * 1000) return false;
    }
    const q = search.toLowerCase();
    return (
      !q ||
      (row.buyer_name || '').toLowerCase().includes(q) ||
      (row.seller_name || '').toLowerCase().includes(q) ||
      (row.seller_agency || '').toLowerCase().includes(q) ||
      (row.title || '').toLowerCase().includes(q) ||
      (row.last_message || '').toLowerCase().includes(q)
    );
  });
  const selected = filtered.find((row) => row.id === selectedId) || filtered[0] || null;
  const counts = {
    car: rows.filter((r) => r.listing_type !== 'tour').length,
    tour: rows.filter((r) => r.listing_type === 'tour').length,
  };

  useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id);
    if (!selected) setSelectedId(null);
  }, [kind, when, search, rows]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-[#F15A24]" />
          Direct chats
        </h2>
        <p className="text-xs text-[#6B6B6B] mt-1">
          Message direct only. Cars and tours are separate tabs. Deal with Ride Bhai stays on Inquiries.
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
              setWhen('all');
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
            placeholder={`Search ${kind === 'car' ? 'car' : 'tour'} buyer, seller or last message…`}
            className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] text-xs font-bold"
          />
        </div>
        <div className="flex gap-1">
          {([
            ['all', 'All'],
            ['today', 'Today'],
            ['week', 'This week'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setWhen(id)}
              className={`shrink-0 px-3 py-2 rounded-xl text-[11px] font-extrabold ${
                when === id ? 'bg-[#1C1C1C] text-white' : 'bg-[#FAF6EE] text-[#6B6B6B]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
      {loading && <AdminPageSkeleton variant="list" rows={4} />}
      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={kind === 'car' ? Car : MapPin}
          title="No record found"
          description={
            search || when !== 'all'
              ? `No ${kind === 'car' ? 'car' : 'tour'} chats match these filters.`
              : `No Message-direct ${kind === 'car' ? 'car' : 'tour'} chats yet.`
          }
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4">
          <div className="space-y-2 xl:max-h-[640px] xl:overflow-y-auto">
            {filtered.map((row) => {
              const unreadLook = !selectedId || selectedId !== row.id;
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelectedId(row.id)}
                  className={`w-full text-left rounded-2xl border p-3 ${
                    selectedId === row.id ? 'border-[#F15A24] bg-[#FFF0EB]' : 'border-[#EBE5D8] bg-[#FAF6EE]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-extrabold text-[#1C1C1C]">
                      {row.buyer_name || 'Buyer'} → {row.seller_agency || row.seller_name || 'Seller'}
                    </p>
                    <span className="text-[10px] font-bold text-[#8A8478] shrink-0">
                      {chatListTime(row.last_at)}
                    </span>
                  </div>
                  <p className="text-[10px] font-extrabold uppercase text-[#F15A24] mt-0.5">
                    {row.listing_type === 'tour' ? 'Tour chat' : 'Car chat'} · Direct
                  </p>
                  <p className="text-[11px] text-[#6B6B6B] truncate">{row.title || 'Chat'}</p>
                  <p className={`text-[11px] line-clamp-1 mt-0.5 ${unreadLook ? 'font-bold text-[#1C1C1C]' : 'text-[#6B6B6B]'}`}>
                    {row.last_message || 'No messages yet'}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-[#EBE5D8] bg-[#FAF6EE] overflow-hidden min-h-[420px] flex flex-col">
            {selected ? (
              <>
                <div className="px-4 py-3 bg-white border-b border-[#EBE5D8]">
                  <p className="text-[10px] font-extrabold uppercase text-[#F15A24]">
                    {selected.listing_type === 'tour' ? 'Tour chat' : 'Car chat'} · Direct
                  </p>
                  <p className="text-sm font-extrabold">{selected.title || 'Direct chat'}</p>
                  <p className="text-[11px] text-[#6B6B6B]">
                    {selected.buyer_name} ({selected.buyer_phone || '—'}) → {selected.seller_agency || selected.seller_name} ({selected.seller_phone || '—'})
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {messages.length === 0 && (
                    <p className="text-[11px] font-bold text-[#8A8478]">No messages in this chat.</p>
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
                    const mine = msg.sender_name === 'Ride Bhai admin';
                    return (
                      <div
                        key={msg.id}
                        className={`max-w-[85%] rounded-2xl px-3 pt-2 pb-1 text-xs ${
                          mine ? 'ml-auto bg-[#F15A24] text-white' : 'bg-white border border-[#EBE5D8]'
                        }`}
                      >
                        <p className="text-[10px] font-extrabold opacity-80">{msg.sender_name}</p>
                        <p className="font-bold">{msg.body}</p>
                        <p className={`text-[9px] text-right mt-1 ${mine ? 'text-white/75' : 'text-[#8A8478]'}`}>
                          {chatClock(msg.created_at)}
                        </p>
                      </div>
                    );
                  })}
                  <div ref={chatEnd} />
                </div>
              </>
            ) : (
              <p className="p-6 text-sm font-bold text-[#6B6B6B]">Select a chat.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
