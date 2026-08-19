import React, { useMemo } from 'react';
import {
  Archive,
  BookOpen,
  Download,
  FileDown,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { buildReliquaryPresentation } from './reliquaryPresentation.js';
import './reliquary.css';

const formatSavedAt = value => {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'UNKNOWN DATE';
    return date.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch {
    return 'UNKNOWN DATE';
  }
};

const MemoryCard = ({ memory, onRestore, onForget }) => (
  <article className="reliquary-memory-card">
    <div className="reliquary-memory-topline">
      <span>{formatSavedAt(memory.savedAt)}</span>
      <span>{memory.spreadId}</span>
    </div>
    <blockquote>“{memory.question}”</blockquote>
    <div className="reliquary-memory-triad">
      {memory.cardTitles.slice(0, 3).map((title, index) => (
        <div key={`${memory.entryId}:card:${index}`}>
          <span>{['I', 'II', 'III'][index] || index + 1}</span>
          <strong>{title || memory.cardIds[index] || 'Unknown relic'}</strong>
        </div>
      ))}
    </div>
    <div className="reliquary-memory-signature">
      {memory.relationSignature.map((item, index) => <span key={`${memory.entryId}:relation:${index}`}>{item}</span>)}
      {memory.centerEffectApplied && <span>CENTER EFFECT</span>}
      {memory.interpretationPresent && <span>INTERPRETATION</span>}
      {memory.artworkCount > 0 && <span>{memory.artworkCount} ARTWORK</span>}
    </div>
    <div className="reliquary-memory-actions">
      <button type="button" onClick={() => onRestore?.(memory.rawEntry)}>
        <RotateCcw size={14} /> OPEN MEMORY
      </button>
      <button type="button" className="is-forget" onClick={() => onForget?.(memory.entryId)}>
        <Trash2 size={13} /> FORGET
      </button>
    </div>
  </article>
);

export default function ReliquarySurface({
  entries = [],
  currentReading = null,
  currentQuestion = '',
  archiveState = 'PROMPT',
  archiveProgress = { current: 0, total: 0, msg: '' },
  forgedCount = 0,
  busy = false,
  notice = '',
  onClose,
  onSealCurrent,
  onRestoreMemory,
  onForgetMemory,
  onHtmlArchive,
  onJsonArchive,
  onRestoreJsonArchive,
  onGrandForge,
}) {
  const model = useMemo(() => buildReliquaryPresentation(entries), [entries]);
  const hasCurrentReading = Boolean(currentReading?.readingRecord);
  const progress = archiveProgress.total > 0
    ? Math.max(0, Math.min(100, (archiveProgress.current / archiveProgress.total) * 100))
    : 0;

  return (
    <div className="reliquary-overlay">
      <div className="reliquary-atmosphere" aria-hidden="true">
        <span className="reliquary-orbit orbit-one" />
        <span className="reliquary-orbit orbit-two" />
        <span className="reliquary-orbit orbit-three" />
      </div>

      <section className="reliquary-shell" aria-label="Reliquary of kept readings">
        <header className="reliquary-header">
          <div>
            <div className="reliquary-kicker"><Archive size={14} /> THE RELIQUARY</div>
            <h2>Kept readings become memory objects.</h2>
            <p>{model.count} sealed {model.count === 1 ? 'reading' : 'readings'} · exact ReadingRecords preserved.</p>
          </div>
          <button type="button" className="reliquary-close" onClick={onClose} aria-label="Close Reliquary"><X /></button>
        </header>

        {notice && <div className="reliquary-notice">{notice}</div>}

        {archiveState === 'COMPILING' && (
          <div className="reliquary-forge-state">
            <RefreshCw size={26} className="animate-spin" />
            <div className="flex-1 min-w-0">
              <div className="font-header text-[9px]">THE GRAND FORGE IS WORKING</div>
              <div className="mt-2 h-2 border border-current/40"><div className="h-full bg-current transition-all" style={{ width: `${progress}%` }} /></div>
              <div className="mt-2 text-xs opacity-65 truncate">{archiveProgress.msg}</div>
            </div>
          </div>
        )}

        {archiveState === 'READY' && (
          <div className="reliquary-ready-state"><FileDown size={18} /> GRAND FORGE COMPLETE · EXPORTS ARE READY</div>
        )}

        <div className="reliquary-current-reading">
          <div className="reliquary-current-seal" aria-hidden="true">✦</div>
          <div className="flex-1 min-w-0">
            <div className="reliquary-section-label">ACTIVE MEMORY</div>
            {hasCurrentReading ? (
              <>
                <blockquote>“{currentQuestion || currentReading.readingRecord?.input?.question || 'Untitled inquiry'}”</blockquote>
                <p>Seal the exact current session state, including its canonical ReadingRecord and any manifested artwork available locally.</p>
              </>
            ) : (
              <p>No active canonical reading is open. Browse the memories below or use the scribe tools.</p>
            )}
          </div>
          {hasCurrentReading && (
            <button type="button" className="reliquary-seal-button" onClick={onSealCurrent} disabled={busy}>
              <Sparkles size={15} /> {busy ? 'SEALING…' : 'SEAL / UPDATE'}
            </button>
          )}
        </div>

        {model.returningRelics.length > 0 && (
          <section className="reliquary-returning">
            <div className="reliquary-section-label">RETURNING RELICS</div>
            <p className="reliquary-authority-note">Derived only from your kept-reading history · not a Tarot correspondence.</p>
            <div className="reliquary-returning-grid">
              {model.returningRelics.map(item => (
                <div key={item.cardId} className="reliquary-returning-relic">
                  <span>{item.appearances}×</span>
                  <strong>{item.title}</strong>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="reliquary-memories">
          <div className="reliquary-section-heading">
            <div>
              <div className="reliquary-section-label">MEMORY FOLIOS</div>
              <p>Open one to restore the saved reading as an active Grimoire session.</p>
            </div>
            <BookOpen size={20} aria-hidden="true" />
          </div>

          {model.memories.length ? (
            <div className="reliquary-memory-grid">
              {model.memories.map(memory => (
                <MemoryCard
                  key={memory.entryId}
                  memory={memory}
                  onRestore={onRestoreMemory}
                  onForget={onForgetMemory}
                />
              ))}
            </div>
          ) : (
            <div className="reliquary-empty">
              <span>◇</span>
              <strong>THE SHELVES ARE EMPTY</strong>
              <p>Keep a canonical reading and it will appear here as a restorable memory.</p>
            </div>
          )}
        </section>

        <details className="reliquary-scribe">
          <summary>SCRIBE &amp; EXPORT</summary>
          <div className="reliquary-scribe-body">
            <p>File exports remain available for portability and forensic backup. They are secondary to the local Reliquary.</p>
            <div className="reliquary-scribe-grid">
              <button type="button" onClick={onHtmlArchive}><Download size={14} /> HTML ARCHIVE</button>
              <button type="button" onClick={onJsonArchive}><Download size={14} /> RESTORABLE JSON</button>
              <button type="button" onClick={onRestoreJsonArchive}><RotateCcw size={14} /> RESTORE JSON</button>
              <button type="button" onClick={onGrandForge} disabled={archiveState === 'COMPILING'}><Sparkles size={14} /> GRAND FORGE · {forgedCount}/78</button>
            </div>
          </div>
        </details>
      </section>
    </div>
  );
}
