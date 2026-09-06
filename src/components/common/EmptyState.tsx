import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No record found',
  description,
  compact = false,
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center border border-dashed border-[#E0D8C8] bg-[#FAF6EE] text-center ${
        compact ? 'rounded-2xl px-4 py-8' : 'rounded-3xl px-6 py-14'
      }`}
    >
      <div
        className={`flex items-center justify-center rounded-full bg-white shadow-[0_8px_20px_rgba(28,28,28,0.04)] ${
          compact ? 'h-12 w-12' : 'h-16 w-16'
        }`}
      >
        <Icon className={compact ? 'h-5 w-5 text-[#F15A24]' : 'h-7 w-7 text-[#F15A24]'} strokeWidth={1.8} />
      </div>
      <p className={`font-extrabold text-[#1C1C1C] ${compact ? 'mt-3 text-sm' : 'mt-4 text-base'}`}>{title}</p>
      {description && (
        <p className={`max-w-sm text-[#8A8478] ${compact ? 'mt-1 text-[11px] font-medium' : 'mt-1.5 text-xs font-medium leading-relaxed'}`}>
          {description}
        </p>
      )}
    </div>
  );
}
