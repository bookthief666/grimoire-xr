import React, { useEffect, useMemo, useState } from 'react';
import {
  RELIC_WORKSPACE_TABS,
  buildRelicWorkspaceModel,
  normalizeRelicWorkspaceTab,
} from './relicWorkspace.js';

const Badge = ({ children, tone = 'gold' }) => {
  const classes = tone === 'green'
    ? 'border-emerald-500/60 text-emerald-300 bg-emerald-950/20'
    : tone === 'red'
      ? 'border-red-600/60 text-red-400 bg-red-950/20'
      : 'border-[#b8860b]/60 text-[#e5c158] bg-[#b8860b]/5';
  return <span className={`inline-flex px-2 py-1 border font-header text-[7px] sm:text-[8px] leading-none ${classes}`}>{children}</span>;
};

const Fact = ({ label, value, authority = null }) => (
  <div className="border border-[#b8860b]/25 bg-black/50 p-3 min-w-0">
    <div className="font-header text-[7px] uppercase text-[#b8860b]/55 mb-1 break-words">{label}</div>
    <div className="font-body text-xs sm:text-sm text-[#e5c158] break-words">{value ?? '—'}</div>
    {authority && <div className="mt-2 font-header text-[7px] text-white/25 break-words">{authority}</div>}
  </div>
);

const AuthorityStrip = ({ authority }) => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge tone="red">NOT SOURCE FACT</Badge>
    <span className="font-header text-[7px] text-red-300/80 break-words">{authority}</span>
  </div>
);

const formatGeneration = generation => {
  if (!generation) return 'NO GENERATION RECORD';
  return [
    generation.provider,
    generation.mode,
    generation.width && generation.height ? `${generation.width}×${generation.height}` : null,
    generation.steps ? `${generation.steps} STEPS` : null,
    generation.seed !== null ? `SEED ${generation.seed}` : null,
    generation.denoise !== null ? `DENOISE ${generation.denoise}` : null,
  ].filter(Boolean).join(' · ') || 'GENERATION RECORD PRESENT';
};

export default function RelicWorkspace({
  card,
  tradition,
  isForging = false,
  forgeStatus = '',
  canFinalize = false,
  canRefine = false,
  onRemanifest,
  onFinalize,
  onRefine,
  onCopyPrompt,
  copied = false,
  initialTab = 'relic',
}) {
  const model = useMemo(() => buildRelicWorkspaceModel({ card, tradition }), [card, tradition]);
  const [activeTab, setActiveTab] = useState(() => normalizeRelicWorkspaceTab(initialTab));

  useEffect(() => {
    setActiveTab(normalizeRelicWorkspaceTab(initialTab));
  }, [card?.canonicalCardId, card?.id, initialTab]);

  if (!model) return null;

  const title = model.correspondences.expressionById.cardTitle?.value || model.relic.displayName;
  const planet = model.correspondences.correspondenceById.planet?.value || null;
  const zodiac = model.correspondences.correspondenceById.zodiac?.value || null;
  const element = model.correspondences.correspondenceById.suitElement?.value || null;

  return (
    <section className="min-w-0">
      <div className="grid grid-cols-2 sm:grid-cols-4 border border-[#b8860b]/40 bg-black mb-5">
        {RELIC_WORKSPACE_TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={active}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-11 px-2 py-3 font-header text-[7px] sm:text-[8px] border-[#b8860b]/25 transition-colors ${active ? 'bg-[#b8860b] text-black' : 'text-[#d6b45b] hover:bg-[#b8860b]/10'} ${tab.id === 'relic' || tab.id === 'interpretation' ? 'border-r' : ''} ${tab.id === 'relic' || tab.id === 'correspondences' ? 'border-b sm:border-b-0' : ''}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {isForging && (
        <div className="mb-5 border border-red-600/50 bg-red-950/15 p-3 font-header text-[8px] text-red-400 animate-pulse">
          {forgeStatus || 'MANIFESTING RELIC…'}
        </div>
      )}

      {activeTab === 'relic' && (
        <div className="space-y-5" data-relic-workspace-panel="relic">
          <div className="border border-[#b8860b]/50 bg-[#090500] p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-header text-[8px] text-[#b8860b]/55">THE RELIC</div>
                <h4 className="mt-2 font-header text-base sm:text-xl text-[#e5c158] break-words">{title}</h4>
                <div className="mt-2 font-body text-sm text-white/45 break-all">{model.relic.cardId}</div>
              </div>
              <Badge tone={model.relic.sourceQualification === 'SOURCE_QUALIFIED' ? 'green' : 'gold'}>{model.relic.sourceQualification}</Badge>
            </div>
            <p className="font-body text-sm text-white/45 mt-4">The card identity is fixed. Interpretation and manifestation may change around it without rewriting the relic.</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Fact label="DISPLAY LABEL" value={model.relic.displayName} authority={model.relic.labelAuthority} />
            <Fact label="PATINA" value={model.relic.patina} />
            <Fact label="ELEMENT" value={element || '—'} />
            <Fact label="PLANET / SIGN" value={[planet, zodiac].filter(Boolean).join(' · ') || '—'} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Fact label="IMAGE" value={model.relic.hasImage ? 'MANIFESTED' : 'UNMANIFESTED'} />
            <Fact label="EXEGESIS" value={model.relic.hasInterpretation ? 'PRESENT' : 'EMPTY'} />
            <Fact label="REFLECTION" value={model.relic.hasReflectionMeta ? 'PRESENT' : 'EMPTY'} />
          </div>
        </div>
      )}

      {activeTab === 'correspondences' && (
        <div className="space-y-6" data-relic-workspace-panel="correspondences">
          {model.correspondences.sourceQualification === 'SOURCE_QUALIFIED' ? (
            <>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="font-header text-[8px] text-[#b8860b]/60">SOURCE-QUALIFIED EXPRESSION</span>
                  <Badge tone="green">CANONICAL</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {model.correspondences.expressionFields.map(field => (
                    <Fact key={`expression:${field.fieldId}`} label={field.fieldId} value={typeof field.value === 'object' ? JSON.stringify(field.value) : String(field.value)} authority={field.authority} />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="font-header text-[8px] text-[#b8860b]/60">CANONICAL CORRESPONDENCES</span>
                  <Badge tone="green">SOURCE-QUALIFIED</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {model.correspondences.correspondenceFields.map(field => (
                    <Fact key={`correspondence:${field.fieldId}`} label={field.fieldId} value={typeof field.value === 'object' ? JSON.stringify(field.value) : String(field.value)} authority={field.authority} />
                  ))}
                </div>
              </div>

              <div className="border-t border-[#b8860b]/20 pt-4">
                <div className="font-header text-[8px] text-[#b8860b]/60 mb-2">SOURCE IDS</div>
                <div className="space-y-1">
                  {model.correspondences.sourceIds.map(sourceId => <div key={sourceId} className="font-body text-[10px] text-white/40 break-all">{sourceId}</div>)}
                </div>
                <div className="font-body text-[9px] text-white/20 mt-3 break-all">{model.relic.contract.contractId}@{model.relic.contract.contractVersion}</div>
              </div>
            </>
          ) : (
            <div className="border border-[#b8860b]/40 bg-[#b8860b]/5 p-4 font-body text-sm text-[#d6b45b]">
              This Tarot system does not yet have a reviewed expression/correspondence pack in the shared semantic contract. The deterministic display label remains a project compatibility label, not a historical-source claim.
            </div>
          )}
        </div>
      )}

      {activeTab === 'interpretation' && (
        <div className="space-y-6" data-relic-workspace-panel="interpretation">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="font-header text-[8px] text-red-400">INTERPRETIVE EXEGESIS</span>
              <AuthorityStrip authority={model.interpretation.exegesisAuthority} />
            </div>
            <div className="border border-red-600/30 bg-red-950/10 p-4 font-body text-base sm:text-xl leading-relaxed text-red-300/90 break-words">
              {model.interpretation.exegesis || (isForging ? 'INSCRIBING INTERPRETATION…' : 'No interpretation has been generated for this relic.')}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="font-header text-[8px] text-red-400">REFLECTION METADATA</span>
              <AuthorityStrip authority={model.interpretation.reflectiveMetaAuthority} />
            </div>
            {model.interpretation.reflectiveMeta ? (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(model.interpretation.reflectiveMeta).map(([key, value]) => (
                  <div key={key} className="border border-red-600/25 bg-red-950/10 p-3 min-w-0">
                    <div className="font-header text-[7px] uppercase text-red-500/50">{key}</div>
                    <div className="font-body text-sm text-[#e5c158] mt-1 break-words">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</div>
                  </div>
                ))}
              </div>
            ) : <div className="font-body text-sm text-white/35">No reflective metadata has been generated.</div>}
          </div>
        </div>
      )}

      {activeTab === 'generation' && (
        <div className="space-y-6" data-relic-workspace-panel="generation">
          <div className="border border-[#b8860b]/35 bg-black/50 p-4">
            <div className="font-header text-[8px] text-[#b8860b]/60 mb-2">IMAGE GENERATION PROVENANCE</div>
            <div className="font-body text-sm text-white/50 break-words">{formatGeneration(model.generation.image)}</div>
            {model.generation.promptSchema && <div className="font-body text-[10px] text-white/25 mt-2 break-all">PROMPT SCHEMA · {model.generation.promptSchema}</div>}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onRemanifest} disabled={isForging} className="px-4 py-3 border border-red-600 text-[8px] font-header text-red-500 hover:bg-red-600 hover:text-black disabled:opacity-30">RE-MANIFEST PREVIEW</button>
            <button type="button" onClick={onFinalize} disabled={isForging || !canFinalize} className="px-4 py-3 border border-[#b8860b] text-[8px] font-header text-[#e5c158] hover:bg-[#b8860b] hover:text-black disabled:opacity-30">FINALIZE</button>
            <button type="button" onClick={onRefine} disabled={isForging || !canRefine} className="px-4 py-3 border border-white/50 text-[8px] font-header text-white hover:bg-white hover:text-black disabled:opacity-30">{model.generation.image?.mode === 'refine' ? 'REFINE AGAIN' : 'REFINE FINAL'}</button>
          </div>
          <p className="font-body text-[11px] text-white/35">Refine Final uses the current image as img2img input so composition remains more stable than a seed-only rerender.</p>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="font-header text-[8px] text-red-400">VISUAL DIRECTION</span>
              <AuthorityStrip authority={model.generation.visualAuthority} />
            </div>
            <div className="border border-red-600/25 bg-red-950/10 p-3 font-body text-sm text-red-300/80 break-words">{model.generation.visualDirection || 'No generated visual direction recorded.'}</div>
          </div>

          {model.generation.promptUsed && (
            <div className="border border-red-600/25 bg-red-950/5 p-3">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="font-header text-[8px] text-red-400">COMPILED VISUAL PROMPT</span>
                <button type="button" onClick={() => onCopyPrompt?.(model.generation.promptUsed)} className="font-header text-[7px] text-white/60 hover:text-red-400">{copied ? 'COPIED' : 'COPY'}</button>
              </div>
              <div className="font-body text-[11px] text-white/40 italic break-words">“{model.generation.promptUsed}”</div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
