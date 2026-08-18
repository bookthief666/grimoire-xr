import React, { useEffect, useMemo, useState } from 'react';
import {
  LIVING_TRIAD_TRACE_KINDS,
  buildLivingTriadCurrentModel,
  nextLivingTriadRevealCount,
  nextLivingTriadStep,
  visibleLivingTriadSteps,
} from './livingTriadCurrent.js';

const statusClass = step => {
  if (step?.kind === LIVING_TRIAD_TRACE_KINDS.center) {
    return step.applied ? 'border-emerald-700/60 text-emerald-300' : 'border-amber-700/60 text-amber-300';
  }
  if (step?.relationType === 'UNSPECIFIED' || step?.status === 'UNSPECIFIED') {
    return 'border-amber-700/60 text-amber-300';
  }
  return 'border-emerald-700/60 text-emerald-300';
};

const stepPrimary = step => step?.kind === LIVING_TRIAD_TRACE_KINDS.center
  ? (step.applied ? step.effectType : 'NOT APPLIED')
  : step?.relationType;

const stepSecondary = step => step?.reasonCode || (
  step?.kind === LIVING_TRIAD_TRACE_KINDS.center
    ? 'READINGRECORD CENTER CONTEXT'
    : 'READINGRECORD RELATION'
);

const TraceStepCard = ({ step, visible, reducedMotion }) => (
  <div
    className={`min-h-24 border bg-black/75 p-3 transition-opacity ${
      visible ? `${statusClass(step)} opacity-100` : 'border-red-950/60 text-white/20 opacity-45'
    } ${!reducedMotion && visible ? 'shadow-[0_0_18px_rgba(229,193,88,0.08)]' : ''}`}
    data-current-step={step.stepId}
    data-current-visible={visible ? 'true' : 'false'}
  >
    <div className="font-header text-[7px] tracking-widest">{step.label}</div>
    <div className="mt-3 font-header text-[10px] sm:text-xs break-words">
      {visible ? stepPrimary(step) : 'SEALED'}
    </div>
    {visible && (
      <div className="mt-2 font-mono text-[10px] break-words opacity-70">{stepSecondary(step)}</div>
    )}
  </div>
);

const PositionNode = ({ position }) => (
  <div className="min-w-0 border border-[#b8860b]/45 bg-black/80 p-3 text-center">
    <div className="font-header text-[7px] text-[#b8860b]/75">{position.label}</div>
    <div className="mt-2 font-header text-[9px] sm:text-[10px] text-[#e5c158] break-words">{position.displayName}</div>
    <div className="mt-2 font-mono text-[9px] text-white/40 break-all">{position.cardId}</div>
  </div>
);

export default function LivingTriadCurrent({
  reading,
  cards,
  reducedMotion = false,
  onTrace = null,
}) {
  const model = useMemo(
    () => buildLivingTriadCurrentModel({ reading, cards, reducedMotion }),
    [reading, cards, reducedMotion],
  );
  const [revealCount, setRevealCount] = useState(0);

  useEffect(() => {
    setRevealCount(0);
  }, [model.recordSignature]);

  if (!model.available) {
    return (
      <section className="border border-amber-900/60 bg-black/70 p-4" data-living-current="unavailable">
        <div className="font-header text-[8px] text-amber-300">LIVING CURRENT UNAVAILABLE</div>
        <p className="mt-2 font-mono text-xs text-amber-100/60">{model.reasonCode}</p>
      </section>
    );
  }

  const visibleSteps = visibleLivingTriadSteps(model, revealCount);
  const visibleIds = new Set(visibleSteps.map(step => step.stepId));
  const nextStep = nextLivingTriadStep(model, revealCount);
  const complete = revealCount >= model.maxRevealCount;

  const traceNext = () => {
    if (complete) {
      setRevealCount(0);
      return;
    }
    if (nextStep) onTrace?.(nextStep);
    setRevealCount(nextLivingTriadRevealCount(model, revealCount));
  };

  return (
    <section
      className="border border-[#b8860b]/55 bg-black/80 p-4 sm:p-5 shadow-[inset_0_0_24px_rgba(184,134,11,0.06)]"
      data-living-current="available"
      data-current-reveal-count={revealCount}
      data-current-record-signature={model.recordSignature}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#b8860b]/25 pb-3">
        <div>
          <div className="font-header text-[9px] text-[#e5c158] tracking-widest">LIVING TRIAD CURRENT</div>
          <div className="mt-1 font-mono text-xs text-white/45">Trace the ReadingRecord; no relation is recomputed here.</div>
        </div>
        <span className="border border-red-900/60 px-2 py-1 font-header text-[6px] text-red-300/65">
          PRESENTATION CUE · NOT SOURCE FACT
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {model.positions.map(position => <PositionNode key={position.positionId} position={position} />)}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <TraceStepCard step={model.steps[0]} visible={visibleIds.has(model.steps[0].stepId)} reducedMotion={reducedMotion} />
        <TraceStepCard step={model.steps[1]} visible={visibleIds.has(model.steps[1].stepId)} reducedMotion={reducedMotion} />
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <TraceStepCard step={model.steps[2]} visible={visibleIds.has(model.steps[2].stepId)} reducedMotion={reducedMotion} />
        <TraceStepCard step={model.steps[3]} visible={visibleIds.has(model.steps[3].stepId)} reducedMotion={reducedMotion} />
      </div>

      <button
        type="button"
        onClick={traceNext}
        className="mt-4 w-full border border-[#b8860b] bg-black px-4 py-3 font-header text-[9px] text-[#e5c158] transition-colors hover:bg-[#b8860b] hover:text-black"
      >
        {complete ? 'SEAL CURRENT' : `TRACE ${nextStep?.label || 'CURRENT'}`}
      </button>

      <div className="mt-4 grid gap-2 font-mono text-[10px] text-white/40 sm:grid-cols-2">
        <div className="border border-red-950/60 p-2 break-all">
          METHOD · {model.relationMethod || 'DISABLED'}
        </div>
        <div className="border border-red-950/60 p-2 break-all">
          AUTHORITY · {model.relationMethodAuthority || 'UNSPECIFIED'}
        </div>
      </div>

      <div className="mt-2 border border-red-950/60 p-2 font-mono text-[9px] text-white/30 break-all">
        SOURCES · {model.sourceIds.length ? model.sourceIds.join(' · ') : 'NONE'}
      </div>
    </section>
  );
}
