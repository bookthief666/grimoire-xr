import React, { useEffect, useRef } from 'react';

export default function ContinuityReturnDialog({ open, onCancel, onConfirm }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus?.();
    const handleKeyDown = event => {
      if (event.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/80 backdrop-blur-sm px-4 py-[max(1.5rem,env(safe-area-inset-top))]"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onCancel?.();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="continuity-return-title"
        aria-describedby="continuity-return-description"
        className="relative w-full max-w-lg overflow-hidden border border-[#b8860b]/70 bg-[#060403] shadow-[0_0_50px_rgba(184,134,11,0.16),0_0_26px_rgba(255,0,0,0.08)]"
      >
        <div className="h-px bg-gradient-to-r from-transparent via-[#e5c158] to-transparent" />
        <div className="p-5 sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center border border-[#b8860b]/70 text-[#e5c158] font-header text-[10px]">Θ</div>
            <div>
              <div className="font-header text-[8px] tracking-[0.22em] text-[#8f7442]">CONTINUITY SEAL</div>
              <h2 id="continuity-return-title" className="mt-2 font-header text-sm sm:text-base text-[#e5c158]">RETURN TO THE THRESHOLD?</h2>
            </div>
          </div>

          <p id="continuity-return-description" className="font-body text-xl leading-snug text-[#d6c9ad]">
            Your last stable Grimoire is already sealed in local continuity storage. Returning to the threshold will not erase it; reload the app to reopen the saved session.
          </p>

          <div className="mt-5 border-l border-[#b8860b]/50 pl-4 font-mono text-[11px] leading-relaxed text-[#8f8064]">
            CURRENT SESSION REMAINS RECOVERABLE
            <br />
            CANONICAL RECORD AND SAVED ARTWORK ARE PRESERVED
          </div>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              className="min-h-12 border border-[#b8860b]/60 bg-[#b8860b]/10 px-4 py-3 font-header text-[9px] text-[#e5c158] transition hover:bg-[#b8860b]/20 focus:outline-none focus:ring-1 focus:ring-[#e5c158]"
            >
              STAY WITH THE READING
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="min-h-12 border border-red-700/80 bg-red-950/20 px-4 py-3 font-header text-[9px] text-red-500 transition hover:bg-red-900/30 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              RETURN TO THRESHOLD
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
