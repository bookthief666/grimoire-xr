import fs from 'node:fs';
import path from 'node:path';

const appPath = path.join(process.cwd(), 'src/App.jsx');
let app = fs.readFileSync(appPath, 'utf8');

const fail = message => { throw new Error(`0.46 activator refused to edit: ${message}`); };
const replaceOnce = (source, before, after, label) => {
  if (source.includes(after)) return source;
  const first = source.indexOf(before);
  if (first < 0) fail(`${label} anchor not found`);
  if (source.indexOf(before, first + before.length) >= 0) fail(`${label} anchor ambiguous`);
  return source.replace(before, after);
};

app = replaceOnce(
  app,
  "import AestheticCurrentControl from './aesthetic/AestheticCurrentControl.jsx';\nimport { persistAestheticPreferences, restoreAestheticPreferences } from './aesthetic/aestheticCurrents.js';",
  "import AestheticCurrentControl from './aesthetic/AestheticCurrentControl.jsx';\nimport { persistAestheticPreferences, restoreAestheticPreferences } from './aesthetic/aestheticCurrents.js';\nimport ReliquarySurface from './reliquary/ReliquarySurface.jsx';\nimport RelicChamberField from './reliquary/RelicChamberField.jsx';\nimport { loadReliquary, removeReliquaryEntry, saveReliquaryReading } from './reliquary/reliquaryStore.js';",
  'reliquary imports',
);

app = replaceOnce(
  app,
  "  const [landingConfirmOpen, setLandingConfirmOpen] = useState(false);\n  const [isThresholdInterpreting, setIsThresholdInterpreting] = useState(false);\n  const initialAesthetic = useMemo(restoreAestheticPreferences, []);",
  "  const [landingConfirmOpen, setLandingConfirmOpen] = useState(false);\n  const [isThresholdInterpreting, setIsThresholdInterpreting] = useState(false);\n  const [reliquaryEntries, setReliquaryEntries] = useState([]);\n  const [reliquaryBusy, setReliquaryBusy] = useState(false);\n  const [reliquaryNotice, setReliquaryNotice] = useState('');\n  const initialAesthetic = useMemo(restoreAestheticPreferences, []);",
  'reliquary state',
);

app = replaceOnce(
  app,
  "  useEffect(() => {\n    persistAestheticPreferences({ current: aestheticCurrent, enchantment: enchantmentLevel });\n  }, [aestheticCurrent, enchantmentLevel]);\n\n  const isEgregoreActive = state.erosLevel >= 3;",
  "  useEffect(() => {\n    persistAestheticPreferences({ current: aestheticCurrent, enchantment: enchantmentLevel });\n  }, [aestheticCurrent, enchantmentLevel]);\n\n  useEffect(() => {\n    let cancelled = false;\n    void loadReliquary().then(result => {\n      if (cancelled) return;\n      setReliquaryEntries(result.entries || []);\n      if (result.status === 'RESTORED_WITH_MISSING_IMAGES') {\n        setReliquaryNotice(`RELIQUARY RESTORED · ${result.missingImages.length} ARTWORK FILE${result.missingImages.length === 1 ? '' : 'S'} MISSING · READING RECORDS PRESERVED`);\n      } else if (result.status === 'CORRUPT') {\n        setReliquaryNotice('RELIQUARY INDEX COULD NOT BE READ · CURRENT SESSION IS UNAFFECTED');\n      }\n    }).catch(error => {\n      if (cancelled) return;\n      console.warn('Reliquary restore failed.', error);\n      setReliquaryNotice('RELIQUARY STORAGE IS UNAVAILABLE · FILE EXPORTS REMAIN AVAILABLE');\n    });\n    return () => { cancelled = true; };\n  }, []);\n\n  const isEgregoreActive = state.erosLevel >= 3;",
  'reliquary startup restore',
);

app = replaceOnce(
  app,
  "  const confirmReturnToLanding = useCallback(() => {\n    setLandingConfirmOpen(false);\n    dispatch({ type: 'RETURN_TO_LANDING' });\n  }, []);\n\n  useEffect(() => {\n    let cancelled = false;",
  "  const confirmReturnToLanding = useCallback(() => {\n    setLandingConfirmOpen(false);\n    dispatch({ type: 'RETURN_TO_LANDING' });\n  }, []);\n\n  const refreshReliquary = useCallback(async () => {\n    const result = await loadReliquary();\n    setReliquaryEntries(result.entries || []);\n    return result;\n  }, []);\n\n  const handleSealCurrentReading = useCallback(async ({ openAfter = true } = {}) => {\n    if (!state.reading?.readingRecord) {\n      setReliquaryNotice('NO CANONICAL READING IS OPEN TO SEAL');\n      if (openAfter) dispatch({ type: 'OPEN_ARCHIVE_PROMPT' });\n      return;\n    }\n    setReliquaryBusy(true);\n    try {\n      const saved = await saveReliquaryReading({ state });\n      if (!saved.saved) throw new Error(saved.error || 'Unable to save the reading.');\n      const restored = await refreshReliquary();\n      setReliquaryNotice(saved.status === 'SAVED_WITH_WARNINGS' || restored.status === 'RESTORED_WITH_MISSING_IMAGES'\n        ? 'READING SEALED · SOME ARTWORK COULD NOT BE CACHED · CANONICAL MEMORY PRESERVED'\n        : 'READING SEALED INTO THE RELIQUARY');\n      if (openAfter) dispatch({ type: 'OPEN_ARCHIVE_PROMPT' });\n    } catch (error) {\n      setReliquaryNotice(`RELIQUARY SEAL FAILED · ${error.message || 'LOCAL STORAGE UNAVAILABLE'}`);\n      if (openAfter) dispatch({ type: 'OPEN_ARCHIVE_PROMPT' });\n    } finally {\n      setReliquaryBusy(false);\n    }\n  }, [state, refreshReliquary]);\n\n  const handleRestoreReliquaryMemory = useCallback(entry => {\n    if (!entry?.state) return;\n    const rebound = rebindSessionCatalogState(entry.state, { styles: ART_STYLES, traditions: TRADITIONS });\n    dispatch({\n      type: 'RESTORE_ARCHIVE',\n      payload: { ...rebound, isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false },\n    });\n    setReliquaryNotice('');\n  }, []);\n\n  const handleForgetReliquaryMemory = useCallback(async entryId => {\n    const result = await removeReliquaryEntry({ entryId });\n    if (result.status === 'FAILED') {\n      setReliquaryNotice(`COULD NOT FORGET MEMORY · ${result.error || 'LOCAL STORAGE UNAVAILABLE'}`);\n      return;\n    }\n    await refreshReliquary();\n    setReliquaryNotice(result.removed ? 'MEMORY RELEASED FROM THE RELIQUARY' : 'MEMORY WAS ALREADY ABSENT');\n  }, [refreshReliquary]);\n\n  useEffect(() => {\n    let cancelled = false;",
  'reliquary handlers',
);

app = replaceOnce(
  app,
  "                onArchive={() => dispatch({ type: 'OPEN_ARCHIVE_PROMPT' })}",
  "                onArchive={() => void handleSealCurrentReading()}",
  'keep reading action',
);

app = replaceOnce(
  app,
  "            className=\"fixed inset-0 z-[80] bg-black/95 backdrop-blur-xl overflow-y-auto native-scroll flex items-start justify-center pt-[calc(4rem+env(safe-area-inset-top))] sm:pt-[calc(6rem+env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[calc(6rem+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))]\"",
  "            className=\"relic-chamber-overlay fixed inset-0 z-[80] bg-black/95 backdrop-blur-xl overflow-y-auto native-scroll flex items-start justify-center pt-[calc(4rem+env(safe-area-inset-top))] sm:pt-[calc(6rem+env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[calc(6rem+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))]\"",
  'relic chamber overlay class',
);

app = replaceOnce(
  app,
  "          >\n            <motion.div \n              key={state.focusedCard.id}",
  "          >\n            <RelicChamberField card={state.focusedCard} tradition={state.selectedTradition} reducedMotion={reducedMotion} />\n            <motion.div \n              key={state.focusedCard.id}",
  'relic chamber field mount',
);

app = replaceOnce(
  app,
  "              className=\"relative w-full max-w-4xl bg-black border-4 border-red-600 shadow-[0_0_100px_rgba(255,0,0,0.3)] p-6 sm:p-10 flex flex-col mb-auto\"",
  "              className=\"relic-chamber-panel relative w-full max-w-4xl bg-black border-4 border-red-600 shadow-[0_0_100px_rgba(255,0,0,0.3)] p-6 sm:p-10 flex flex-col mb-auto\"",
  'relic chamber panel class',
);

app = replaceOnce(
  app,
  "                  <p className=\"text-[8px] sm:text-[10px] font-header text-[#b8860b] mt-2 tracking-widest\">PATINA FACTOR: {state.focusedCard.patina || 0}</p>",
  "                  <p className=\"relic-chamber-history-line text-[8px] sm:text-[10px] font-header text-[#b8860b] mt-2 tracking-widest\">RELIC HISTORY · {state.focusedCard.patina || 0} ENCOUNTER{(state.focusedCard.patina || 0) === 1 ? '' : 'S'}</p>",
  'relic history label',
);

app = replaceOnce(
  app,
  "                <div className=\"flex-shrink-0 w-full md:w-80 aspect-[2/3] bg-black border-2 border-[#b8860b] relative overflow-hidden shadow-[0_0_30px_#b8860b44] mx-auto md:mx-0 md:sticky md:top-4 h-max\">",
  "                <div className=\"relic-chamber-card-frame flex-shrink-0 w-full md:w-80 aspect-[2/3] bg-black border-2 border-[#b8860b] relative overflow-hidden shadow-[0_0_30px_#b8860b44] mx-auto md:mx-0 md:sticky md:top-4 h-max\">",
  'relic card frame class',
);

if (!app.includes('<ReliquarySurface')) {
  const startMarker = "      {state.archiveState !== 'IDLE' && (\n        <div className=\"fixed inset-0 z-[200]";
  const start = app.indexOf(startMarker);
  if (start < 0) fail('legacy archive surface start anchor not found');
  if (app.indexOf(startMarker, start + startMarker.length) >= 0) fail('legacy archive surface start anchor ambiguous');
  const rootEndMarker = "\n    </div>\n  );\n}";
  const rootEnd = app.lastIndexOf(rootEndMarker);
  if (rootEnd < start) fail('App root end anchor not found after archive surface');
  const replacement = `      {state.archiveState !== 'IDLE' && (\n        <ReliquarySurface\n          entries={reliquaryEntries}\n          currentReading={state.reading}\n          currentQuestion={state.oracleQuestion}\n          archiveState={state.archiveState}\n          archiveProgress={state.archiveProgress}\n          forgedCount={forgedCount}\n          busy={reliquaryBusy}\n          notice={reliquaryNotice}\n          onClose={() => dispatch({ type: 'RESET_ARCHIVE' })}\n          onSealCurrent={() => void handleSealCurrentReading({ openAfter: false })}\n          onRestoreMemory={handleRestoreReliquaryMemory}\n          onForgetMemory={handleForgetReliquaryMemory}\n          onHtmlArchive={handleHtmlArchive}\n          onJsonArchive={handleJsonArchive}\n          onRestoreJsonArchive={handleRestoreJsonArchive}\n          onGrandForge={handleGrandForge}\n        />\n      )}`;
  app = `${app.slice(0, start)}${replacement}${app.slice(rootEnd)}`;
}

for (const marker of [
  "import ReliquarySurface from './reliquary/ReliquarySurface.jsx'",
  'const [reliquaryEntries, setReliquaryEntries]',
  'handleSealCurrentReading',
  'onArchive={() => void handleSealCurrentReading()}',
  '<RelicChamberField',
  'relic-chamber-panel',
  '<ReliquarySurface',
]) {
  if (!app.includes(marker)) fail(`required runtime marker missing: ${marker}`);
}
if (app.includes('>ARCHIVE OPTIONS</h3>')) fail('legacy Archive Options surface still present');

fs.writeFileSync(appPath, app);
console.log('Applied 0.46 Relic Chamber & Reliquary to src/App.jsx.');
