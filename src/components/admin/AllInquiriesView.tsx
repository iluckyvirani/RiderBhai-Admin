import React, { useState } from 'react';
import { Phone, MessageCircle, Search, Ticket } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const AllInquiriesView: React.FC = () => {
  const { inquiries } = useAppStore();
  const [q, setQ] = useState('');

  const rows = inquiries.filter((i) => {
    const s = q.toLowerCase();
    return (
      !s ||
      i.title.toLowerCase().includes(s) ||
      i.partnerName.toLowerCase().includes(s) ||
      i.riderName.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-[#1C1C1C] flex items-center gap-2">
          <Ticket className="w-6 h-6 text-[#F15A24]" />
          Customer & partner inquiries
        </h2>
        <p className="text-xs text-[#6B6B6B] mt-1">
          Call and WhatsApp contacts from customers and between partners. No in-app listing payment.
        </p>
      </div>
      <div className="relative">
        <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-3" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search inquiry…"
          className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] text-xs font-bold"
        />
      </div>
      {rows.length === 0 && <p className="text-sm font-bold text-[#6B6B6B]">No inquiries yet.</p>}
      {rows.map((i) => (
        <div key={i.id} className="p-4 rounded-2xl border border-[#EBE5D8] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-[#F15A24]">
              {i.listingType} · {i.channel}
              {i.inquirerRole === 'partner' ? ' · partner → partner' : ' · customer'}
            </span>
            <span className="text-[10px] text-[#6B6B6B]">
              {new Date(i.createdAt).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-sm font-extrabold">{i.title}</p>
          <p className="text-[11px] text-[#6B6B6B]">
            {i.riderName} → {i.partnerName} · ₹{i.price.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] font-bold flex items-center gap-1">
            {i.channel === 'call' ? <Phone className="w-3 h-3" /> : <MessageCircle className="w-3 h-3" />}
            Direct {i.channel}
          </p>
        </div>
      ))}
    </div>
  );
};
