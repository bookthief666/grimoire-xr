import React from 'react';
import { INTERPRETIVE_LENS_CATALOG } from './interpretiveLensCatalog.js';
import { semanticSystemPresentationName } from './semanticRuntimeAdapter.js';

const SYSTEMS = Object.freeze([
  { id: 'thoth', label: 'BOOK OF THOTH', note: 'SOURCE-QUALIFIED THOTH PACK' },
  { id: 'rws', label: 'RIDER–WAITE–SMITH', note: 'COMPATIBILITY LABELS · SOURCE PACK PENDING' },
  { id: 'marseille', label: 'TAROT DE MARSEILLE', note: 'COMPATIBILITY LABELS · SOURCE PACK PENDING' },
]);

const RELATIONS = Object.freeze([
  { id: 'crowley_lxxviii_dignities', label: 'CROWLEY · LIBER LXXVIII DIGNITIES' },
  { id: 'disabled', label: 'NO INTER-CARD METHOD' },
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

const smallButton = active => `px-2 py-2 border text-[9px] font-header tracking-wider transition-all ${active
  ? 'border-[#d9b45b] bg-[#d9b45b]/15 text-[#f5dfa4] shadow-[0_0_12px_rgba(217,180,91,0.15)]'
  : 'border-[#b8860b]/25 text-[#b8860b]/70 hover:border-[#b8860b]/60 hover:text-[#d9b45b]'}`;

const Section = ({ title, children, note }) => (
  <section className="mb-6 border-t border-[#b8860b]/20 pt-4 first:border-t-0 first:pt-0">
    <div className="flex items-baseline justify-between gap-3 mb-3">
      <h3 className="font-header text-[10px] tracking-[0.18em] text-[#d9b45b]">{title}</h3>
      {note ? <span className="font-mono text-[9px] text-[#b8860b]/45 text-right">{note}</span> : null}
    </div>
    {children}
  </section>
);

const SemanticConfigurationPanel = ({ config, onPatch, hasActiveReading = false, disabled = false }) => {
  if (!config) return null;
  const selectedLenses = new Set(config.interpretiveLenses || []);
  const toggleLens = id => {
    if (disabled) return;
    const next = new Set(selectedLenses);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onPatch?.({ interpretiveLenses: [...next] });
  };

  const sourceLabel = config.correspondenceProfile === 'thoth_native'
    ? 'THOTH NATIVE · SOURCE QUALIFIED'
    : 'NONE · SOURCE PACK PENDING';
  const relationAuthority = config.relationMethod === 'crowley_lxxviii_dignities'
    ? (config.tarotSystem === 'thoth' ? 'INHERITED THOTH METHOD' : 'EXPLICIT DIRECT METHOD')
    : 'DISABLED';

  return (
    <div className="semantic-config-panel relative overflow-hidden border border-[#b8860b]/35 bg-black/45 p-4 shadow-[inset_0_0_30px_rgba(184,134,11,0.035)]">
      <div className="pointer-events-none absolute -top-14 -right-14 w-40 h-40 rounded-full border border-[#b8860b]/10" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-8 -right-8 w-28 h-28 rotate-45 border border-[#b8860b]/10" aria-hidden="true" />

      <div className="mb-5 relative">
        <div className="font-header text-xs tracking-[0.2em] text-[#f0d07c]">READING DOCTRINE</div>
        <div className="font-mono text-[9px] mt-1 text-[#b8860b]/55">
          ORTHOGONAL SEMANTIC CONFIG · LENSES NEVER ALTER TAROT FACTS
        </div>
      </div>

      <Section title="TAROT SYSTEM" note={hasActiveReading ? 'changing this closes the current reading' : null}>
        <div className="grid grid-cols-1 gap-2">
          {SYSTEMS.map(system => (
            <button
              key={system.id}
              type="button"
              disabled={disabled}
              onClick={() => onPatch?.({ tarotSystem: system.id })}
              className={`${smallButton(config.tarotSystem === system.id)} text-left disabled:opacity-40`}
            >
              <span className="block">{system.label}</span>
              <span className="block mt-1 font-mono text-[8px] opacity-55">{system.note}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="CORRESPONDENCE AUTHORITY">
        {config.tarotSystem === 'thoth' ? (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={disabled} onClick={() => onPatch?.({ correspondenceProfile: 'thoth_native' })} className={`${smallButton(config.correspondenceProfile === 'thoth_native')} disabled:opacity-40`}>THOTH NATIVE</button>
            <button type="button" disabled={disabled} onClick={() => onPatch?.({ correspondenceProfile: 'none' })} className={`${smallButton(config.correspondenceProfile === 'none')} disabled:opacity-40`}>NONE</button>
          </div>
        ) : (
          <div className="border border-[#b8860b]/20 px-3 py-2 font-mono text-[9px] text-[#b8860b]/60">
            NO REVIEWED {semanticSystemPresentationName(config)} CORRESPONDENCE PACK IS CLAIMED.
          </div>
        )}
      </Section>

      <Section title="RELATION METHOD" note={hasActiveReading ? 'changing this closes the current reading' : null}>
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
      </Section>

      <Section title="INTERPRETIVE LENSES" note="multi-select · interpretation only">
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
                className={`${smallButton(active)} text-left min-h-[42px] disabled:opacity-40`}
              >
                <span className="block">{entry.shortLabel}</span>
                <span className="block mt-1 font-mono text-[7px] opacity-45 leading-tight">{entry.family}</span>
              </button>
            );
          })}
        </div>
        {selectedLenses.size ? (
          <div className="mt-3 p-2 border-l border-[#d9b45b]/35 font-mono text-[9px] leading-relaxed text-[#d9b45b]/65">
            {[...selectedLenses].map(id => INTERPRETIVE_LENS_CATALOG.find(entry => entry.id === id)?.label || id).join(' · ')}
          </div>
        ) : null}
      </Section>

      <Section title="RITUAL THEME" note="presentation · not doctrine">
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map(theme => (
            <button key={theme.id} type="button" disabled={disabled} onClick={() => onPatch?.({ ritualTheme: theme.id })} className={`${smallButton(config.ritualTheme === theme.id)} disabled:opacity-40`}>
              {theme.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="READING DEPTH">
        <div className="grid grid-cols-3 gap-2">
          {DEPTHS.map(depth => (
            <button key={depth.id} type="button" disabled={disabled} onClick={() => onPatch?.({ readingDepth: depth.id })} className={`${smallButton(config.readingDepth === depth.id)} disabled:opacity-40`}>
              <span className="block">{depth.label}</span>
              <span className="block mt-1 font-mono text-[7px] opacity-45">{depth.note}</span>
            </button>
          ))}
        </div>
      </Section>

      <div className="border-t border-[#b8860b]/25 pt-3 font-mono text-[8px] leading-relaxed text-[#b8860b]/55">
        <div>SYSTEM · {semanticSystemPresentationName(config)}</div>
        <div>SOURCE · {sourceLabel}</div>
        <div>RELATION · {relationAuthority}</div>
        <div>LENSES · {(config.interpretiveLenses || []).length || 0}</div>
      </div>
    </div>
  );
};

export default SemanticConfigurationPanel;
