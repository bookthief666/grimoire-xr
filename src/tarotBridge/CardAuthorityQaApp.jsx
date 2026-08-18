import React from 'react';
import CardRelicAuthorityPanel from './CardRelicAuthorityPanel.jsx';
import { buildCanonicalDeckGenesis } from './canonicalDeckGenesis.js';
import { buildCardRelicAuthority } from './cardAuthority.js';

const tradition = Object.freeze({ id: 'thoth', name: 'Book of Thoth' });
const baseCard = buildCanonicalDeckGenesis({ tradition })[23];
const card = Object.freeze({
  ...baseCard,
  exegesis: 'QA generated interpretation: the image of dominion is being interpreted for the subject, not asserted as source text.',
  exegesisAuthority: 'MODEL_GENERATED_INTERPRETATION',
  meta: Object.freeze({
    hebrew: 'QA reflection',
    planet: 'QA reflection',
    alchemical: 'QA reflection',
    daimon: 'QA reflection',
    gematria: 42,
  }),
  interpretiveMetaAuthority: 'MODEL_GENERATED_REFLECTION',
  visual: 'QA-generated visual direction.',
  visualAuthority: 'MODEL_GENERATED_IMAGE_DIRECTION',
  generation: Object.freeze({
    provider: 'comfyui',
    mode: 'preview',
    width: 640,
    height: 960,
    steps: 18,
    seed: 424242,
  }),
});

const authority = buildCardRelicAuthority({ card, tradition });
const checks = Object.freeze({
  cardId: authority?.identity.cardId === 'minor.staffs.two',
  displayName: authority?.identity.displayName === 'TWO OF WANDS',
  sourceQualified: authority?.sourceQualification === 'SOURCE_QUALIFIED',
  nativeTitle: authority?.expressionFields.find(field => field.fieldId === 'nativeTitle')?.value === 'DOMINION',
  planet: authority?.correspondenceFields.find(field => field.fieldId === 'planet')?.value === 'MARS',
  zodiac: authority?.correspondenceFields.find(field => field.fieldId === 'zodiacSign')?.value === 'ARIES',
  exegesisAuthority: authority?.generatedLayers.exegesis === 'MODEL_GENERATED_INTERPRETATION',
  metaAuthority: authority?.generatedLayers.reflectiveMeta === 'MODEL_GENERATED_REFLECTION',
});
const pass = Object.values(checks).every(Boolean);

export default function CardAuthorityQaApp() {
  return (
    <main className="min-h-dvh bg-black text-red-500 p-4 sm:p-8 font-body">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="border border-red-900 p-5 bg-[#070000]">
          <div className="font-header text-[8px] text-red-500/60">GRIMOIRE XR · 0.38</div>
          <h1 className="font-header text-lg sm:text-2xl text-[#e5c158] mt-3">Card Relic Authority QA</h1>
          <p className="mt-4 text-sm text-white/50">Provider-free fixture. Canonical Thoth facts must remain visibly separate from generated interpretation.</p>
          <div className={`mt-4 inline-flex border px-3 py-2 font-header text-[9px] ${pass ? 'border-emerald-500 text-emerald-300' : 'border-red-600 text-red-400'}`}>{pass ? 'PASS' : 'FAIL'}</div>
        </header>

        <section className="border border-red-900/60 p-5 bg-[#070000]">
          <div className="font-header text-[8px] text-red-500/60 mb-3">FIXTURE</div>
          <h2 className="font-header text-base text-[#e5c158]">{card.name}</h2>
          <p className="text-xs text-white/35 mt-2">{card.canonicalCardId}</p>
        </section>

        <CardRelicAuthorityPanel card={card} tradition={tradition} />

        <section className="border border-red-900/60 p-5 bg-[#070000] space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-header text-[8px] text-red-400">AI-GENERATED EXEGESIS</span>
              <span className="border border-red-600/60 px-2 py-1 font-header text-[7px] text-red-400">NOT SOURCE FACT</span>
            </div>
            <p className="mt-3 text-sm text-red-300/80">{card.exegesis}</p>
          </div>
          <div className="border-t border-red-900/50 pt-4">
            <div className="font-header text-[8px] text-red-400 mb-3">AI-GENERATED REFLECTION METADATA · NOT SOURCE FACT</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(card.meta).map(([key, value]) => (
                <div key={key} className="border border-red-900/50 p-3">
                  <div className="font-header text-[7px] text-red-500/50 uppercase">{key}</div>
                  <div className="text-xs text-red-300 mt-1">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border border-red-900/60 p-5 bg-[#070000]">
          <div className="font-header text-[8px] text-red-500/60 mb-3">SELF-GRADING</div>
          <div className="space-y-2">
            {Object.entries(checks).map(([key, ok]) => (
              <div key={key} className="flex justify-between gap-4 border-b border-red-900/30 pb-2 text-xs">
                <span className="text-white/45">{key}</span>
                <span className={ok ? 'text-emerald-300' : 'text-red-400'}>{ok ? 'PASS' : 'FAIL'}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
