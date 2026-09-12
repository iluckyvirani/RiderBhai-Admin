import React, { useCallback, useEffect, useState } from 'react';
import {
  LifeBuoy,
  Search,
  MessageCircle,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ChevronRight,
  User,
  MapPin,
  Building,
  Send,
  Loader2,
  X,
  FileText,
  Tag,
  ShieldAlert,
} from 'lucide-react';
import { api, getToken } from '../../lib/api';
import { SupportTicket, TicketStatus } from '../../types';
import { AdminPageSkeleton } from '../common/AdminLoading';
import { EmptyState } from '../common/EmptyState';

function formatTimestamp(isoString?: string) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

const statusBadges: Record<TicketStatus, { label: string; bg: string; text: string; border: string }> = {
  open: { label: 'Open', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  resolved: { label: 'Resolved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  closed: { label: 'Closed', bg: 'bg-zinc-100', text: 'text-zinc-600', border: 'border-zinc-300' },
};

const priorityBadges = {
  urgent: { label: 'Urgent', bg: 'bg-red-500 text-white' },
  high: { label: 'High', bg: 'bg-orange-500 text-white' },
  normal: { label: 'Normal', bg: 'bg-zinc-200 text-zinc-700' },
};

export const SupportTicketsView: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Response form inside modal
  const [modalStatus, setModalStatus] = useState<TicketStatus>('in_progress');
  const [adminNote, setAdminNote] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  const loadTickets = useCallback(async () => {
    if (!getToken()) {
      setError('Please sign in as admin.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api<SupportTicket[]>('/admin/tickets');
      setTickets(data || []);
    } catch (err: any) {
      setError(err?.message || 'Could not load support tickets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const openTicketModal = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setModalStatus(ticket.status);
    setAdminNote(ticket.admin_notes || '');
    setResolutionNote(ticket.resolution_notes || '');
    setSaveSuccess('');
  };

  const handleUpdateTicket = async (overrideStatus?: TicketStatus) => {
    if (!selectedTicket) return;
    setSaving(true);
    setSaveSuccess('');
    setError('');
    const targetStatus = overrideStatus || modalStatus;
    try {
      const updated = await api<SupportTicket>(`/admin/tickets/${selectedTicket.id}`, {
        method: 'POST',
        json: {
          status: targetStatus,
          adminNotes: adminNote.trim() || undefined,
          resolutionNotes: resolutionNote.trim() || undefined,
        },
      });

      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? { ...t, ...updated } : t))
      );
      setSelectedTicket((prev) => (prev ? { ...prev, ...updated } : null));
      setModalStatus(targetStatus);
      setSaveSuccess(`Ticket updated to ${statusBadges[targetStatus].label} and user notified!`);
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update ticket.');
    } finally {
      setSaving(false);
    }
  };

  const counts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
  };

  const filtered = tickets.filter((ticket) => {
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      ticket.ticket_number.toLowerCase().includes(q) ||
      ticket.subject.toLowerCase().includes(q) ||
      ticket.description.toLowerCase().includes(q) ||
      (ticket.user_name || '').toLowerCase().includes(q) ||
      (ticket.user_phone || '').includes(searchTerm) ||
      (ticket.user_city || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1C1C1C] flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-[#F15A24]" /> Support & Help Tickets
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Resolve customer queries, update ticket status, and send instant notification notes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black px-3 py-1.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
            {counts.open} Open
          </span>
          <span className="text-xs font-black px-3 py-1.5 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
            {counts.in_progress} In Progress
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B6B6B]" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ticket #, subject, user name, phone..."
            className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] text-xs font-bold focus:outline-none focus:border-[#F15A24]"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-2 rounded-xl text-[11px] font-extrabold capitalize transition-all ${
                statusFilter === key
                  ? 'bg-[#1C1C1C] text-white shadow-xs'
                  : 'bg-[#FAF6EE] text-[#6B6B6B] hover:text-[#1C1C1C]'
              }`}
            >
              {key.replace('_', ' ')} ({counts[key]})
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl border border-red-200">{error}</p>}

      {loading && <AdminPageSkeleton variant="cards" rows={6} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={LifeBuoy}
          title="No support tickets"
          description={
            searchTerm
              ? 'No support tickets match your search query.'
              : statusFilter === 'open'
                ? 'Great job! No open support tickets right now.'
                : 'No tickets found in this filter.'
          }
        />
      )}

      {/* Tickets Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((ticket) => {
            const badge = statusBadges[ticket.status] || statusBadges.open;
            const priorityBadge = priorityBadges[ticket.priority] || priorityBadges.normal;

            return (
              <div
                key={ticket.id}
                className="rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-4 flex flex-col justify-between space-y-3 shadow-xs hover:border-[#F15A24]/50 transition-all"
              >
                {/* Header Row */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-[#1C1C1C] bg-white px-2 py-0.5 rounded-lg border border-[#EBE5D8]">
                        {ticket.ticket_number}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${priorityBadge.bg}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Subject & Category */}
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1C1C1C] line-clamp-1">{ticket.subject}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#F15A24] mt-0.5">
                      Category: {ticket.category}
                    </p>
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-[#6B6B6B] line-clamp-2 bg-white/70 p-2 rounded-xl border border-[#EBE5D8]/50">
                    {ticket.description}
                  </p>

                  {/* Admin Note snippet if exists */}
                  {(ticket.resolution_notes || ticket.admin_notes) && (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800 font-bold">
                      <p className="font-extrabold text-[10px] uppercase text-emerald-900">Admin Note:</p>
                      <p className="line-clamp-1">{ticket.resolution_notes || ticket.admin_notes}</p>
                    </div>
                  )}
                </div>

                {/* User Info & Footer */}
                <div className="pt-2 border-t border-[#EBE5D8] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#6B6B6B]">
                    <div className="flex items-center gap-1.5 font-bold truncate">
                      <User className="w-3.5 h-3.5 text-[#F15A24] flex-shrink-0" />
                      <span className="truncate text-[#1C1C1C]">{ticket.user_name || 'User'}</span>
                      <span className="font-mono text-[#6B6B6B]">+91 {ticket.user_phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#8A8478]">
                    <span>{formatTimestamp(ticket.created_at)}</span>
                    <button
                      type="button"
                      onClick={() => openTicketModal(ticket)}
                      className="text-xs font-black text-[#F15A24] inline-flex items-center gap-0.5 hover:underline"
                    >
                      Manage & Respond <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Management Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-xl space-y-4 shadow-2xl relative max-h-[92vh] flex flex-col justify-between overflow-y-auto">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#1C1C1C] bg-[#FAF6EE] px-2.5 py-1 rounded-xl border border-[#EBE5D8]">
                      {selectedTicket.ticket_number}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${priorityBadges[selectedTicket.priority]?.bg || 'bg-zinc-200'}`}>
                      {selectedTicket.priority}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusBadges[selectedTicket.status].bg} ${statusBadges[selectedTicket.status].text} ${statusBadges[selectedTicket.status].border}`}>
                      {statusBadges[selectedTicket.status].label}
                    </span>
                  </div>
                  <h2 className="text-base font-black text-[#1C1C1C] mt-1.5">{selectedTicket.subject}</h2>
                  <p className="text-[11px] text-[#8A8478] mt-0.5">
                    Raised on {formatTimestamp(selectedTicket.created_at)} · Category: <strong className="text-[#F15A24] uppercase">{selectedTicket.category}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 rounded-xl bg-[#FAF6EE] hover:bg-[#EBE5D8] text-[#1C1C1C] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Context & Actions */}
              <div className="mt-3 p-3 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
                <div>
                  <p className="font-extrabold text-[#1C1C1C]">{selectedTicket.user_name || 'User'}</p>
                  <p className="text-[#6B6B6B] font-mono text-[11px]">+91 {selectedTicket.user_phone}</p>
                  {selectedTicket.user_city && (
                    <p className="text-[#8A8478] text-[10px] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#F15A24]" /> {selectedTicket.user_city}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/91${selectedTicket.user_phone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#25D366] text-white text-xs font-extrabold flex items-center gap-1 hover:bg-[#20bd5a] transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                  <a
                    href={`tel:${selectedTicket.user_phone}`}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#EBE5D8] text-[#1C1C1C] text-xs font-extrabold flex items-center gap-1 hover:border-[#F15A24] transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#F15A24]" /> Call
                  </a>
                </div>
              </div>

              {/* Description Body */}
              <div className="mt-3 space-y-1.5">
                <label className="text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider block">
                  Issue Description
                </label>
                <div className="p-3 rounded-2xl bg-white border border-[#EBE5D8] text-xs font-semibold text-[#1C1C1C] whitespace-pre-wrap">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Status Selector */}
              <div className="mt-3 space-y-1.5">
                <label className="text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider block">
                  Change Ticket Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['open', 'in_progress', 'resolved', 'closed'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setModalStatus(st)}
                      className={`py-2 px-2 rounded-xl text-xs font-extrabold capitalize border transition-all ${
                        modalStatus === st
                          ? 'bg-[#1C1C1C] text-white border-[#1C1C1C] shadow-xs'
                          : 'bg-[#FAF6EE] text-[#6B6B6B] border-[#EBE5D8] hover:border-zinc-400'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution Note / Response to User */}
              <div className="mt-3 space-y-1.5">
                <label className="text-[10px] font-extrabold text-[#6B6B6B] uppercase tracking-wider block">
                  Response & Resolution Note (Sent as notification to User)
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  rows={3}
                  placeholder="Type your resolution note or message for the user..."
                  className="w-full rounded-2xl border border-[#EBE5D8] bg-[#FAF6EE] px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-[#F15A24]"
                />
              </div>

              {saveSuccess && (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccess}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#EBE5D8] flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2.5 rounded-2xl bg-[#FAF6EE] text-xs font-extrabold text-[#6B6B6B]"
              >
                Close
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleUpdateTicket()}
                className="flex-1 py-3 rounded-2xl brand-gradient text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving & Notifying...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Save Status & Notify User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
