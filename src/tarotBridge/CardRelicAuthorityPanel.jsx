import React from 'react';
import { buildCardRelicAuthority, formatAuthorityValue } from './cardAuthority.js';

const Badge = ({ children, tone = 'gold' }) => {
  const classes = tone === 'green'
    ? 'border-emerald-500/60 text-emerald-300 bg-emerald-950/20'
    : tone === 'red'
      ? 'border-red-600/60 text-red-400 bg-red-950/20'
      : 'border-[#b8860b]/60 text-[#e5c158] bg-[#b8860b]/5';
  return <span className={`inline-flex px-2 py-1 border font-header text-[7px] sm:text-[8px] leading-none ${classes}`}>{children}</span>;
};

const AuthorityField = ({ field }) => (
  <div className="border border-[#b8860b]/20 bg-black/40 p-3 min-w-0">
    <div className="font-header text-[7px] sm:text-[8px] uppercase text-[#b8860b]/60 mb-1 break-words">{field.fieldId}</div>
    <div className="font-body text-xs sm:text-sm text-[#e5c158] break-words">{formatAuthorityValue(field.value)}</div>
    <div className="mt-2 text-[7px] font-header text-white/30 break-words">{field.authority}</div>
  </div>
);

const GenerationSummary = ({ generation }) => {
  if (!generation) return <span className="text-white/30">NO GENERATION RECORD</span>;
  const parts = [
    generation.provider,
    generation.mode,
    generation.width && generation.height ? `${generation.width}×${generation.height}` : null,
    generation.steps ? `${generation.steps} STEPS` : null,
    generation.seed !== null ? `SEED ${generation.seed}` : null,
    generation.denoise !== null ? `DENOISE ${generation.denoise}` : null,
  ].filter(Boolean);
  return <span>{parts.join(' · ') || 'GENERATION RECORD PRESENT'}</span>;
};

export default function CardRelicAuthorityPanel({ card, tradition }) {
  const model = buildCardRelicAuthority({ card, tradition });
  if (!model) return null;

  const sourceQualified = model.sourceQualification === 'SOURCE_QUALIFIED';
  return (
    <section className="mb-8 border border-[#b8860b]/60 bg-[#090500] shadow-[inset_0_0_24px_rgba(184,134,11,0.08)]">
      <div className="p-4 sm:p-5 border-b border-[#b8860b]/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-header text-[10px] sm:text-xs text-[#e5c158] tracking-wider">RELIC AUTHORITY</h4>
            <p className="font-body text-xs text-white/40 mt-2">Canonical facts and interpretive/presentation layers are shown separately.</p>
          </div>
          <Badge tone={sourceQualified ? 'green' : 'gold'}>{model.sourceQualification}</Badge>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-6">
        <div>
          <div className="font-header text-[8px] text-[#b8860b]/60 mb-2">CANONICAL IDENTITY</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="border border-[#b8860b]/20 p-3 bg-black/40">
              <div className="font-header text-[7px] text-white/30">CARD ID</div>
              <div className="font-body text-sm text-[#e5c158] break-all mt-1">{model.identity.cardId}</div>
            </div>
            <div className="border border-[#b8860b]/20 p-3 bg-black/40">
              <div className="font-header text-[7px] text-white/30">DISPLAY LABEL AUTHORITY</div>
              <div className="font-body text-xs text-[#e5c158] break-words mt-1">{model.identity.authority}</div>
            </div>
          </div>
        </div>

        {model.expressionFields.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-header text-[8px] text-[#b8860b]/60">SOURCE-QUALIFIED EXPRESSION</span>
              <Badge tone="green">CANONICAL</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {model.expressionFields.map(field => <AuthorityField key={`expression:${field.fieldId}`} field={field} />)}
            </div>
          </div>
        )}

        {model.correspondenceFields.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-header text-[8px] text-[#b8860b]/60">CANONICAL CORRESPONDENCES</span>
              <Badge tone="green">SOURCE-QUALIFIED</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {model.correspondenceFields.map(field => <AuthorityField key={`correspondence:${field.fieldId}`} field={field} />)}
            </div>
          </div>
        )}

        {!sourceQualified && (
          <div className="border border-[#b8860b]/30 bg-[#b8860b]/5 p-3 font-body text-xs text-[#d6b45b]">
            This tradition currently uses a deterministic compatibility label. No source-qualified expression/correspondence pack is being claimed here.
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-header text-[8px] text-red-500/70">INTERPRETATION / PRESENTATION LAYERS</span>
            <Badge tone="red">NOT SOURCE FACT</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {Object.entries(model.generatedLayers).map(([key, authority]) => (
              <div key={key} className="border border-red-600/25 p-3 bg-red-950/10 min-w-0">
                <div className="font-header text-[7px] uppercase text-red-500/50">{key}</div>
                <div className="font-body text-[11px] sm:text-xs text-red-300 mt-1 break-words">{authority}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#b8860b]/20 pt-4 space-y-2">
          <div className="font-header text-[8px] text-[#b8860b]/60">IMAGE GENERATION PROVENANCE</div>
          <div className="font-body text-[11px] text-white/45 break-words"><GenerationSummary generation={model.imageGeneration} /></div>
        </div>

        <div className="border-t border-[#b8860b]/20 pt-4 space-y-2">
          <div className="font-header text-[8px] text-[#b8860b]/60">SOURCE IDS</div>
          {model.canonicalSourceIds.length > 0 ? (
            <div className="space-y-1">
              {model.canonicalSourceIds.map(sourceId => <div key={sourceId} className="font-body text-[10px] text-white/40 break-all">{sourceId}</div>)}
            </div>
          ) : <div className="font-body text-[10px] text-white/30">None claimed.</div>}
          <div className="font-body text-[9px] text-white/20 break-all">{model.contract.contractId}@{model.contract.contractVersion}</div>
        </div>
      </div>
    </section>
  );
}
