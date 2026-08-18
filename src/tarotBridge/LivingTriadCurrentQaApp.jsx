import React, { useMemo, useState } from 'react';
import { buildTarotQaSnapshot, TAROT_QA_FIXTURE_IDS, TAROT_QA_FIXTURES } from './qaFixtures.js';
import LivingTriadCurrent from './LivingTriadCurrent.jsx';
import { buildLivingTriadCurrentModel } from './livingTriadCurrent.js';

const initialFixtureId = () => {
  const requested = new URLSearchParams(window.location.search).get('fixture');
  return TAROT_QA_FIXTURE_IDS.includes(requested) ? requested : 'three-aces';
};

const Status = ({ pass }) => (
  <span className={`border px-2 py-1 font-mono text-[10px] ${pass ? 'border-emerald-600/70 text-emerald-300' : 'border-red-600/70 text-red-300'}`}>
    {pass ? 'PASS' : 'FAIL'}
  </span>
);

const readingFromSnapshot = snapshot => ({
  answer: 'QA generated synthesis remains downstream of the deterministic current.',
  readingRecord: snapshot.record,
  cards: snapshot.cards.map(card => ({
    canonicalCardId: card.cardId,
    name: card.thothDisplayName,
  })),
});

export default function LivingTriadCurrentQaApp() {
  const [fixtureId, setFixtureId] = useState(initialFixtureId);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [traceCallbacks, setTraceCallbacks] = useState(0);

  const snapshot = useMemo(() => buildTarotQaSnapshot(fixtureId), [fixtureId]);
  const reading = useMemo(() => readingFromSnapshot(snapshot), [snapshot]);
  const model = useMemo(
    () => buildLivingTriadCurrentModel({ reading, reducedMotion }),
    [reading, reducedMotion],
  );

  const checks = useMemo(() => {
    const expectedImmediate = fixtureId === 'major-gap'
      ? ['UNSPECIFIED', 'UNSPECIFIED']
      : ['FRIENDLY', 'FRIENDLY'];
    return {
      available: model.available,
      threePositions: model.positions.length === 3,
      fourTraceSteps: model.steps.length === 4,
      immediate: JSON.stringify(model.steps.slice(0, 2).map(step => step.relationType)) === JSON.stringify(expectedImmediate),
      outer: model.steps[2]?.relationType === 'INIMICAL',
      center: model.steps[3]?.effectType === 'CENTER_BETWEEN_CONTRARIES',
      authority: model.relationMethodAuthority === 'SOURCE_QUALIFIED_METHOD_INHERITANCE',
      presentationBoundary: model.presentationAuthority === 'PROJECT_AUTHORED_RELATION_TRACE_NOT_SOURCE_FACT',
      majorGapReason: fixtureId !== 'major-gap' || model.steps.slice(0, 2).every(step => step.reasonCode === 'CARD_WITHOUT_SUIT_FAMILY'),
    };
  }, [fixtureId, model]);

  const pass = Object.values(checks).every(Boolean) && snapshot.pass;

  const selectFixture = id => {
    if (!TAROT_QA_FIXTURE_IDS.includes(id)) return;
    const url = new URL(window.location.href);
    url.searchParams.set('fixture', id);
    window.history.replaceState({}, '', url);
    setFixtureId(id);
    setTraceCallbacks(0);
  };

  return (
    <main className="min-h-dvh bg-[#030000] px-3 py-4 text-red-100 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <header className="border border-red-900/70 bg-black/90 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-header text-[9px] tracking-[0.2em] text-red-500">GRIMOIRE XR · 0.41</div>
              <h1 className="mt-3 font-header text-lg leading-relaxed text-[#e5c158] sm:text-xl">Living Triad Current QA</h1>
              <p className="mt-3 max-w-3xl font-mono text-sm leading-6 text-red-100/65">
                Provider-free ReadingRecord interaction. Trace each relation in order; presentation may animate, but relation facts may not be recomputed or invented.
              </p>
            </div>
            <Status pass={pass} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {TAROT_QA_FIXTURE_IDS.map(id => (
              <button
                key={id}
                type="button"
                onClick={() => selectFixture(id)}
                className={`border px-3 py-2 font-header text-[8px] ${fixtureId === id ? 'border-[#e5c158] text-[#e5c158]' : 'border-red-900 text-red-400'}`}
              >
                {TAROT_QA_FIXTURES[id].label}
              </button>
            ))}
          </div>
        </header>

        <section className="border border-red-900/70 bg-black/80 p-4">
          <div className="font-header text-[8px] text-red-500">FIXTURE</div>
          <div className="mt-2 font-header text-sm text-[#e5c158]">{TAROT_QA_FIXTURES[fixtureId].label}</div>
          <p className="mt-2 font-mono text-xs leading-5 text-white/50">{TAROT_QA_FIXTURES[fixtureId].description}</p>
        </section>

        <LivingTriadCurrent
          reading={reading}
          reducedMotion={reducedMotion}
          onTrace={() => setTraceCallbacks(value => value + 1)}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <section className="border border-red-900/70 bg-black/80 p-4">
            <div className="font-header text-[8px] text-red-500">TRACE CALLBACKS</div>
            <div className="mt-3 font-header text-2xl text-[#e5c158]">{traceCallbacks}</div>
            <p className="mt-2 font-mono text-xs text-white/40">One callback per newly revealed ReadingRecord step. SEAL does not increment it.</p>
          </section>
          <button
            type="button"
            onClick={() => setReducedMotion(value => !value)}
            className="border border-[#b8860b]/60 bg-black p-4 font-header text-[8px] text-[#e5c158]"
          >
            REDUCED MOTION QA · {reducedMotion ? 'ON' : 'OFF'}
          </button>
        </div>

        <section className="border border-red-900/70 bg-black/80 p-4">
          <div className="font-header text-[8px] text-red-500">SELF-GRADING</div>
          <div className="mt-3 space-y-2">
            {Object.entries(checks).map(([name, ok]) => (
              <div key={name} className="flex items-center justify-between border-b border-red-950/70 pb-2 font-mono text-xs last:border-b-0">
                <span className="text-white/55">{name}</span>
                <Status pass={ok} />
              </div>
            ))}
          </div>
        </section>

        <section className="border border-red-900/70 bg-black/80 p-4">
          <div className="font-header text-[8px] text-red-500">RECORD IMMUTABILITY</div>
          <pre className="mt-3 whitespace-pre-wrap break-all font-mono text-[9px] leading-5 text-white/35">{model.recordSignature}</pre>
        </section>
      </div>
    </main>
  );
}
