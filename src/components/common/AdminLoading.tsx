import { Logo } from './Logo';

function Bone({ className = '' }: { className?: string }) {
  return <div className={`skeleton-bone ${className}`} />;
}

export function ButtonSpinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-white/30 border-t-white ${className}`}
      aria-hidden
    />
  );
}

export function SessionSplash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3EEE4] px-6">
      <div className="flex w-full max-w-sm flex-col items-center rounded-[28px] border border-[#E8E0D0] bg-white px-8 py-10 shadow-[0_24px_60px_rgba(28,28,28,0.08)]">
        <Logo showTagline={false} />
        <div className="relative mt-8 h-12 w-12">
          <span className="absolute inset-0 rounded-full border-2 border-[#F15A24]/15" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#F15A24]" />
        </div>
        <p className="mt-5 text-sm font-extrabold text-[#1C1C1C]">Opening admin</p>
        <p className="mt-1 text-center text-xs font-medium text-[#8A8478]">Checking your session…</p>
        <div className="mt-6 flex w-full gap-1.5">
          <Bone className="h-1.5 flex-1 rounded-full" />
          <Bone className="h-1.5 flex-1 rounded-full" />
          <Bone className="h-1.5 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function AdminPageSkeleton({
  variant = 'list',
  rows = 5,
}: {
  variant?: 'stats' | 'dashboard' | 'table' | 'cards' | 'list';
  rows?: number;
}) {
  if (variant === 'stats' || variant === 'dashboard') {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading dashboard">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          {Array.from({ length: variant === 'dashboard' ? 10 : 7 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-4">
              <Bone className="h-4 w-4 rounded-md" />
              <Bone className="h-8 w-16 rounded-lg" />
              <Bone className="h-3 w-24 rounded-md" />
            </div>
          ))}
        </div>
        {variant === 'dashboard' && (
          <>
            <Bone className="h-64 w-full rounded-3xl" />
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <Bone className="h-72 w-full rounded-3xl" />
              <Bone className="h-72 w-full rounded-3xl" />
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#EBE5D8]" aria-busy="true" aria-label="Loading table">
        <div className="grid grid-cols-4 gap-4 bg-[#FAF6EE] px-4 py-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bone key={i} className="h-2.5 rounded-md" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 items-center gap-4 border-t border-[#F2ECE1] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Bone className="h-10 w-10 shrink-0 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Bone className="h-3 w-28 rounded-md" />
                <Bone className="h-2.5 w-20 rounded-md" />
              </div>
            </div>
            <Bone className="h-3 w-20 rounded-md" />
            <Bone className="h-6 w-20 rounded-full" />
            <Bone className="ml-auto h-3 w-16 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading cards">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-4">
            <div className="flex justify-between">
              <Bone className="h-6 w-24 rounded-xl" />
              <Bone className="h-5 w-12 rounded-lg" />
            </div>
            <Bone className="h-4 w-40 rounded-md" />
            <Bone className="h-3 w-28 rounded-md" />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Bone className="h-20 rounded-2xl" />
              <Bone className="h-20 rounded-2xl" />
            </div>
            <Bone className="h-9 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading list">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-40 rounded-md" />
              <Bone className="h-3 w-56 rounded-md" />
            </div>
            <Bone className="h-5 w-16 rounded-lg" />
          </div>
          <Bone className="h-3 w-36 rounded-md" />
          <Bone className="h-8 w-24 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
