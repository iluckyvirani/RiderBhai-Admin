import React from 'react';
import { Sparkles, ShieldCheck, Zap, Heart, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface BadgeProps {
  type: 'featured' | 'verified' | 'instant' | 'women' | 'pending' | 'rejected' | 'completed';
  text?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, text, size = 'sm', className = '' }) => {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  switch (type) {
    case 'featured':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold text-white rounded-full brand-gradient shadow-sm ${sizeClasses} ${className}`}
        >
          <Sparkles className="w-3 h-3 text-amber-200 fill-amber-200 animate-pulse" />
          <span>{text || 'FEATURED BOOST'}</span>
        </span>
      );

    case 'verified':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold text-[#2E9E5B] bg-[#EBF7F0] border border-[#B8E6CB] rounded-full ${sizeClasses} ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#2E9E5B]" />
          <span>{text || 'Govt ID Verified'}</span>
        </span>
      );

    case 'instant':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold text-[#F15A24] bg-[#FFF0EB] border border-[#FFD8CB] rounded-full ${sizeClasses} ${className}`}
        >
          <Zap className="w-3 h-3 text-[#F15A24] fill-[#F15A24]" />
          <span>{text || 'Instant Booking'}</span>
        </span>
      );

    case 'women':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold text-[#C2185B] bg-[#FCE4EC] border border-[#F8BBD0] rounded-full ${sizeClasses} ${className}`}
        >
          <Heart className="w-3 h-3 text-[#C2185B] fill-[#C2185B]" />
          <span>{text || 'Women Only'}</span>
        </span>
      );

    case 'pending':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold text-[#B45309] bg-[#FEF3C7] border border-[#FDE68A] rounded-full ${sizeClasses} ${className}`}
        >
          <Clock className="w-3 h-3 text-[#B45309]" />
          <span>{text || 'Pending Verification'}</span>
        </span>
      );

    case 'rejected':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold text-[#D64545] bg-[#FDEDED] border border-[#FACBCB] rounded-full ${sizeClasses} ${className}`}
        >
          <XCircle className="w-3 h-3 text-[#D64545]" />
          <span>{text || 'Verification Rejected'}</span>
        </span>
      );

    case 'completed':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold text-[#2E9E5B] bg-[#EBF7F0] rounded-full ${sizeClasses} ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2E9E5B]" />
          <span>{text || 'Trip Completed'}</span>
        </span>
      );

    default:
      return null;
  }
};
