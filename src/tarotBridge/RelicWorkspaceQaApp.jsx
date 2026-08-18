import React from 'react';
import { buildCanonicalDeckGenesis } from './canonicalDeckGenesis.js';
import RelicWorkspace from './RelicWorkspace.jsx';
import { buildRelicWorkspaceModel } from './relicWorkspace.js';

const tradition = Object.freeze({ id: 'thoth', name: 'Book of Thoth' });
const baseCard = buildCanonicalDeckGenesis({ tradition })[23];
const card = Object.freeze({
  ...baseCard,
  exegesis: 'QA generated interpretation: Dominion is being read for a subject. This prose is interpretation, not source text.',
  exegesisAuthority: 'MODEL_GENERATED_INTERPRETATION',
  meta: Object.freeze({
    hebrew: 'QA reflection',
    planet: 'QA reflection',
    alchemical: 'QA reflection',
    daimon: 'QA reflection',
    gematria: 42,
  }),
  interpretiveMetaAuthority: 'MODEL_GENERATED_REFLECTION',
  visual: 'QA-generated visual direction for a red-gold martial threshold.',
  visualAuthority: 'MODEL_GENERATED_IMAGE_DIRECTION',
  promptUsed: 'QA deterministic compiled prompt.',
  promptSchema: 'tarot-structured-v1',
  imageUrl: 'data:image/png;base64,qa',
  generation: Object.freeze({ provider: 'comfyui', mode: 'preview', width: 640, height: 960, steps: 18, seed: 424242 }),
  patina: 3,
});

const model = buildRelicWorkspaceModel({ card, tradition });
const checks = Object.freeze({
  fourModes: model?.tabs.length === 4,
  cardId: model?.relic.cardId === 'minor.staffs.two',
  sourceQualified: model?.relic.sourceQualification === 'SOURCE_QUALIFIED',
  nativeTitle: model?.correspondences.expressionById.nativeTitle?.value === 'DOMINION',
  planet: model?.correspondences.correspondenceById.planet?.value === 'MARS',
  zodiac: model?.correspondences.correspondenceById.zodiacSign?.value === 'ARIES',
  exegesisSeparated: model?.interpretation.exegesisAuthority === 'MODEL_GENERATED_INTERPRETATION' && model?.interpretation.isSourceFact === false,
  generationSeparated: model?.generation.visualAuthority === 'MODEL_GENERATED_IMAGE_DIRECTION' && model?.generation.isSourceFact === false,
  deterministicRender: model?.generation.image?.seed === 424242 && model?.generation.image?.width === 640 && model?.generation.image?.height === 960,
});
const pass = Object.values(checks).every(Boolean);

export default function RelicWorkspaceQaApp() {
  return (
    <main className="min-h-dvh bg-black text-red-500 p-4 sm:p-8 font-body">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="border border-red-900 p-5 bg-[#070000]">
          <div className="font-header text-[8px] text-red-500/60">GRIMOIRE XR · 0.39</div>
          <h1 className="font-header text-lg sm:text-2xl text-[#e5c158] mt-3">Relic Workspace QA</h1>
          <p className="mt-4 text-sm text-white/50">Provider-free interactive fixture. Switch through RELIC / CORRESPONDENCES / INTERPRETATION / GENERATION and verify that each mode owns only its intended authority layer.</p>
          <div className={`mt-4 inline-flex border px-3 py-2 font-header text-[9px] ${pass ? 'border-emerald-500 text-emerald-300' : 'border-red-600 text-red-400'}`}>{pass ? 'PASS' : 'FAIL'}</div>
        </header>

        <section className="border border-red-900/60 p-5 bg-[#070000]">
          <div className="font-header text-[8px] text-red-500/60 mb-3">FIXTURE</div>
          <h2 className="font-header text-base text-[#e5c158]">{card.name}</h2>
          <p className="text-xs text-white/35 mt-2">{card.canonicalCardId} · PATINA {card.patina}</p>
        </section>

        <section className="border-2 border-red-900/70 p-4 sm:p-6 bg-[#040000]">
          <RelicWorkspace
            card={card}
            tradition={tradition}
            canFinalize
            canRefine
            onRemanifest={() => {}}
            onFinalize={() => {}}
            onRefine={() => {}}
            onCopyPrompt={() => {}}
          />
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
