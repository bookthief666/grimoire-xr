import React, { useMemo, useState } from 'react';
import { codexStyleSelectionSummary, filterCodexStyles } from './codexStyleLibrary.js';

const CodexStyleLibrary = ({ styles = [], selectedStyle = null, onSelect, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => filterCodexStyles({ styles, query }), [styles, query]);
  const summary = codexStyleSelectionSummary({ selectedStyle, total: styles.length });

  return (
    <section className="codex-style-library mb-6 border border-[#b8860b]/30 bg-black/35 shadow-[inset_0_0_26px_rgba(184,134,11,0.035)]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        className="w-full px-4 py-4 text-left flex items-start justify-between gap-4 hover:bg-[#b8860b]/5 transition-colors"
      >
        <span>
          <span className="block font-header text-[10px] tracking-[0.16em] text-[#e4c46f]">STYLE LIBRARY · {summary.total}</span>
          <span className="block mt-2 font-body text-lg leading-none text-[#d8c89f]">{summary.name}</span>
          <span className="block mt-2 font-mono text-[8px] tracking-[0.12em] text-[#b8860b]/60">IMAGE DIRECTION · PRESENTATION ONLY</span>
        </span>
        <span aria-hidden="true" className="font-header text-[#d9b45b] text-xs mt-1">{open ? '−' : '+'}</span>
      </button>

      {open ? (
        <div className="border-t border-[#b8860b]/20 p-3">
          <label className="block font-header text-[8px] tracking-[0.14em] text-[#b8860b]/75 mb-2" htmlFor="codex-style-search">
            SEARCH THE ATELIER
          </label>
          <input
            id="codex-style-search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="e.g. Blake, manuscript, Thelemic…"
            className="w-full bg-black/70 border border-[#b8860b]/35 px-3 py-3 font-mono text-sm text-[#e7d4a0] placeholder:text-[#b8860b]/35 focus:outline-none focus:border-[#d9b45b]/80"
          />

          <div className="mt-3 flex items-center justify-between font-mono text-[8px] tracking-[0.08em] text-[#b8860b]/55">
            <span>{filtered.length} MATCH{filtered.length === 1 ? '' : 'ES'}</span>
            {query ? (
              <button type="button" onClick={() => setQuery('')} className="text-[#d9b45b]/75 hover:text-[#f5dfa4]">CLEAR</button>
            ) : null}
          </div>

          <div className="mt-3 max-h-[19rem] overflow-y-auto native-scroll pr-1 space-y-2" role="listbox" aria-label="Tarot visual styles">
            {filtered.map(style => {
              const active = style?.id === selectedStyle?.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={disabled}
                  onClick={() => onSelect?.(style)}
                  className={`block w-full text-left px-3 py-3 border transition-all disabled:opacity-40 ${active
                    ? 'border-[#d9b45b] bg-[#d9b45b]/14 text-[#f5dfa4] shadow-[0_0_12px_rgba(217,180,91,0.10)]'
                    : 'border-[#b8860b]/22 text-[#c9a859] hover:border-[#b8860b]/60 hover:bg-[#b8860b]/5'}`}
                >
                  <span className="block font-body text-xl leading-none">{style.name}</span>
                  {active ? <span className="block mt-2 font-mono text-[8px] tracking-[0.12em] text-[#d9b45b]/70">CURRENT IMAGE CURRENT</span> : null}
                </button>
              );
            })}
            {!filtered.length ? (
              <div className="border border-[#b8860b]/20 p-4 font-mono text-[9px] leading-relaxed text-[#b8860b]/55">
                NO STYLE ANSWERS THAT NAME. TRY A BROADER FRAGMENT.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default CodexStyleLibrary;
