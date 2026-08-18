import React, { useMemo, useState } from 'react';
import {
  TAROT_QA_FIXTURE_IDS,
  TAROT_QA_FIXTURES,
  buildTarotQaSnapshot,
} from './qaFixtures.js';
import { UPSTREAM_TAROT_CONTRACT } from './canonicalTarotBridge.js';

const initialFixtureId = () => {
  const requested = new URLSearchParams(window.location.search).get('fixture');
  return TAROT_QA_FIXTURE_IDS.includes(requested) ? requested : TAROT_QA_FIXTURE_IDS[0];
};

const StatusPill = ({ pass, children }) => (
  <span className={`inline-flex items-center border px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em] ${
    pass ? 'border-emerald-500/70 text-emerald-300 bg-emerald-950/30' : 'border-red-500/70 text-red-300 bg-red-950/40'
  }`}>
    {children}
  </span>
);

const FactCard = ({ title, children }) => (
  <section className="border border-[#7d1b1b]/70 bg-black/70 p-4 shadow-[0_0_30px_rgba(90,0,0,0.18)]">
    <h2 className="mb-3 font-header text-xs uppercase tracking-[0.16em] text-[#e5c158]">{title}</h2>
    {children}
  </section>
);

const RelationRow = ({ relation, index }) => (
  <div className="grid grid-cols-[auto_1fr] gap-3 border-t border-red-950/80 py-3 first:border-t-0">
    <div className="font-header text-[10px] text-red-500">{String(index + 1).padStart(2, '0')}</div>
    <div className="min-w-0 font-mono text-xs leading-5 text-red-100/90">
      <div className="break-words text-[#e5c158]">{relation.fromCardId} → {relation.toCardId}</div>
      <div>{relation.relationType}</div>
      <div className="text-red-400/70">{relation.reasonCode || 'SOURCE-QUALIFIED'}</div>
    </div>
  </div>
);

export default function TarotQaApp() {
  const [fixtureId, setFixtureId] = useState(initialFixtureId);
  const snapshot = useMemo(() => buildTarotQaSnapshot(fixtureId), [fixtureId]);

  const selectFixture = nextId => {
    if (!TAROT_QA_FIXTURE_IDS.includes(nextId)) return;
    const url = new URL(window.location.href);
    url.searchParams.set('fixture', nextId);
    window.history.replaceState({}, '', url);
    setFixtureId(nextId);
  };

  return (
    <main className="min-h-dvh bg-[#030000] px-3 py-4 text-red-100 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <header className="border border-red-900/70 bg-black/90 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-2 font-header text-[10px] uppercase tracking-[0.22em] text-red-500">Grimoire XR · 0.35.1</div>
              <h1 className="font-header text-base leading-relaxed text-[#e5c158] sm:text-xl">Canonical Tarot Semantic QA</h1>
              <p className="mt-3 max-w-3xl font-mono text-sm leading-6 text-red-100/70">
                Provider-free deterministic parity surface. No Ollama, ComfyUI, random draw, forged image, or generated interpretation participates in these results.
              </p>
            </div>
            <StatusPill pass={snapshot.pass}>{snapshot.pass ? 'PASS' : 'FAIL'}</StatusPill>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {TAROT_QA_FIXTURE_IDS.map(id => (
              <button
                key={id}
                type="button"
                onClick={() => selectFixture(id)}
                className={`border px-3 py-2 font-header text-[9px] uppercase tracking-[0.12em] ${
                  fixtureId === id
                    ? 'border-[#e5c158] bg-[#e5c158]/10 text-[#e5c158]'
                    : 'border-red-900/70 bg-black text-red-400'
                }`}
              >
                {TAROT_QA_FIXTURES[id].label}
              </button>
            ))}
          </div>
        </header>

        <FactCard title="Fixture">
          <div className="font-header text-sm text-red-200">{snapshot.fixture.label}</div>
          <p className="mt-2 font-mono text-sm leading-6 text-red-100/70">{snapshot.fixture.description}</p>
          <div className="mt-3 font-mono text-xs text-red-500/80">fixture={snapshot.fixture.fixtureId}</div>
        </FactCard>

        <div className="grid gap-4 lg:grid-cols-2">
          <FactCard title="Canonical Cards">
            <div className="space-y-3">
              {snapshot.cards.map((card, index) => (
                <div key={card.cardId} className="border-l-2 border-[#e5c158]/40 pl-3 font-mono text-xs leading-5">
                  <div className="text-[#e5c158]">{index + 1}. {card.thothDisplayName}</div>
                  <div className="break-all text-red-200/80">{card.cardId}</div>
                  <div className="text-red-500/70">legacy {card.legacyIndex} · family {card.familyId} · suit {card.suitFamilyId || 'NONE'}</div>
                  {card.nativeTitle && <div className="text-red-100/50">{card.nativeTitle}</div>}
                </div>
              ))}
            </div>
          </FactCard>

          <FactCard title="Immediate Relations">
            {snapshot.record.relations.map((relation, index) => (
              <RelationRow key={relation.relationId} relation={relation} index={index} />
            ))}
          </FactCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <FactCard title="Outer + Center Context">
            <div className="space-y-3 font-mono text-xs leading-5">
              <div>
                <div className="text-[#e5c158]">OUTER PAIR</div>
                <div>{snapshot.outer?.relationType || 'MISSING'}</div>
                <div className="text-red-500/70">{snapshot.outer?.reasonCode || 'SOURCE-QUALIFIED'}</div>
              </div>
              <div>
                <div className="text-[#e5c158]">CENTER EFFECT</div>
                <div>{snapshot.center?.applied ? snapshot.center.effectType : 'NOT APPLIED'}</div>
                <div className="text-red-500/70">{snapshot.center?.reasonCode || 'SOURCE-QUALIFIED'}</div>
              </div>
            </div>
          </FactCard>

          <FactCard title="Self-Grading">
            <div className="space-y-2">
              {Object.entries(snapshot.checks).map(([name, pass]) => (
                <div key={name} className="flex items-center justify-between gap-3 border-b border-red-950/70 pb-2 font-mono text-xs last:border-b-0">
                  <span className="text-red-100/70">{name}</span>
                  <StatusPill pass={pass}>{pass ? 'PASS' : 'FAIL'}</StatusPill>
                </div>
              ))}
            </div>
          </FactCard>
        </div>

        <FactCard title="Provenance">
          <div className="space-y-2 font-mono text-xs leading-5 text-red-100/70">
            <div><span className="text-[#e5c158]">relationMethod:</span> {snapshot.record.input.relationMethod}</div>
            <div><span className="text-[#e5c158]">authority:</span> {snapshot.record.provenance.relationMethodAuthority}</div>
            <div className="break-all"><span className="text-[#e5c158]">sources:</span> {snapshot.record.provenance.sourceIds.join(' · ')}</div>
            <div className="break-all"><span className="text-[#e5c158]">upstream:</span> {UPSTREAM_TAROT_CONTRACT.commit}</div>
            <div><span className="text-[#e5c158]">contract:</span> {UPSTREAM_TAROT_CONTRACT.contractId}@{UPSTREAM_TAROT_CONTRACT.contractVersion}</div>
          </div>
        </FactCard>

        <FactCard title="Deterministic Semantic Signature">
          <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-[10px] leading-5 text-red-200/70">{snapshot.semanticSignature}</pre>
        </FactCard>
      </div>
    </main>
  );
}
