import React from 'react';
import { Star } from 'lucide-react';
import type { Deal } from '../../lib/deals';

function Stars({ value }: { value?: number }) {
  const n = Number(value || 0);
  if (!n) return <span className="text-[11px] font-bold text-[#8A8478]">Not rated</span>;
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= n ? 'fill-amber-400 text-amber-400' : 'text-[#D8D0C2]'}`}
        />
      ))}
      <span className="text-[11px] font-extrabold text-[#1C1C1C] ml-0.5">{n}</span>
    </span>
  );
}

export function DealRatings({ deal }: { deal: Deal }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] p-2.5">
        <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Buyer rating</p>
        <p className="text-[11px] font-bold text-[#6B6B6B] truncate mt-0.5">{deal.buyerName}</p>
        <div className="mt-1">
          <Stars value={deal.buyerRating} />
        </div>
      </div>
      <div className="rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] p-2.5">
        <p className="text-[10px] font-extrabold uppercase text-[#8A8478]">Seller rating</p>
        <p className="text-[11px] font-bold text-[#6B6B6B] truncate mt-0.5">{deal.sellerName}</p>
        <div className="mt-1">
          <Stars value={deal.sellerRating} />
        </div>
      </div>
    </div>
  );
}
