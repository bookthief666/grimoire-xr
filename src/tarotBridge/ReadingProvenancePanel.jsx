import React from 'react';
import { summarizeReadingProvenance } from './archiveEnvelope.js';

const badgeClass = status => status === 'CURRENT_CONTRACT_MATCH'
  ? 'border-emerald-700/70 text-emerald-400'
  : 'border-amber-700/70 text-amber-300';

export default function ReadingProvenancePanel({ reading }) {
  const summary = summarizeReadingProvenance(reading);
  const record = reading?.readingRecord || null;
  if (!record) {
    return (
      <div className="border border-amber-800/60 bg-black/70 p-4 text-amber-300 font-body">
        <div className="font-header text-[9px] mb-2">SEMANTIC BASIS</div>
        <p className="text-sm">Legacy/generated reading. No canonical ReadingRecord is attached.</p>
      </div>
    );
  }

  return (
    <div className="border border-[#b8860b]/60 bg-black/80 p-5 sm:p-6 space-y-5 shadow-[inset_0_0_18px_rgba(184,134,11,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#b8860b]/30 pb-3">
        <div>
          <div className="font-header text-[9px] text-[#e5c158] tracking-widest">CANONICAL SEMANTIC BASIS</div>
          <div className="font-body text-xs text-white/45 mt-1">Generated prose is interpretation; the facts below were computed before synthesis.</div>
        </div>
        <span className={`border px-2 py-1 font-header text-[7px] ${badgeClass(summary.contractStatus)}`}>
          {summary.contractStatus}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 font-body text-sm">
        <div><span className="text-[#b8860b]">SPREAD</span><br/><span className="text-white/80">{summary.spreadId || '—'}</span></div>
        <div><span className="text-[#b8860b]">SELECTION</span><br/><span className="text-white/80">{summary.selectionSource || '—'}</span></div>
        <div><span className="text-[#b8860b]">RELATION METHOD</span><br/><span className="text-white/80 break-all">{summary.relationMethod || 'DISABLED'}</span></div>
        <div><span className="text-[#b8860b]">METHOD AUTHORITY</span><br/><span className="text-white/80 break-all">{summary.relationMethodAuthority || '—'}</span></div>
      </div>

      <div>
        <div className="font-header text-[8px] text-[#b8860b] mb-2">POSITIONS</div>
        <div className="space-y-1 font-body text-sm text-white/75">
          {(record.positions || []).map(position => (
            <div key={position.positionId} className="flex flex-wrap gap-x-2 border-l border-red-900/70 pl-3">
              <span className="text-[#e5c158]">{position.label || position.positionId}</span>
              <span className="break-all">{position.cardId}</span>
              <span className="text-white/35">{position.orientation}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="font-header text-[8px] text-[#b8860b] mb-2">DETERMINISTIC RELATIONS</div>
        <div className="space-y-2 font-body text-sm">
          {(record.relations || []).length ? record.relations.map(relation => (
            <div key={relation.relationId} className="border border-red-900/40 p-3">
              <div className="text-white/55 break-all">{relation.fromCardId} → {relation.toCardId}</div>
              <div className={relation.status === 'SUPPORTED' ? 'text-emerald-400' : 'text-amber-300'}>
                {relation.relationType}{relation.reasonCode ? ` · ${relation.reasonCode}` : ''}
              </div>
            </div>
          )) : <div className="text-white/40">No technical relation method bound.</div>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="font-header text-[8px] text-[#b8860b] mb-2">SOURCE IDS</div>
          <div className="font-body text-xs text-white/50 space-y-1">
            {summary.sourceIds.length ? summary.sourceIds.map(source => <div key={source} className="break-all">{source}</div>) : <div>None</div>}
          </div>
        </div>
        <div>
          <div className="font-header text-[8px] text-[#b8860b] mb-2">UNRESOLVED SOURCE GAPS</div>
          <div className="font-body text-xs text-amber-300/80 space-y-1">
            {summary.unresolvedReasonCodes.length ? summary.unresolvedReasonCodes.map(code => <div key={code} className="break-all">{code}</div>) : <div className="text-white/35">None</div>}
          </div>
        </div>
      </div>

      <div className="border-t border-[#b8860b]/30 pt-3 font-body text-[11px] text-white/35 break-all">
        {reading?.semanticContract?.contractId}@{reading?.semanticContract?.contractVersion} · {reading?.semanticContract?.commit}
      </div>
    </div>
  );
}
