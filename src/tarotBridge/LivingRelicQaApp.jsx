import React, { useMemo, useState } from 'react';
import { buildCanonicalDeckGenesis } from './canonicalDeckGenesis.js';
import LivingRelicSurface from './LivingRelicSurface.jsx';
import {
  LIVING_RELIC_PRESENTATION_AUTHORITY,
  RELIC_ATTUNE_HOLD_MS,
  buildLivingRelicModel,
  livingRelicIdentitySignature,
} from './livingRelic.js';

const tradition = Object.freeze({ id: 'thoth', name: 'Book of Thoth' });
const card = Object.freeze({
  ...buildCanonicalDeckGenesis({ tradition })[23],
  patina: 3,
  imageUrl: 'qa://living-relic',
});

export default function LivingRelicQaApp() {
  const [hapticCallbacks, setHapticCallbacks] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const model = useMemo(
    () => buildLivingRelicModel({ card, tradition, reducedMotion }),
    [reducedMotion],
  );

  const checks = {
    cardId: model?.cardId === 'minor.staffs.two',
    title: model?.reveal.nativeTitle === 'DOMINION',
    element: model?.reveal.suitElement === 'FIRE',
    planet: model?.reveal.planet === 'MARS',
    zodiac: model?.reveal.zodiacSign === 'ARIES',
    holdThreshold: model?.holdMs === RELIC_ATTUNE_HOLD_MS,
    presentationBoundary: model?.presentationAuthority === LIVING_RELIC_PRESENTATION_AUTHORITY,
    identityPinned: livingRelicIdentitySignature(model)?.endsWith(':minor.staffs.two'),
    reducedMotionProfile: !reducedMotion || model?.motionProfile === 'REDUCED_STATIC',
  };
  const pass = Object.values(checks).every(Boolean);

  return (
    <main className="min-h-dvh bg-black text-red-500 p-4 sm:p-8 font-body">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="border border-red-900 p-5 bg-[#070000]">
          <div className="font-header text-[8px] text-red-500/60">GRIMOIRE XR · 0.40</div>
          <h1 className="font-header text-lg sm:text-2xl text-[#e5c158] mt-3">Living Relic Interaction QA</h1>
          <p className="mt-4 text-sm text-white/50">
            Hold the relic steadily for {RELIC_ATTUNE_HOLD_MS}ms. Moving into a swipe must cancel attunement; a successful hold reveals canonical context without changing card identity.
          </p>
          <div className={`mt-4 inline-flex border px-3 py-2 font-header text-[9px] ${pass ? 'border-emerald-500 text-emerald-300' : 'border-red-600 text-red-400'}`}>{pass ? 'PASS' : 'FAIL'}</div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-[minmax(240px,320px)_1fr] gap-6 border border-red-900/70 bg-[#070000] p-5">
          <div className="mx-auto w-full max-w-[320px] aspect-[2/3] border-2 border-[#b8860b] shadow-[0_0_30px_rgba(184,134,11,0.22)]">
            <LivingRelicSurface
              card={card}
              tradition={tradition}
              reducedMotion={reducedMotion}
              onAttuned={() => setHapticCallbacks(count => count + 1)}
            >
              <div className="w-full h-full bg-[radial-gradient(circle_at_50%_35%,rgba(184,134,11,0.28),rgba(15,0,0,0.96)_65%)] flex flex-col items-center justify-center text-center p-6">
                <div className="font-header text-[10px] text-red-500/60">II · WANDS</div>
                <div className="mt-6 text-5xl text-[#e5c158]">Ⅱ</div>
                <div className="mt-6 font-header text-xl text-[#e5c158]">DOMINION</div>
                <div className="mt-3 font-body text-sm text-white/35">minor.staffs.two</div>
              </div>
            </LivingRelicSurface>
          </div>

          <div className="space-y-5 min-w-0">
            <div className="border border-[#b8860b]/35 p-4">
              <div className="font-header text-[8px] text-[#b8860b]/60">INTERACTION CHECK</div>
              <p className="mt-3 text-sm text-white/55">Press and hold the card until the correspondence veil appears. Then tap SEAL. Try a horizontal swipe: it should cancel the hold instead of revealing.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-red-900/50 p-3">
                <div className="font-header text-[7px] text-red-500/50">HAPTIC CALLBACKS</div>
                <div className="mt-2 font-header text-lg text-[#e5c158]">{hapticCallbacks}</div>
              </div>
              <div className="border border-red-900/50 p-3">
                <div className="font-header text-[7px] text-red-500/50">HOLD THRESHOLD</div>
                <div className="mt-2 font-header text-lg text-[#e5c158]">{model?.holdMs}ms</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReducedMotion(value => !value)}
              className="w-full border border-[#b8860b]/60 px-4 py-3 font-header text-[8px] text-[#e5c158] hover:bg-[#b8860b] hover:text-black"
            >
              REDUCED MOTION QA · {reducedMotion ? 'ON' : 'OFF'}
            </button>
            <div className="border border-red-900/50 p-4">
              <div className="font-header text-[8px] text-red-500/50">PRESENTATION AUTHORITY</div>
              <div className="mt-2 font-body text-xs text-red-300/70 break-all">{model?.presentationAuthority}</div>
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
