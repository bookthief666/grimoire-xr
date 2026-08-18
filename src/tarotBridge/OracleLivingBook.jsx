import React, { useMemo } from 'react';
import { BookOpen, Check, Copy, Download, RefreshCw } from 'lucide-react';
import { buildOracleBookPresentation } from './oracleBookPresentation.js';

const toneClass = tone => {
  if (tone === 'supportive') return 'border-emerald-900/45 text-emerald-200/90';
  if (tone === 'contrary') return 'border-red-900/45 text-red-200/90';
  return 'border-amber-900/45 text-amber-200/80';
};

const PositionCard = ({ position, ordinal }) => (
  <article className="min-w-0">
    <div className="mb-3 text-center">
      <div className="font-header text-[8px] sm:text-[9px] tracking-[0.18em] text-[#d6b45b]">{position.label}</div>
      <p className="mt-2 text-[12px] sm:text-sm leading-snug text-[#b8aa8b]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        {position.functionText}
      </p>
    </div>
    <div className="relative aspect-[2/3.35] overflow-hidden border border-[#9c7a32]/70 bg-[#080705] shadow-[0_16px_45px_rgba(0,0,0,0.55)]">
      {position.imageUrl ? (
        <img src={position.imageUrl} alt={`${position.label}: ${position.title}`} className="h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,rgba(184,134,11,0.14),transparent_58%)]">
          <div className="text-center">
            <div className="text-4xl sm:text-5xl text-[#8c713b]/60" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{['I','II','III'][ordinal] || '✶'}</div>
            <div className="mt-4 font-header text-[7px] text-[#8c713b]/50">IMAGE UNMANIFESTED</div>
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent px-3 pb-4 pt-10 text-center">
        <h3 className="text-base sm:text-lg text-[#f0dfad] leading-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{position.title}</h3>
        {position.nativeTitle && position.nativeTitle !== position.title && (
          <p className="mt-1 text-[10px] text-[#c7ab67]/75 leading-snug" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{position.nativeTitle}</p>
        )}
        {position.orientation !== 'upright' && <div className="mt-2 font-header text-[7px] text-red-300/80">{position.orientation.toUpperCase()}</div>}
      </div>
    </div>
  </article>
);

const RelationNote = ({ relation }) => (
  <div className={`border-l px-4 py-3 ${toneClass(relation.tone)}`}>
    <div className="font-header text-[8px] tracking-wider text-[#d6b45b]">{relation.fromLabel} → {relation.toLabel}</div>
    <div className="mt-2 text-lg text-[#eee3c7]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{relation.heading}</div>
    <p className="mt-1 text-sm leading-relaxed text-[#bfb49b]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{relation.body}</p>
  </div>
);

export default function OracleLivingBook({ reading, onCopy, copied = false, onNewReading, onArchive }) {
  const model = useMemo(() => buildOracleBookPresentation(reading), [reading]);

  if (!model.hasCanonicalRecord) {
    return (
      <div className="border border-amber-900/60 bg-[#090704]/95 p-6 text-amber-200">
        <div className="font-header text-[9px] mb-3">LEGACY READING</div>
        <p className="text-lg leading-relaxed" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{model.answer || 'No reading text is available.'}</p>
      </div>
    );
  }

  const technical = model.provenance.technical;

  return (
    <section className="w-full max-w-5xl mx-auto pb-32 text-[#e8dfca]">
      <header className="mb-8 sm:mb-12 text-center">
        <div className="flex items-center justify-center gap-3 text-[#b99748] mb-3">
          <span className="h-px w-10 bg-[#8b6a2b]/60" />
          <BookOpen size={18} />
          <span className="h-px w-10 bg-[#8b6a2b]/60" />
        </div>
        <div className="font-header text-[8px] tracking-[0.28em] text-[#b99748]">A READING OF THE GRIMOIRE</div>
        {model.question && (
          <blockquote className="mt-5 mx-auto max-w-2xl text-xl sm:text-2xl leading-relaxed text-[#f0e8d7] italic" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            “{model.question}”
          </blockquote>
        )}
      </header>

      <div className="grid grid-cols-3 gap-3 sm:gap-7 items-start mb-10 sm:mb-14">
        {model.positions.map((position, index) => <PositionCard key={position.positionId} position={position} ordinal={index} />)}
      </div>

      <article className="relative border-y border-[#8b6a2b]/45 bg-[#090806]/90 px-5 py-8 sm:px-10 sm:py-10 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <div className="font-header text-[8px] tracking-[0.18em] text-red-400/80">INTERPRETATION</div>
            <div className="mt-1 text-[11px] text-red-300/45">Generated synthesis · not a source fact</div>
          </div>
          <button onClick={() => onCopy?.(model.copyText)} className="flex items-center gap-2 border border-[#8b6a2b]/55 px-3 py-2 font-header text-[8px] text-[#d6b45b] hover:bg-[#b8860b] hover:text-black transition-colors">
            {copied ? <Check size={12}/> : <Copy size={12}/>} {copied ? 'COPIED' : 'COPY READING'}
          </button>
        </div>
        <div className="select-text whitespace-pre-wrap text-[19px] sm:text-[22px] leading-[1.75] text-[#eee6d5]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          {model.answer || 'No generated synthesis was recorded for this reading.'}
        </div>
      </article>

      <section className="mt-10 sm:mt-14">
        <div className="mb-6 flex items-center gap-3">
          <span className="font-header text-[9px] tracking-[0.18em] text-[#d6b45b]">THE RELATIONS</span>
          <span className="h-px flex-1 bg-[#8b6a2b]/30" />
        </div>
        {model.relations.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {model.relations.map(relation => <RelationNote key={relation.relationId} relation={relation} />)}
          </div>
        ) : (
          <p className="text-sm text-[#a99d83]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>No source-qualified relation method is active for this reading.</p>
        )}

        {(model.outerContext || model.centerContext) && (
          <div className="mt-6 border border-[#8b6a2b]/30 bg-[#0b0906]/75 p-5 sm:p-6">
            <div className="font-header text-[8px] text-[#a88842] mb-3">WIDER PATTERN</div>
            {model.outerContext && (
              <p className="text-sm leading-relaxed text-[#c7bca3]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                <strong className="font-normal text-[#ead9ad]">Outer cards — {model.outerContext.heading}.</strong> {model.outerContext.body}
              </p>
            )}
            {model.centerContext && (
              <p className="mt-3 text-sm leading-relaxed text-[#c7bca3]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                <strong className="font-normal text-[#ead9ad]">{model.centerContext.heading}.</strong> {model.centerContext.body}
              </p>
            )}
          </div>
        )}
      </section>

      <aside className="mt-10 sm:mt-14 border-t border-[#8b6a2b]/35 pt-6">
        <div className="font-header text-[9px] tracking-[0.18em] text-[#d6b45b] mb-4">SCHOLARLY BASIS</div>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm text-[#bdb198]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          <div><span className="block text-[#e0c77f]">Method</span>{model.provenance.methodText}</div>
          <div><span className="block text-[#e0c77f]">Selection</span>{model.provenance.selectionText}</div>
          <div className="sm:col-span-2"><span className="block text-[#e0c77f]">Contract</span>{model.provenance.contractText}</div>
          <div className="sm:col-span-2">
            <span className="block text-[#e0c77f]">Sources</span>
            {model.provenance.sources.length ? model.provenance.sources.map(source => <div key={source.id}>{source.label}</div>) : <div>No source citation attached.</div>}
          </div>
          {model.provenance.unresolvedCount > 0 && (
            <div className="sm:col-span-2 text-amber-200/75">This reading contains {model.provenance.unresolvedCount} explicitly unresolved source {model.provenance.unresolvedCount === 1 ? 'gap' : 'gaps'}; no missing relation has been invented.</div>
          )}
        </div>

        <details className="mt-6 border border-white/10 bg-black/30 p-4 text-white/45">
          <summary className="cursor-pointer font-header text-[8px] tracking-wider text-[#8f7a4d]">TECHNICAL RECORD</summary>
          <div className="mt-4 space-y-2 font-mono text-[11px] break-all">
            <div>contractStatus: {technical.contractStatus}</div>
            <div>spreadId: {technical.spreadId || '—'}</div>
            <div>selectionSource: {technical.selectionSource || '—'}</div>
            <div>relationMethod: {technical.relationMethod || 'disabled'}</div>
            <div>relationMethodAuthority: {technical.relationMethodAuthority || '—'}</div>
            <div>sourceIds: {technical.sourceIds.join(', ') || 'none'}</div>
            <div>unresolvedReasonCodes: {technical.unresolvedReasonCodes.join(', ') || 'none'}</div>
            <div>{technical.contract.contractId}@{technical.contract.contractVersion} · {technical.contract.commit}</div>
          </div>
        </details>
      </aside>

      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={onArchive} className="flex items-center justify-center gap-2 border border-[#8b6a2b]/60 px-5 py-3 font-header text-[9px] text-[#d6b45b] hover:bg-[#b8860b] hover:text-black transition-colors">
          <Download size={14}/> KEEP THIS READING
        </button>
        <button onClick={onNewReading} className="flex items-center justify-center gap-2 border border-red-900/60 px-5 py-3 font-header text-[9px] text-red-400/75 hover:border-red-600 hover:text-red-300 transition-colors">
          <RefreshCw size={14}/> NEW READING
        </button>
      </div>
    </section>
  );
}
