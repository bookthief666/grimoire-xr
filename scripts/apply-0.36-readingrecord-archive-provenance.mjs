import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPath = path.join(root, 'src', 'App.jsx');
const original = fs.readFileSync(appPath, 'utf8');

const APPLIED_SENTINEL = "from './tarotBridge/ReadingProvenancePanel.jsx';";
if (original.includes(APPLIED_SENTINEL) && original.includes('serializeGrimoireArchive({ state, deck: state.deck })')) {
  console.log('0.36 ReadingRecord archive/provenance bridge is already applied.');
  process.exit(0);
}

const requireMarker = (marker, label) => {
  if (!original.includes(marker)) throw new Error(`0.36 migration refused: missing ${label}. App.jsx parent shape drifted.`);
};

requireMarker("} from './tarotBridge/oracleSynthesis.js';", 'Oracle synthesis import');
requireMarker("    case 'REMOVE_CARD_FROM_SLOT':", 'reducer spread removal case');
requireMarker("const escapeHtml = (value) => String(value ?? '')", 'legacy HTML archive helper');
requireMarker("  const triggerDownload = async (htmlStr) => {", 'legacy archive download function');
requireMarker("  const handleQuickArchive = () => triggerDownload(generateHtmlDocument(state, state.deck));", 'quick archive handler');
requireMarker('<p>{state.reading.answer}</p></div>', 'Oracle answer surface');
requireMarker('QUICK SAVE (Current Deck)', 'archive prompt button');
requireMarker('DOWNLOAD HTML', 'archive ready button');

let source = original;
const replaceOnce = (label, before, after) => {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`0.36 migration refused: ${label} target missing.`);
  if (source.indexOf(before, first + before.length) >= 0) throw new Error(`0.36 migration refused: ${label} target is not unique.`);
  source = `${source.slice(0, first)}${after}${source.slice(first + before.length)}`;
};

replaceOnce(
  'archive/provenance imports',
  "} from './tarotBridge/oracleSynthesis.js';",
  `} from './tarotBridge/oracleSynthesis.js';\nimport {\n  buildArchiveRestoreState,\n  parseGrimoireArchive,\n  serializeGrimoireArchive,\n} from './tarotBridge/archiveEnvelope.js';\nimport { generateGrimoireHtmlDocument } from './tarotBridge/archiveHtml.js';\nimport ReadingProvenancePanel from './tarotBridge/ReadingProvenancePanel.jsx';`,
);

replaceOnce(
  'restore reducer action',
  "    default: return state;",
  `    case 'RESTORE_ARCHIVE': return { ...initialState, ...action.payload };\n    default: return state;`,
);

const htmlStart = source.indexOf("const escapeHtml = (value) => String(value ?? '')");
const htmlEnd = source.indexOf('\nexport default function App() {', htmlStart);
if (htmlStart < 0 || htmlEnd < 0) throw new Error('0.36 migration refused: legacy HTML helper boundaries missing.');
source = `${source.slice(0, htmlStart)}${source.slice(htmlEnd + 1)}`;

const downloadStart = source.indexOf('  const triggerDownload = async (htmlStr) => {');
const quickStart = source.indexOf('  const handleQuickArchive = () => triggerDownload(generateHtmlDocument(state, state.deck));', downloadStart);
if (downloadStart < 0 || quickStart < 0) throw new Error('0.36 migration refused: archive download boundaries missing.');
const quickEnd = quickStart + '  const handleQuickArchive = () => triggerDownload(generateHtmlDocument(state, state.deck));'.length;
const newArchiveHandlers = `  const triggerTextArchive = async ({ content, extension, mimeType, label }) => {\n    const safeAuthor = state.author.trim().replace(/[^a-z0-9._-]+/gi, '_') || 'UNTITLED';\n    const fileName = \`GRIMOIRE_\${safeAuthor}.\${extension}\`;\n\n    if (Capacitor.isNativePlatform()) {\n      try {\n        const saved = await Filesystem.writeFile({\n          path: fileName,\n          data: content,\n          directory: Directory.Cache,\n          encoding: Encoding.UTF8,\n        });\n        await Share.share({\n          title: \`\${state.author || 'Grimoire'} \${label}\`,\n          dialogTitle: \`Save or share the \${label.toLowerCase()}\`,\n          files: [saved.uri],\n        });\n        dispatch({ type: 'RESET_ARCHIVE' });\n      } catch (error) {\n        dispatch({ type: 'SET_ERROR_MESSAGE', payload: \`Archive Failed: \${error.message || 'Unable to open the native share sheet.'}\` });\n      }\n      return;\n    }\n\n    const blob = new Blob([content], { type: mimeType });\n    const url = URL.createObjectURL(blob);\n    const a = document.createElement('a');\n    a.href = url;\n    a.download = fileName;\n    document.body.appendChild(a);\n    a.click();\n    document.body.removeChild(a);\n    URL.revokeObjectURL(url);\n    dispatch({ type: 'RESET_ARCHIVE' });\n  };\n\n  const handleHtmlArchive = () => triggerTextArchive({\n    content: generateGrimoireHtmlDocument(state, state.deck),\n    extension: 'html',\n    mimeType: 'text/html',\n    label: 'HTML Archive',\n  });\n\n  const handleJsonArchive = () => triggerTextArchive({\n    content: serializeGrimoireArchive({ state, deck: state.deck }),\n    extension: 'json',\n    mimeType: 'application/json',\n    label: 'Restorable JSON Archive',\n  });\n\n  const handleRestoreJsonArchive = () => {\n    const picker = document.createElement('input');\n    picker.type = 'file';\n    picker.accept = 'application/json,.json';\n    picker.onchange = async () => {\n      const file = picker.files?.[0];\n      if (!file) return;\n      try {\n        const parsed = parseGrimoireArchive(await file.text());\n        const restored = buildArchiveRestoreState({\n          envelope: parsed.envelope,\n          styles: ART_STYLES,\n          traditions: TRADITIONS,\n        });\n        dispatch({ type: 'RESTORE_ARCHIVE', payload: restored });\n        if (parsed.contractStatus !== 'CURRENT_CONTRACT_MATCH') {\n          dispatch({\n            type: 'SET_ERROR_MESSAGE',\n            payload: parsed.migratedLegacy\n              ? 'Legacy archive restored. Canonical semantic provenance was not present in that archive.'\n              : 'Archive restored from a different canonical semantic contract. Historical ReadingRecord preserved without being reclassified as current.',\n          });\n        }\n      } catch (error) {\n        dispatch({ type: 'SET_ERROR_MESSAGE', payload: \`Archive Restore Failed: \${error.message || 'Invalid JSON archive.'}\` });\n      }\n    };\n    picker.click();\n  };`;
source = `${source.slice(0, downloadStart)}${newArchiveHandlers}${source.slice(quickEnd)}`;

replaceOnce(
  'Oracle provenance panel',
  '<div className="p-10 border-2 border-red-600 bg-black/80 text-xl leading-relaxed text-red-600 font-body shadow-[0_0_30px_#ff000022] backdrop-blur-md overflow-y-auto max-h-[50vh]"><p>{state.reading.answer}</p></div>',
  `<div className="p-10 border-2 border-red-600 bg-black/80 text-xl leading-relaxed text-red-600 font-body shadow-[0_0_30px_#ff000022] backdrop-blur-md overflow-y-auto max-h-[50vh]"><p>{state.reading.answer}</p></div>\n                <ReadingProvenancePanel reading={state.reading} />`,
);

replaceOnce(
  'quick HTML archive button handler',
  '<button onClick={handleQuickArchive} className="w-full py-4 bg-[#b8860b] text-black font-header text-[10px] sm:text-sm hover:bg-white transition-colors mb-4 shadow-[0_0_15px_#b8860b]">\n                   QUICK SAVE (Current Deck)\n                 </button>',
  `<button onClick={handleHtmlArchive} className="w-full py-4 bg-[#b8860b] text-black font-header text-[10px] sm:text-sm hover:bg-white transition-colors mb-4 shadow-[0_0_15px_#b8860b]">\n                   QUICK HTML ARCHIVE\n                 </button>\n                 <button onClick={handleJsonArchive} className="w-full py-4 border-2 border-[#b8860b] text-[#e5c158] font-header text-[10px] sm:text-sm hover:bg-[#b8860b] hover:text-black transition-colors mb-4">\n                   EXPORT RESTORABLE JSON\n                 </button>\n                 <button onClick={handleRestoreJsonArchive} className="w-full py-4 border border-red-600/70 text-red-500 font-header text-[10px] sm:text-sm hover:bg-red-600 hover:text-black transition-colors mb-4">\n                   RESTORE JSON ARCHIVE\n                 </button>`,
);

replaceOnce(
  'ready HTML archive button handler',
  '<button onClick={() => triggerDownload(generateHtmlDocument(state, state.deck))} className="w-full py-4 bg-[#b8860b] text-black font-header text-sm hover:bg-white transition-colors mb-4 shadow-[0_0_15px_#b8860b]">\n                   DOWNLOAD HTML\n                 </button>',
  `<button onClick={handleHtmlArchive} className="w-full py-4 bg-[#b8860b] text-black font-header text-sm hover:bg-white transition-colors mb-4 shadow-[0_0_15px_#b8860b]">\n                   DOWNLOAD HTML + READING PROVENANCE\n                 </button>\n                 <button onClick={handleJsonArchive} className="w-full py-4 border-2 border-[#b8860b] text-[#e5c158] font-header text-[10px] sm:text-sm hover:bg-[#b8860b] hover:text-black transition-colors mb-4">\n                   EXPORT RESTORABLE JSON\n                 </button>`,
);

const postconditions = [
  APPLIED_SENTINEL,
  "case 'RESTORE_ARCHIVE'",
  'generateGrimoireHtmlDocument(state, state.deck)',
  'serializeGrimoireArchive({ state, deck: state.deck })',
  'parseGrimoireArchive(await file.text())',
  '<ReadingProvenancePanel reading={state.reading} />',
  'EXPORT RESTORABLE JSON',
  'RESTORE JSON ARCHIVE',
];
for (const marker of postconditions) {
  if (!source.includes(marker)) throw new Error(`0.36 migration postcondition failed: ${marker}`);
}
if (source.includes('const generateHtmlDocument = (state, deck) =>')) throw new Error('0.36 migration failed to remove legacy HTML generator.');
if (source.includes('triggerDownload(generateHtmlDocument')) throw new Error('0.36 migration left a legacy archive call site.');

fs.writeFileSync(appPath, source);
console.log('Applied 0.36 ReadingRecord archive/provenance bridge to src/App.jsx.');
console.log('Next: node scripts/verify-0.36-readingrecord-archive-provenance.mjs && npm run check');
