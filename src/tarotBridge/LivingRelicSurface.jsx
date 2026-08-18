import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  LIVING_RELIC_PHASES,
  buildLivingRelicModel,
  livingRelicIdentitySignature,
  livingRelicRevealSummary,
  shouldCancelRelicAttunement,
} from './livingRelic.js';

const RevealToken = ({ label, value }) => (
  <div className="min-w-0 border border-[#e5c158]/45 bg-black/75 px-2 py-2 backdrop-blur-sm">
    <div className="font-header text-[6px] text-[#b8860b]/65">{label}</div>
    <div className="mt-1 font-header text-[8px] sm:text-[9px] text-[#e5c158] break-words">{String(value)}</div>
  </div>
);

export default function LivingRelicSurface({
  card,
  tradition,
  reducedMotion = false,
  onAttuned = null,
  children,
}) {
  const model = useMemo(
    () => buildLivingRelicModel({ card, tradition, reducedMotion }),
    [card, tradition, reducedMotion],
  );
  const identitySignature = livingRelicIdentitySignature(model);
  const [phase, setPhase] = useState(LIVING_RELIC_PHASES.idle);
  const timerRef = useRef(null);
  const startRef = useRef(null);
  const revealSummary = livingRelicRevealSummary(model);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetAttunement = () => {
    clearTimer();
    startRef.current = null;
    setPhase(LIVING_RELIC_PHASES.idle);
  };

  useEffect(() => {
    resetAttunement();
    return clearTimer;
    // Identity change is the only event that should forcibly seal a revealed relic.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identitySignature]);

  if (!model) return <>{children}</>;

  const beginAttunement = event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (phase === LIVING_RELIC_PHASES.revealed) return;
    clearTimer();
    startRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    };
    setPhase(LIVING_RELIC_PHASES.attuning);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      startRef.current = null;
      setPhase(LIVING_RELIC_PHASES.revealed);
      onAttuned?.({
        cardId: model.cardId,
        sourceQualification: model.sourceQualification,
        identitySignature,
      });
    }, model.holdMs);
  };

  const moveAttunement = event => {
    if (phase !== LIVING_RELIC_PHASES.attuning || !startRef.current) return;
    if (startRef.current.pointerId !== event.pointerId) return;
    if (shouldCancelRelicAttunement({
      startX: startRef.current.x,
      startY: startRef.current.y,
      currentX: event.clientX,
      currentY: event.clientY,
      threshold: model.moveCancelPx,
    })) {
      resetAttunement();
    }
  };

  const endAttunement = event => {
    if (startRef.current?.pointerId !== event.pointerId) return;
    if (phase === LIVING_RELIC_PHASES.attuning) resetAttunement();
  };

  const isAttuning = phase === LIVING_RELIC_PHASES.attuning;
  const isRevealed = phase === LIVING_RELIC_PHASES.revealed;
  const animated = !reducedMotion;

  return (
    <div
      className="relative w-full h-full select-none"
      data-living-relic-state={phase}
      data-living-relic-card-id={model.cardId}
      data-living-relic-authority={model.presentationAuthority}
      onPointerDown={beginAttunement}
      onPointerMove={moveAttunement}
      onPointerUp={endAttunement}
      onPointerCancel={resetAttunement}
      onContextMenu={event => event.preventDefault()}
      style={{ WebkitTouchCallout: 'none' }}
    >
      {children}

      {!isRevealed && (
        <div className="absolute inset-x-3 bottom-3 z-30 pointer-events-none">
          <div className="border border-[#b8860b]/45 bg-black/80 px-3 py-2 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 font-header text-[6px] sm:text-[7px] text-[#e5c158]/75">
              <span>{isAttuning ? 'ATTUNING… HOLD STEADY' : 'HOLD TO ATTUNE'}</span>
              <span>{model.holdMs}ms</span>
            </div>
            <div className="mt-2 h-1 bg-[#b8860b]/15 overflow-hidden">
              <div
                className="h-full origin-left bg-[#e5c158]"
                style={{
                  transform: isAttuning ? 'scaleX(1)' : 'scaleX(0)',
                  transitionProperty: 'transform',
                  transitionTimingFunction: 'linear',
                  transitionDuration: isAttuning && animated ? `${model.holdMs}ms` : '0ms',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {isRevealed && (
        <div className="absolute inset-0 z-40 flex flex-col justify-between p-3 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.18),rgba(0,0,0,0.88))]">
          <div className="flex items-start justify-between gap-2">
            <div className={`border border-emerald-500/60 bg-black/80 px-2 py-2 font-header text-[6px] text-emerald-300 ${animated ? 'animate-pulse' : ''}`}>
              ATTUNED · {model.sourceQualification}
            </div>
            <button
              type="button"
              onPointerDown={event => event.stopPropagation()}
              onClick={event => {
                event.stopPropagation();
                resetAttunement();
              }}
              className="border border-[#b8860b]/60 bg-black/85 px-3 py-2 font-header text-[7px] text-[#e5c158] hover:bg-[#b8860b] hover:text-black"
            >
              SEAL
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {model.revealEligible ? revealSummary.map(([label, value]) => (
              <RevealToken key={`${label}:${String(value)}`} label={label} value={value} />
            )) : (
              <div className="col-span-2 border border-[#b8860b]/45 bg-black/80 p-3 font-body text-[10px] text-[#e5c158]/75">
                Reviewed correspondence pack pending. The relic remains identified, but no correspondence facts are invented for this system.
              </div>
            )}
          </div>

          <div className="border border-red-600/35 bg-black/80 px-3 py-2 font-header text-[6px] leading-relaxed text-red-300/65">
            REVEAL IS PRESENTATION ONLY · CARD IDENTITY AND SOURCE FACTS ARE UNCHANGED
          </div>
        </div>
      )}
    </div>
  );
}
