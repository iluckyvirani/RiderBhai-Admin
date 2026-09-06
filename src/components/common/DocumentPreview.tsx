import { useState } from 'react';
import { Expand, FileText, X } from 'lucide-react';
import { isPreviewableImage } from '../../lib/kyc';

export function DocumentPreview({
  label,
  src,
  emptyText = 'Not uploaded',
}: {
  label: string;
  src?: string;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const image = isPreviewableImage(src);

  if (!src) {
    return (
      <div className="rounded-2xl border border-[#EBE5D8] bg-white p-2">
        <p className="mb-1 text-[10px] font-extrabold uppercase text-[#6B6B6B]">{label}</p>
        <p className="text-[11px] font-bold text-[#8A8478]">{emptyText}</p>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => (image ? setOpen(true) : window.open(src, '_blank', 'noopener,noreferrer'))}
        className="w-full rounded-2xl border border-[#EBE5D8] bg-white p-2 text-left transition hover:border-[#F15A24]"
      >
        <p className="mb-1 text-[10px] font-extrabold uppercase text-[#6B6B6B]">{label}</p>
        {image ? (
          <div className="relative">
            <img src={src} alt={label} className="h-24 w-full rounded-xl object-cover" />
            <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-extrabold text-white">
              <Expand className="h-3 w-3" /> View
            </span>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#F15A24]">
            <FileText className="h-3.5 w-3.5" /> Open document
          </span>
        )}
      </button>

      {open && image && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="relative max-h-[90vh] w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-extrabold text-white">{label}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-white/15 p-2 text-white hover:bg-white/25"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <img src={src} alt={label} className="max-h-[80vh] w-full rounded-2xl object-contain bg-black" />
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs font-extrabold text-white/80 hover:text-white"
            >
              Open in new tab
            </a>
          </div>
        </div>
      )}
    </>
  );
}
