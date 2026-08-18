import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const appPath = path.join(root, 'src/App.jsx');
const mainPath = path.join(root, 'src/main.jsx');

const fail = message => {
  throw new Error(`0.40.1 continuity activator refused to edit: ${message}`);
};

const replaceOnce = (source, before, after, label) => {
  if (source.includes(after)) return source;
  const first = source.indexOf(before);
  if (first < 0) fail(`${label} anchor not found`);
  if (source.indexOf(before, first + before.length) >= 0) fail(`${label} anchor is ambiguous`);
  return source.replace(before, after);
};

let app = fs.readFileSync(appPath, 'utf8');
let main = fs.readFileSync(mainPath, 'utf8');

app = replaceOnce(
  app,
  "import LivingRelicSurface from './tarotBridge/LivingRelicSurface.jsx';\n",
  "import LivingRelicSurface from './tarotBridge/LivingRelicSurface.jsx';\nimport {\n  persistGrimoireSession,\n  rebindSessionCatalogState,\n  restoreGrimoireSession,\n  shouldPersistGrimoireSession,\n} from './persistence/grimoireStore.js';\n",
  'App persistence import',
);

app = replaceOnce(
  app,
  "  const spiritInputRef = useRef(null);\n  \n  const { forgeBuzz, oracleBuzz, spiritBuzz, ritualShake, relicAttuneBuzz } = useHaptic();",
  "  const spiritInputRef = useRef(null);\n  const continuityReadyRef = useRef(false);\n  const continuityWriteRef = useRef(0);\n  const [continuityBooting, setContinuityBooting] = useState(true);\n  const [continuityNotice, setContinuityNotice] = useState('');\n  \n  const { forgeBuzz, oracleBuzz, spiritBuzz, ritualShake, relicAttuneBuzz } = useHaptic();",
  'App continuity state',
);

const continuityBlock = `  const isEgregoreActive = state.erosLevel >= 3;\n\n  const handleReturnToLanding = useCallback(() => {\n    if (state.phase === 'LANDING') return;\n    const confirmed = window.confirm('Return to the landing screen? Your last stable Grimoire session remains autosaved and can be restored by reloading. No saved session will be erased.');\n    if (confirmed) dispatch({ type: 'RETURN_TO_LANDING' });\n  }, [state.phase]);\n\n  useEffect(() => {\n    let cancelled = false;\n    void restoreGrimoireSession().then(result => {\n      if (cancelled) return;\n      continuityReadyRef.current = true;\n      if (result.state) {\n        const rebound = rebindSessionCatalogState(result.state, { styles: ART_STYLES, traditions: TRADITIONS });\n        dispatch({\n          type: 'RESTORE_ARCHIVE',\n          payload: { ...rebound, isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false },\n        });\n        if (result.status === 'RESTORED_WITH_MISSING_IMAGES') {\n          setContinuityNotice(\`SESSION RESTORED · \${result.missingImages.length} ARTWORK FILE\${result.missingImages.length === 1 ? '' : 'S'} MISSING · CANONICAL DATA PRESERVED\`);\n        }\n      } else if (result.status === 'CORRUPT' || result.status === 'FAILED') {\n        setContinuityNotice('LOCAL CONTINUITY CHECKPOINT COULD NOT BE RESTORED · ARCHIVE EXPORTS REMAIN UNAFFECTED');\n      }\n      setContinuityBooting(false);\n    }).catch(error => {\n      if (cancelled) return;\n      continuityReadyRef.current = true;\n      console.warn('Continuity restore failed.', error);\n      setContinuityNotice('LOCAL CONTINUITY CHECKPOINT IS UNAVAILABLE · CURRENT SESSION WILL REMAIN USABLE');\n      setContinuityBooting(false);\n    });\n    return () => { cancelled = true; };\n  }, []);\n\n  useEffect(() => {\n    if (!continuityReadyRef.current || !shouldPersistGrimoireSession(state)) return undefined;\n    const writeToken = ++continuityWriteRef.current;\n    const timer = window.setTimeout(() => {\n      void persistGrimoireSession({ state }).then(result => {\n        if (writeToken !== continuityWriteRef.current) return;\n        if (result.status === 'FAILED') {\n          setContinuityNotice('AUTOSAVE FAILED · EXPORT A JSON ARCHIVE BEFORE LEAVING THIS SESSION');\n        } else if (result.status === 'SAVED_WITH_WARNINGS') {\n          setContinuityNotice('SESSION DATA SAVED · GENERATED ARTWORK CACHE IS DEGRADED');\n        }\n      }).catch(error => {\n        if (writeToken !== continuityWriteRef.current) return;\n        console.warn('Continuity autosave failed.', error);\n        setContinuityNotice('AUTOSAVE FAILED · EXPORT A JSON ARCHIVE BEFORE LEAVING THIS SESSION');\n      });\n    }, 450);\n    return () => window.clearTimeout(timer);\n  }, [state]);`;

app = replaceOnce(
  app,
  "  const isEgregoreActive = state.erosLevel >= 3;",
  continuityBlock,
  'App continuity effects',
);

app = replaceOnce(
  app,
  "        <div className=\"flex items-center gap-4 cursor-pointer\" onClick={() => dispatch({ type: 'RETURN_TO_LANDING' })}>",
  "        <div className=\"flex items-center gap-4 cursor-pointer\" onClick={handleReturnToLanding}>",
  'safe landing action',
);

app = replaceOnce(
  app,
  "      <AudioController />\n",
  "      <AudioController />\n      {continuityBooting && (\n        <div className=\"fixed inset-0 z-[95] bg-black grid place-items-center px-6\">\n          <div className=\"text-center\">\n            <div className=\"text-[#b8860b] font-header text-[10px] sm:text-xs tracking-widest mb-3\">CONTINUITY WARD</div>\n            <div className=\"text-[#e5c158] font-header text-xs sm:text-sm\">RESTORING LAST GRIMOIRE…</div>\n          </div>\n        </div>\n      )}\n",
  'startup continuity shield',
);

const errorBanner = `        {state.errorMessage && (\n          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className=\"fixed top-[calc(6rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 bg-black border border-red-600 text-red-600 text-xs font-header p-4 z-[60] shadow-[0_0_15px_#f00] max-w-md w-[90%] text-center cursor-pointer\" onClick={() => dispatch({ type: 'CLEAR_ERROR_MESSAGE' })}>\n             <AlertTriangle size={16} className=\"inline mr-2 -mt-1\"/> {state.errorMessage}\n          </motion.div>\n        )}`;

const errorAndContinuityBanners = `${errorBanner}\n        {continuityNotice && (\n          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className=\"fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 bg-[#090704] border border-[#b8860b]/70 text-[#d8c89f] text-[10px] sm:text-xs font-header p-3 z-[60] max-w-xl w-[92%] text-center cursor-pointer shadow-[0_0_18px_rgba(184,134,11,0.22)]\" onClick={() => setContinuityNotice('')}>\n            {continuityNotice}\n          </motion.div>\n        )}`;

app = replaceOnce(app, errorBanner, errorAndContinuityBanners, 'continuity warning banner');

main = replaceOnce(
  main,
  "import { APP_ROUTE_IDS, resolveAppRoute } from './appRoute.js';\n",
  "import { APP_ROUTE_IDS, resolveAppRoute } from './appRoute.js';\nimport ErrorBoundary from './ErrorBoundary.jsx';\n",
  'ErrorBoundary import',
);

const oldRoot = `ReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <Suspense fallback={<div className=\"min-h-dvh bg-black text-red-500 grid place-items-center font-mono\">AWAKENING THE GRIMOIRE…</div>}>\n      <RootApp />\n    </Suspense>\n  </React.StrictMode>,\n);`;
const newRoot = `ReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <ErrorBoundary>\n      <Suspense fallback={<div className=\"min-h-dvh bg-black text-red-500 grid place-items-center font-mono\">AWAKENING THE GRIMOIRE…</div>}>\n        <RootApp />\n      </Suspense>\n    </ErrorBoundary>\n  </React.StrictMode>,\n);`;
main = replaceOnce(main, oldRoot, newRoot, 'root ErrorBoundary mount');

if (app.includes("onClick={() => dispatch({ type: 'RETURN_TO_LANDING' })}")) {
  fail('destructive one-click landing reset is still present');
}
if (!app.includes('persistGrimoireSession({ state })') || !app.includes('restoreGrimoireSession()')) {
  fail('continuity lifecycle did not activate');
}
if (!app.includes('RESTORING LAST GRIMOIRE…')) fail('startup continuity shield did not activate');
if (!main.includes('<ErrorBoundary>')) fail('root ErrorBoundary did not activate');

fs.writeFileSync(appPath, app);
fs.writeFileSync(mainPath, main);
console.log('Applied 0.40.1 Continuity Foundation to src/App.jsx and src/main.jsx.');
