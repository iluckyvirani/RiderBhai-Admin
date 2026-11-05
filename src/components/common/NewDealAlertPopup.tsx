import React, { useEffect } from 'react';
import { X, PhoneCall } from 'lucide-react';
import { playBuzz } from '../../lib/sound';
import type { Deal } from '../../lib/deals';

interface NewDealAlertPopupProps {
  deal: Deal;
  onDismiss: () => void;
  onView: () => void;
}

const AUTO_DISMISS_MS = 7000;

export const NewDealAlertPopup: React.FC<NewDealAlertPopupProps> = ({ deal, onDismiss, onView }) => {
  useEffect(() => {
    playBuzz();
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deal.id]);

  return (
    <div className="fixed top-4 right-4 z-[80] w-full max-w-sm animate-slide-in-right">
      <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-brand-500 overflow-hidden">
        <div className="relative p-4 flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0 animate-ring-pulse">
            <PhoneCall className="w-5 h-5 text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600">
              New {deal.listingType} inquiry via Ride Bhai
            </p>
            <h4 className="text-sm font-black text-[#1C1C1C] mt-0.5 truncate">{deal.title}</h4>
            <p className="text-[11px] text-[#6B6B6B] mt-0.5 truncate">
              {deal.buyerName} wants {deal.sellerName}
            </p>
            <button
              type="button"
              onClick={onView}
              className="mt-2 px-3 py-1.5 rounded-full bg-brand-500 text-white text-[11px] font-extrabold hover:bg-brand-600"
            >
              Open inquiry
            </button>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="w-7 h-7 rounded-full bg-surface-bg flex items-center justify-center text-[#6B6B6B] shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="h-1 bg-brand-100">
          <div
            className="h-full bg-brand-500 animate-shrink-bar"
            style={{ animationDuration: `${AUTO_DISMISS_MS}ms` }}
          />
        </div>
      </div>
    </div>
  );
};
