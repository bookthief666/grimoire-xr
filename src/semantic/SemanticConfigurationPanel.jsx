import React, { useMemo, useState } from 'react';
import { INTERPRETIVE_LENS_CATALOG } from './interpretiveLensCatalog.js';
import { semanticSystemPresentationName } from './semanticRuntimeAdapter.js';

const SYSTEMS = Object.freeze([
  { id: 'thoth', label: 'BOOK OF THOTH', note: 'SOURCE-QUALIFIED THOTH PACK' },
  { id: 'rws', label: 'RIDER–WAITE–SMITH', note: 'COMPATIBILITY LABELS · SOURCE PACK PENDING' },
  { id: 'marseille', label: 'TAROT DE MARSEILLE', note: 'COMPATIBILITY LABELS · SOURCE PACK PENDING' },
]);

const RELATIONS = Object.freeze([
  { id: 'crowley_lxxviii_dignities', label: 'CROWLEY · LIBER LXXVIII DIGNITIES', short: 'CROWLEY / LXXVIII' },
  { id: 'disabled', label: 'NO INTER-CARD METHOD', short: 'NO INTER-CARD METHOD' },
]);

const THEMES = Object.freeze([
  { id: 'none', label: 'NONE' },
  { id: 'giordano_bruno', label: 'BRUNO' },
  { id: 'astarte_venus', label: 'ASTARTE / VENUS' },
]);

const DEPTHS = Object.freeze([
  { id: 'neophyte', label: 'NEOPHYTE', note: 'clear / concise' },
  { id: 'adept', label: 'ADEPT', note: 'technical / balanced' },
  { id: 'magus', label: 'MAGUS', note: 'dense / initiated' },
]);

const smallButton = active => `px-3 py-3 border text-[9px] font-header tracking-wider transition-all ${active
  ? 'border-[#d9b45b] bg-[#d9b45b]/15 text-[#f5dfa4] shadow-[0_0_12px_rgba(217,180,91,0.15)]'
  : 'border-[#b8860b]/25 text-[#c29e50] hover:border-[#b8860b]/60 hover:text-[#d9b45b] hover:bg-[#b8860b]/5'}`;

const DisclosureSection = ({ id, title, summary, warning = null, open, onToggle, children }) => (
  <section className="border-t border-[#b8860b]/20 first:border-t-0">
    <button
      type="button"
      aria-expanded={open}
      aria-controls={`doctrine-${id}`}
      onClick={onToggle}
      className="w-full py-4 text-left flex items-start justify-between gap-4 group"
    >
      <span className="min-w-0">
        <span className="block font-header text-[10px] leading-relaxed tracking-[0.16em] text-[#e0bd64] group-hover:text-[#f5dfa4]">{title}</span>
        <span className="block mt-2 font-mono text-[9px] leading-relaxed text-[#d0b46d]/70 break-words">{summary}</span>
        {warning ? (
          <span className="inline-block mt-2 border border-red-700/50 bg-red-950/25 px-2 py-1 font-mono text-[8px] tracking-[0.1em] text-red-400/85">
            {warning}
          </span>
        ) : null}
      </span>
      <span aria-hidden="true" className="shrink-0 border border-[#b8860b]/25 w-7 h-7 grid place-items-center font-header text-[10px] text-[#d9b45b] group-hover:border-[#d9b45b]/60">
        {open ? '−' : '+'}
      </span>
    </button>
    {open ? <div id={`doctrine-${id}`} className="pb-5">{children}</div> : null}
  </section>
);

const SemanticConfigurationPanel = ({ config, onPatch, hasActiveReading = false, disabled = false }) => {
  const [openSections, setOpenSections] = useState(() => new Set(['system', 'lenses']));
  if (!config) return null;

  const selectedLenses = useMemo(() => new Set(config.interpretiveLenses || []), [config.interpretiveLenses]);
  const toggleSection = id => {
    setOpenSections(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleLens = id => {
    if (disabled) return;
    const next = new Set(selectedLenses);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onPatch?.({ interpretiveLenses: [...next] });
  };

  const system = SYSTEMS.find(entry => entry.id === config.tarotSystem) || SYSTEMS[0];
  const relation = RELATIONS.find(entry => entry.id === config.relationMethod) || RELATIONS[1];
  const ritualTheme = THEMES.find(entry => entry.id === config.ritualTheme) || THEMES[0];
  const depth = DEPTHS.find(entry => entry.id === config.readingDepth) || DEPTHS[1];
  const selectedLensLabels = [...selectedLenses].map(id => INTERPRETIVE_LENS_CATALOG.find(entry => entry.id === id)?.shortLabel || id);
  const sourceLabel = config.correspondenceProfile === 'thoth_native'
    ? 'THOTH NATIVE · SOURCE QUALIFIED'
    : 'NONE · SOURCE PACK PENDING';
  const relationAuthority = config.relationMethod === 'crowley_lxxviii_dignities'
    ? (config.tarotSystem === 'thoth' ? 'INHERITED THOTH METHOD' : 'EXPLICIT DIRECT METHOD')
    : 'DISABLED';

  return (
    <div className="semantic-config-panel relative overflow-hidden border border-[#b8860b]/35 bg-black/45 px-4 shadow-[inset_0_0_30px_rgba(184,134,11,0.035)]">
      <div className="pointer-events-none absolute -top-14 -right-14 w-40 h-40 rounded-full border border-[#b8860b]/10" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-8 -right-8 w-28 h-28 rotate-45 border border-[#b8860b]/10" aria-hidden="true" />

      <div className="py-5 relative border-b border-[#b8860b]/20">
        <div className="font-header text-xs tracking-[0.2em] text-[#f0d07c]">READING DOCTRINE</div>
        <div className="font-mono text-[9px] leading-relaxed mt-2 text-[#c6a75b]/75">
          TAROT FACTS ARE FIXED FIRST · LENSES SHAPE INTERPRETATION ONLY
        </div>
      </div>

      <DisclosureSection
        id="system"
        title="TAROT SYSTEM"
        summary={system.label}
        warning={hasActiveReading ? 'RECASTS CURRENT READING' : null}
        open={openSections.has('system')}
        onToggle={() => toggleSection('system')}
      >
        <div className="grid grid-cols-1 gap-2">
          {SYSTEMS.map(entry => (
            <button
              key={entry.id}
              type="button"
              disabled={disabled}
              onClick={() => onPatch?.({ tarotSystem: entry.id })}
              className={`${smallButton(config.tarotSystem === entry.id)} text-left disabled:opacity-40`}
            >
              <span className="block">{entry.label}</span>
              <span className="block mt-2 font-mono text-[8px] leading-relaxed opacity-60">{entry.note}</span>
            </button>
          ))}
        </div>
      </DisclosureSection>

      <DisclosureSection
        id="correspondence"
        title="CORRESPONDENCE AUTHORITY"
        summary={sourceLabel}
        warning={hasActiveReading ? 'RECASTS CURRENT READING' : null}
        open={openSections.has('correspondence')}
        onToggle={() => toggleSection('correspondence')}
      >
        {config.tarotSystem === 'thoth' ? (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={disabled} onClick={() => onPatch?.({ correspondenceProfile: 'thoth_native' })} className={`${smallButton(config.correspondenceProfile === 'thoth_native')} disabled:opacity-40`}>THOTH NATIVE</button>
            <button type="button" disabled={disabled} onClick={() => onPatch?.({ correspondenceProfile: 'none' })} className={`${smallButton(config.correspondenceProfile === 'none')} disabled:opacity-40`}>NONE</button>
          </div>
        ) : (
          <div className="border border-[#b8860b]/25 bg-[#b8860b]/5 px-3 py-3 font-mono text-[9px] leading-relaxed text-[#c8aa62]/75">
            NO REVIEWED {semanticSystemPresentationName(config)} CORRESPONDENCE PACK IS CLAIMED.
          </div>
        )}
      </DisclosureSection>

      <DisclosureSection
        id="relation"
        title="RELATION METHOD"
        summary={relation.short}
        warning={hasActiveReading ? 'RECASTS CURRENT READING' : null}
        open={openSections.has('relation')}
        onToggle={() => toggleSection('relation')}
      >
        <div className="grid grid-cols-1 gap-2">
          {RELATIONS.map(method => (
            <button
              key={method.id}
              type="button"
              disabled={disabled}
              onClick={() => onPatch?.({ relationMethod: method.id })}
              className={`${smallButton(config.relationMethod === method.id)} text-left disabled:opacity-40`}
            >
              {method.label}
            </button>
          ))}
        </div>
      </DisclosureSection>

      <DisclosureSection
        id="lenses"
        title="INTERPRETIVE LENSES"
        summary={selectedLensLabels.length ? selectedLensLabels.join(' · ') : 'NONE SELECTED · MULTI-SELECT'}
        open={openSections.has('lenses')}
        onToggle={() => toggleSection('lenses')}
      >
        <div className="grid grid-cols-2 gap-2">
          {INTERPRETIVE_LENS_CATALOG.map(entry => {
            const active = selectedLenses.has(entry.id);
            return (
              <button
                key={entry.id}
                type="button"
                aria-pressed={active}
                disabled={disabled}
                title={entry.description}
                onClick={() => toggleLens(entry.id)}
                className={`${smallButton(active)} text-left min-h-[48px] disabled:opacity-40`}
              >
                <span className="block">{entry.shortLabel}</span>
                <span className="block mt-2 font-mono text-[7px] opacity-55 leading-tight">{entry.family}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 border-l border-[#d9b45b]/35 pl-3 font-mono text-[8px] leading-relaxed text-[#d9b45b]/70">
          INTERPRETATION ONLY · NEVER REWRITES CARD IDENTITY, CORRESPONDENCES OR RELATIONS
        </div>
      </DisclosureSection>

      <DisclosureSection
        id="theme"
        title="RITUAL THEME"
        summary={`${ritualTheme.label} · PRESENTATION ONLY`}
        open={openSections.has('theme')}
        onToggle={() => toggleSection('theme')}
      >
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map(theme => (
            <button key={theme.id} type="button" disabled={disabled} onClick={() => onPatch?.({ ritualTheme: theme.id })} className={`${smallButton(config.ritualTheme === theme.id)} disabled:opacity-40`}>
              {theme.label}
            </button>
          ))}
        </div>
      </DisclosureSection>

      <DisclosureSection
        id="depth"
        title="READING DEPTH"
        summary={`${depth.label} · ${depth.note.toUpperCase()}`}
        open={openSections.has('depth')}
        onToggle={() => toggleSection('depth')}
      >
        <div className="grid grid-cols-3 gap-2">
          {DEPTHS.map(entry => (
            <button key={entry.id} type="button" disabled={disabled} onClick={() => onPatch?.({ readingDepth: entry.id })} className={`${smallButton(config.readingDepth === entry.id)} disabled:opacity-40`}>
              <span className="block">{entry.label}</span>
              <span className="block mt-2 font-mono text-[7px] opacity-55">{entry.note}</span>
            </button>
          ))}
        </div>
      </DisclosureSection>

      <div className="border-t border-[#b8860b]/30 py-4 font-mono text-[9px] leading-[1.65] tracking-[0.04em] text-[#c8aa62]/80">
        <div><span className="text-[#e0bd64]">SYSTEM</span> · {semanticSystemPresentationName(config)}</div>
        <div><span className="text-[#e0bd64]">SOURCE</span> · {sourceLabel}</div>
        <div><span className="text-[#e0bd64]">RELATION</span> · {relationAuthority}</div>
        <div><span className="text-[#e0bd64]">LENSES</span> · {(config.interpretiveLenses || []).length || 0}</div>
      </div>
    </div>
  );
};

export default SemanticConfigurationPanel;
