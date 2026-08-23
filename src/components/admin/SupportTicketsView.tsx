import React, { useState } from 'react';
import {
  LifeBuoy,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  User,
  Car,
  Filter,
  Send,
  X
} from 'lucide-react';
import { INITIAL_TICKETS, SupportTicket } from '../../data/mockTickets';

export const SupportTicketsView: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === activeTicket.id
          ? {
              ...t,
              status: 'resolved',
              lastReply: replyText,
            }
          : t
      )
    );

    setActiveTicket(null);
    setReplyText('');
  };

  const openCount = tickets.filter((t) => t.status === 'open').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1C1C1C] flex items-center gap-2 font-display">
            <LifeBuoy className="w-6 h-6 text-[#F15A24]" />
            <span>Support & Helpdesk Tickets</span>
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Resolve customer and driver inquiries, lost items, OTP disputes, and trip delay complaints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {openCount > 0 && (
            <span className="text-xs font-extrabold bg-red-50 text-red-600 px-3 py-1.5 rounded-2xl border border-red-200">
              {openCount} Open Tickets
            </span>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EBE5D8] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ticket ID, user, issue..."
            className="w-full text-xs font-bold text-[#1C1C1C] bg-white pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EBE5D8] focus:outline-none focus:border-[#F15A24]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'open', label: 'Open' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 active-press ${
                statusFilter === pill.id
                  ? 'bg-[#F15A24] text-white shadow-xs'
                  : 'bg-white text-[#6B6B6B] border border-[#EBE5D8] hover:text-[#1C1C1C]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#EBE5D8] text-[#6B6B6B] uppercase font-bold text-[10px] tracking-wider bg-[#FAF6EE]/50">
              <th className="py-3 px-4">Ticket</th>
              <th className="py-3 px-4">Submitted By</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Subject & Latest Reply</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2ECE1]">
            {filteredTickets.map((t) => (
              <tr key={t.id} className="hover:bg-[#FFFDF9] transition-colors">
                {/* ID */}
                <td className="py-3.5 px-4 font-mono font-extrabold text-xs text-[#1C1C1C]">
                  {t.ticketNumber}
                </td>

                {/* User */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5">
                    {t.userType === 'driver' ? (
                      <span className="w-5 h-5 rounded-full bg-[#FFF0EB] text-[#F15A24] flex items-center justify-center text-[10px]">
                        🚗
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-[#EBF7EE] text-[#00A86B] flex items-center justify-center text-[10px]">
                        👤
                      </span>
                    )}
                    <div>
                      <p className="font-bold text-[#1C1C1C] text-xs">{t.userName}</p>
                      <p className="text-[10px] text-[#6B6B6B] font-mono">{t.userPhone}</p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3.5 px-4">
                  <span className="text-[11px] font-bold bg-[#FAF6EE] px-2 py-0.5 rounded-lg border border-[#EBE5D8] text-[#1C1C1C]">
                    {t.category}
                  </span>
                </td>

                {/* Subject */}
                <td className="py-3.5 px-4 max-w-xs">
                  <div>
                    <p className="font-extrabold text-xs text-[#1C1C1C] truncate">{t.subject}</p>
                    <p className="text-[11px] text-[#6B6B6B] truncate mt-0.5">{t.lastReply}</p>
                  </div>
                </td>

                {/* Priority */}
                <td className="py-3.5 px-4">
                  {t.priority === 'high' && (
                    <span className="text-[10px] font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      High
                    </span>
                  )}
                  {t.priority === 'medium' && (
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Medium
                    </span>
                  )}
                  {t.priority === 'low' && (
                    <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      Low
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  {t.status === 'open' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                      <AlertCircle className="w-3 h-3" />
                      Open
                    </span>
                  )}
                  {t.status === 'in_progress' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      <Clock className="w-3 h-3" />
                      In Review
                    </span>
                  )}
                  {t.status === 'resolved' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#00A86B] bg-[#EBF7EE] px-2.5 py-1 rounded-full border border-[#BDE8C7]">
                      <CheckCircle2 className="w-3 h-3" />
                      Resolved
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => {
                      setActiveTicket(t);
                      setReplyText('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF6EE] hover:bg-[#F15A24] text-[#1C1C1C] hover:text-white font-extrabold text-xs border border-[#EBE5D8] transition-all active-press"
                  >
                    Reply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ticket Reply Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#EBE5D8] space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-xs bg-[#F15A24] text-white px-2.5 py-1 rounded-lg">
                  {activeTicket.ticketNumber}
                </span>
                <h3 className="font-extrabold text-sm text-[#1C1C1C]">
                  {activeTicket.category}
                </h3>
              </div>
              <button
                onClick={() => setActiveTicket(null)}
                className="w-7 h-7 rounded-full bg-[#FAF6EE] text-[#6B6B6B] hover:text-[#1C1C1C] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#FAF6EE] p-4 rounded-2xl space-y-1.5 text-xs">
              <p className="text-[10px] uppercase font-bold text-[#6B6B6B]">Subject</p>
              <p className="font-extrabold text-[#1C1C1C]">{activeTicket.subject}</p>
              <p className="text-[11px] text-[#6B6B6B] pt-1">
                From: <strong>{activeTicket.userName}</strong> ({activeTicket.userPhone})
              </p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider block mb-1">
                  Support Response / Resolution Action
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official response to passenger or driver..."
                  className="w-full text-xs font-medium text-[#1C1C1C] bg-[#FAF6EE] p-3 rounded-2xl border border-[#EBE5D8] focus:outline-none focus:border-[#F15A24]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTicket(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6B6B6B] hover:bg-[#FAF6EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#F15A24] hover:bg-[#E8380D] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 active-press"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reply & Resolve Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
