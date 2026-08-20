import fs from 'node:fs';

const appPath = 'src/App.jsx';
const thresholdPath = 'src/ThresholdLanding.jsx';
const reliquaryPath = 'src/reliquary/ReliquarySurface.jsx';
const folioPath = 'src/reliquary/ReturningReaderFolio.jsx';
const folioTestPath = 'src/reliquary/ReturningReaderFolio.test.jsx';

const fail = message => { throw new Error(`0.49 Phase B activation refused: ${message}`); };
const replaceOnce = (source, before, after, label) => {
  const count = source.split(before).length - 1;
  if (count !== 1) fail(`${label} expected exactly one anchor, found ${count}`);
  return source.replace(before, after);
};

for (const path of [folioPath, folioTestPath]) {
  if (fs.existsSync(path)) fail(`${path} already exists`);
}

const folioSource = `import React from 'react';
import { Archive, BookOpen, RotateCcw } from 'lucide-react';

const formatSavedAt = value => {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'UNKNOWN DATE';
    return date.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch {
    return 'UNKNOWN DATE';
  }
};

export default function ReturningReaderFolio({ model, onOpenLastMemory, onViewReliquary }) {
  const memory = model?.latestMemory || null;
  if (!model?.hasMemories || !memory) return null;
  const titles = Array.isArray(memory.cardTitles) ? memory.cardTitles.slice(0, 3) : [];

  return (
    <aside className="relative mt-5 overflow-hidden border border-[#8b6a2b]/45 bg-[#070604]/88 px-4 py-4 sm:px-6 sm:py-5 shadow-[0_18px_55px_rgba(0,0,0,0.30)]" aria-label="Returning Reader">
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" style={{ background: 'radial-gradient(circle at 12% 15%, rgba(184,134,11,0.18), transparent 28%), radial-gradient(circle at 88% 80%, rgba(130,40,20,0.12), transparent 30%)' }} />
      <div className="pointer-events-none absolute -left-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full border border-[#8b6a2b]/15" aria-hidden="true" />
      <div className="relative z-[1]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-header text-[8px] tracking-[0.2em] text-[#d0af58]">
            <BookOpen size={14} /> RETURNING READER
          </div>
          <div className="font-header text-[7px] tracking-[0.12em] text-[#7f704f]">{model.count} SEALED {model.count === 1 ? 'MEMORY' : 'MEMORIES'}</div>
        </div>

        <blockquote className="mt-4 text-lg sm:text-xl leading-relaxed text-[#e9dfc7]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          “{memory.question || 'Untitled inquiry'}”
        </blockquote>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {titles.map((title, index) => (
            <div key={String(memory.cardIds?.[index] || index)} className="border border-[#8b6a2b]/30 bg-black/25 px-2 py-2 text-center">
              <span className="block font-header text-[7px] text-[#8f7a4d]">{['I', 'II', 'III'][index]}</span>
              <strong className="mt-1 block text-[11px] sm:text-xs font-normal leading-snug text-[#c9b889]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{title}</strong>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#817761]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          <span>Last sealed · {formatSavedAt(memory.savedAt)}</span>
          <span>Kept locally · exact ReadingRecord</span>
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          <button type="button" onClick={onOpenLastMemory} className="min-h-11 flex items-center justify-center gap-2 border border-[#b8860b]/70 bg-[#b8860b]/10 px-3 py-3 font-header text-[8px] tracking-[0.12em] text-[#e5c158] hover:bg-[#b8860b] hover:text-black transition-colors">
            <RotateCcw size={14} /> OPEN LAST MEMORY
          </button>
          <button type="button" onClick={onViewReliquary} className="min-h-11 flex items-center justify-center gap-2 border border-[#8b6a2b]/40 px-3 py-3 font-header text-[8px] tracking-[0.12em] text-[#a8915c] hover:border-[#b8860b] hover:text-[#e5c158] transition-colors">
            <Archive size={14} /> VIEW RELIQUARY
          </button>
        </div>
      </div>
    </aside>
  );
}
`;

const folioTestSource = `import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ReturningReaderFolio from './ReturningReaderFolio.jsx';

const model = {
  hasMemories: true,
  count: 2,
  latestMemory: {
    entryId: 'latest',
    savedAt: '2026-08-20T06:00:00.000Z',
    question: 'What has returned?',
    cardIds: ['minor.staffs.ace', 'minor.swords.ace', 'minor.cups.ace'],
    cardTitles: ['Ace of Wands', 'Ace of Swords', 'Ace of Cups'],
  },
};

describe('0.49 Returning Reader folio', () => {
  it('renders the latest kept question, triad and deliberate re-entry actions', () => {
    const markup = renderToStaticMarkup(<ReturningReaderFolio model={model} onOpenLastMemory={() => {}} onViewReliquary={() => {}} />);
    expect(markup).toContain('RETURNING READER');
    expect(markup).toContain('What has returned?');
    expect(markup).toContain('Ace of Wands');
    expect(markup).toContain('Ace of Swords');
    expect(markup).toContain('Ace of Cups');
    expect(markup).toContain('OPEN LAST MEMORY');
    expect(markup).toContain('VIEW RELIQUARY');
    expect(markup).toContain('exact ReadingRecord');
  });

  it('renders nothing for a fresh reader with no kept memories', () => {
    expect(renderToStaticMarkup(<ReturningReaderFolio model={{ hasMemories: false, count: 0, latestMemory: null }} />)).toBe('');
  });
});
`;

let app = fs.readFileSync(appPath, 'utf8');
app = replaceOnce(
  app,
  "import { loadReliquary, removeReliquaryEntry, saveReliquaryReading } from './reliquary/reliquaryStore.js';\n",
  "import { loadReliquary, removeReliquaryEntry, saveReliquaryReading } from './reliquary/reliquaryStore.js';\nimport { buildReturningReaderModel } from './reliquary/returningReaderModel.js';\n",
  'App returning-reader model import',
);
app = replaceOnce(
  app,
  "  const [reliquaryNotice, setReliquaryNotice] = useState('');\n  const initialAesthetic = useMemo(restoreAestheticPreferences, []);",
  "  const [reliquaryNotice, setReliquaryNotice] = useState('');\n  const returningReader = useMemo(() => buildReturningReaderModel(reliquaryEntries), [reliquaryEntries]);\n  const initialAesthetic = useMemo(restoreAestheticPreferences, []);",
  'App returning-reader memo',
);
app = replaceOnce(
  app,
  "              onRestoreArchive={handleRestoreJsonArchive}\n              vrHref={!Capacitor.isNativePlatform() ? '/vr' : null}",
  "              onRestoreArchive={handleRestoreJsonArchive}\n              returningReader={returningReader}\n              onOpenLastMemory={() => handleRestoreReliquaryMemory(returningReader.latestMemory?.rawEntry)}\n              onViewReliquary={() => dispatch({ type: 'OPEN_ARCHIVE_PROMPT' })}\n              vrHref={!Capacitor.isNativePlatform() ? '/vr' : null}",
  'Threshold Returning Reader wiring',
);

let threshold = fs.readFileSync(thresholdPath, 'utf8');
threshold = replaceOnce(
  threshold,
  "import ThresholdRitualField from './aesthetic/ThresholdRitualField.jsx';\n",
  "import ThresholdRitualField from './aesthetic/ThresholdRitualField.jsx';\nimport ReturningReaderFolio from './reliquary/ReturningReaderFolio.jsx';\n",
  'Threshold folio import',
);
threshold = replaceOnce(
  threshold,
  "  onRestoreArchive,\n  vrHref = null,",
  "  onRestoreArchive,\n  returningReader = null,\n  onOpenLastMemory,\n  onViewReliquary,\n  vrHref = null,",
  'Threshold folio props',
);
threshold = replaceOnce(
  threshold,
  "        </div>\n\n        <details className=\"group mt-6 border border-white/10 bg-black/25\">",
  "        </div>\n\n        <ReturningReaderFolio model={returningReader} onOpenLastMemory={onOpenLastMemory} onViewReliquary={onViewReliquary} />\n\n        <details className=\"group mt-6 border border-white/10 bg-black/25\">",
  'Threshold folio placement',
);

let reliquary = fs.readFileSync(reliquaryPath, 'utf8');
reliquary = replaceOnce(
  reliquary,
  "import { buildReliquaryPresentation } from './reliquaryPresentation.js';\n",
  "import { buildReliquaryPresentation } from './reliquaryPresentation.js';\nimport { buildReturningRelicSelection } from './returningReaderModel.js';\n",
  'Reliquary recurrence selection import',
);
reliquary = replaceOnce(
  reliquary,
  "  const [forgetCandidate, setForgetCandidate] = useState(null);\n  const hasCurrentReading = Boolean(currentReading?.readingRecord);",
  "  const [forgetCandidate, setForgetCandidate] = useState(null);\n  const [selectedReturningRelic, setSelectedReturningRelic] = useState(null);\n  const hasCurrentReading = Boolean(currentReading?.readingRecord);\n  const activeReturningRelic = model.returningRelics.find(item => item.cardId === selectedReturningRelic) || null;\n  const activeReturningRelicId = activeReturningRelic?.cardId || null;\n  const memorySelection = useMemo(() => buildReturningRelicSelection({ entries, cardId: activeReturningRelicId }), [entries, activeReturningRelicId]);\n  const visibleMemories = activeReturningRelicId ? memorySelection.memories : model.memories;",
  'Reliquary recurrence filter state',
);
reliquary = replaceOnce(
  reliquary,
  `              {model.returningRelics.map(item => (\n                <div key={item.cardId} className="reliquary-returning-relic">\n                  <span>{item.appearances}×</span>\n                  <strong>{item.title}</strong>\n                </div>\n              ))}`,
  `              {model.returningRelics.map(item => (\n                <button\n                  type="button"\n                  key={item.cardId}\n                  className={\`reliquary-returning-relic \${activeReturningRelicId === item.cardId ? 'is-selected' : ''}\`}\n                  onClick={() => setSelectedReturningRelic(item.cardId)}\n                  aria-pressed={activeReturningRelicId === item.cardId}\n                  title={\`Show kept readings containing \${item.title}\`}\n                >\n                  <span>{item.appearances}×</span>\n                  <strong>{item.title}</strong>\n                </button>\n              ))}`,
  'Returning relic interactive controls',
);
reliquary = replaceOnce(
  reliquary,
  `          </div>\n\n          {model.memories.length ? (\n            <div className="reliquary-memory-grid">\n              {model.memories.map(memory => (`,
  `          </div>\n\n          {activeReturningRelic && (\n            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border border-[#8b6a2b]/35 bg-[#8b6a2b]/5 px-3 py-2">\n              <span className="font-header text-[7px] tracking-[0.12em] text-[#b99748]">RETURNING RELIC · {activeReturningRelic.title} · {visibleMemories.length} MEMORIES</span>\n              <button type="button" onClick={() => setSelectedReturningRelic(null)} className="font-header text-[7px] text-[#9f8a58] hover:text-[#e5c158]">SHOW ALL MEMORIES</button>\n            </div>\n          )}\n\n          {visibleMemories.length ? (\n            <div className="reliquary-memory-grid">\n              {visibleMemories.map(memory => (`,
  'Reliquary visible-memory filter',
);

for (const forbidden of ['fetch(', '/api/', 'ComfyUI', 'relationType ===']) {
  if (folioSource.includes(forbidden)) fail(`Returning Reader folio contains forbidden provider/doctrine marker: ${forbidden}`);
}
for (const required of [
  'buildReturningReaderModel(reliquaryEntries)',
  'handleRestoreReliquaryMemory(returningReader.latestMemory?.rawEntry)',
  "dispatch({ type: 'OPEN_ARCHIVE_PROMPT' })",
]) if (!app.includes(required)) fail(`App wiring missing ${required}`);
if (threshold.indexOf('<ReturningReaderFolio') > threshold.indexOf('<details className="group mt-6')) fail('Returning Reader folio must remain above Studio & Archives');
if (!reliquary.includes('buildReturningRelicSelection({ entries, cardId: activeReturningRelicId })')) fail('Reliquary filter must consume the tested recurrence-selection model');

fs.writeFileSync(folioPath, folioSource, 'utf8');
fs.writeFileSync(folioTestPath, folioTestSource, 'utf8');
fs.writeFileSync(appPath, app, 'utf8');
fs.writeFileSync(thresholdPath, threshold, 'utf8');
fs.writeFileSync(reliquaryPath, reliquary, 'utf8');

console.log('0.49 Phase B Returning Reader activation: PASS');
console.log('Runtime candidate: App + Threshold + ReturningReaderFolio + Reliquary recurrence navigation.');
