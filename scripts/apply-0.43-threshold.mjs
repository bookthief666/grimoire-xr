import fs from 'node:fs';
import path from 'node:path';

const appPath = path.join(process.cwd(), 'src/App.jsx');
let app = fs.readFileSync(appPath, 'utf8');

const fail = message => { throw new Error(`0.43 Threshold activator refused to edit: ${message}`); };
const replaceOnce = (source, before, after, label) => {
  if (source.includes(after)) return source;
  const first = source.indexOf(before);
  if (first < 0) fail(`${label} anchor not found`);
  if (source.indexOf(before, first + before.length) >= 0) fail(`${label} anchor ambiguous`);
  return source.replace(before, after);
};

app = replaceOnce(
  app,
  "import LivingRelicSurface from './tarotBridge/LivingRelicSurface.jsx';\nimport ContinuityReturnDialog from './ContinuityReturnDialog.jsx';",
  "import LivingRelicSurface from './tarotBridge/LivingRelicSurface.jsx';\nimport { buildThresholdReading } from './tarotBridge/thresholdReading.js';\nimport ThresholdLanding from './ThresholdLanding.jsx';\nimport ContinuityReturnDialog from './ContinuityReturnDialog.jsx';",
  'Threshold imports',
);

app = replaceOnce(
  app,
  "  const [landingConfirmOpen, setLandingConfirmOpen] = useState(false);",
  "  const [landingConfirmOpen, setLandingConfirmOpen] = useState(false);\n  const [isThresholdInterpreting, setIsThresholdInterpreting] = useState(false);",
  'Threshold interpretation state',
);

app = replaceOnce(
  app,
  "    case 'OPEN_ORACLE': return { ...state, phase: 'ORACLE', reading: null };\n    case 'SET_ORACLE_QUESTION': return { ...state, oracleQuestion: action.payload };\n    case 'CONSULT_ORACLE_START': return { ...state, isConsulting: true, reading: null };\n    case 'CONSULT_ORACLE_SUCCESS': return { ...state, isConsulting: false, reading: action.payload, deck: action.payload.updatedDeck || state.deck };",
  "    case 'OPEN_ORACLE': return { ...state, phase: 'ORACLE', reading: null };\n    case 'OPEN_THRESHOLD': return { ...state, phase: 'LANDING', reading: null, oracleQuestion: '', isConsulting: false };\n    case 'THRESHOLD_READING_READY': return {\n      ...state,\n      phase: 'ORACLE',\n      deck: action.payload.deck,\n      reading: action.payload.reading,\n      oracleQuestion: action.payload.reading?.readingRecord?.input?.question || state.oracleQuestion,\n      activeSpread: 'TRIAD',\n      spreadSlots: [null, null, null],\n      placementCardId: null,\n      isConsulting: false,\n      status: 'CANONICAL READING OPEN',\n    };\n    case 'ORACLE_INTERPRETATION_SUCCESS': return {\n      ...state,\n      reading: state.reading ? {\n        ...state.reading,\n        answer: action.payload,\n        answerAuthority: 'MODEL_GENERATED_INTERPRETATION',\n        providerFree: false,\n      } : state.reading,\n    };\n    case 'SET_ORACLE_QUESTION': return { ...state, oracleQuestion: action.payload };\n    case 'CONSULT_ORACLE_START': return { ...state, isConsulting: true, reading: null };\n    case 'CONSULT_ORACLE_SUCCESS': return { ...state, isConsulting: false, reading: action.payload, deck: action.payload.updatedDeck || state.deck };",
  'Threshold reducer transitions',
);

const ritualEnd = "  }, [state.author, state.selectedStyle, state.selectedTradition, state.erosLevel, state.techLevel, ritualShake]);\n\n  const generateCardData = async (card, setStatusCb = null, imageOptions = {}) => {";
const thresholdHandlers = `  }, [state.author, state.selectedStyle, state.selectedTradition, state.erosLevel, state.techLevel, ritualShake]);

  const handleThresholdDraw = useCallback(() => {
    const question = state.oracleQuestion.trim();
    if (!question) return;
    try {
      const prepared = buildThresholdReading({
        question,
        tradition: state.selectedTradition,
      });
      oracleBuzz();
      dispatch({ type: 'THRESHOLD_READING_READY', payload: prepared });
    } catch (error) {
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: \`Threshold Draw Failed: \${error.message || 'Unable to construct the canonical reading.'}\` });
    }
  }, [state.oracleQuestion, state.selectedTradition, oracleBuzz]);

  const handleThresholdInterpretation = useCallback(async () => {
    const reading = state.reading;
    if (!reading?.readingRecord || isThresholdInterpreting) return;
    setIsThresholdInterpreting(true);
    try {
      const canonicalPrompt = buildCanonicalOracleSynthesisPrompt({
        author: state.author,
        traditionName: state.selectedTradition.name,
        techContext: TECH_LEVELS[state.techLevel].instruction,
        erosContext: getErosContext(state.erosLevel),
        record: reading.readingRecord,
        cards: reading.cards,
      });
      const res = await fetchGemini(canonicalPrompt, true, 'oracle');
      dispatch({ type: 'ORACLE_INTERPRETATION_SUCCESS', payload: res.answer });
      oracleBuzz();
    } catch (error) {
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: \`Interpretation Unavailable: \${error.message || 'The text provider did not answer.'}\` });
    } finally {
      setIsThresholdInterpreting(false);
    }
  }, [state.reading, state.author, state.selectedTradition, state.techLevel, state.erosLevel, isThresholdInterpreting, oracleBuzz]);

  const generateCardData = async (card, setStatusCb = null, imageOptions = {}) => {`;
app = replaceOnce(app, ritualEnd, thresholdHandlers, 'Threshold handlers');

const oldLanding = `          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-[100dvh] pt-[calc(5rem+env(safe-area-inset-top))] pr-[max(1.5rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] flex flex-col items-center justify-center text-center z-10 relative flex-1">
            <h1 className="text-4xl sm:text-6xl font-header text-red-600 mb-8 neon-text"><GlitchText text="ARCHETYPE" /></h1>
            <div className="w-full max-w-lg bg-black/80 neon-border p-6 backdrop-blur-md shadow-[0_0_50px_#ff000033]">
              <div className="mb-6 grid grid-cols-2 gap-2 border-b border-red-600/30 pb-6">
                <div className="text-[10px] font-header text-left opacity-50">TRADITION:</div>
                <div className="text-[10px] font-header text-right text-red-600">{state.selectedTradition.name}</div>
                <div className="text-[10px] font-header text-left opacity-50">STYLE:</div>
                <div className="text-[10px] font-header text-right text-red-600">{state.selectedStyle.name}</div>
              </div>
              <input value={state.author} onChange={(e) => dispatch({ type: 'SET_AUTHOR', payload: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleRitualInitiation()} enterKeyHint="go" autoCapitalize="words" placeholder="INSERT SUBJECT..." className="native-text-input w-full bg-black/40 border border-red-600/50 p-4 text-center font-header text-red-600 focus:outline-none focus:border-red-600 transition-all mb-6" />
              <button onClick={handleRitualInitiation} className="w-full py-4 bg-red-600 text-black font-header text-sm hover:bg-white transition-colors shadow-[0_0_15px_#ff0000]">INITIATE RITUAL</button>
              <button onClick={handleRestoreJsonArchive} className="w-full mt-3 py-3 border border-red-600/70 text-red-500 font-header text-[10px] hover:bg-red-600 hover:text-black transition-colors">
                RESTORE ARCHIVE FROM JSON
              </button>
              {!Capacitor.isNativePlatform() && (
                <a href="/vr" className="block w-full mt-3 py-3 border border-[#b8860b] text-[#d6b45b] font-header text-[10px] hover:bg-[#b8860b] hover:text-black transition-colors shadow-[0_0_12px_#b8860b44]">
                  ENTER VR PROTOTYPE
                </a>
              )}
            </div>
          </motion.div>`;

const newLanding = `          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
            <ThresholdLanding
              question={state.oracleQuestion}
              onQuestionChange={(value) => dispatch({ type: 'SET_ORACLE_QUESTION', payload: value })}
              onDraw={handleThresholdDraw}
              traditionName={state.selectedTradition.name}
              subject={state.author}
              onSubjectChange={(value) => dispatch({ type: 'SET_AUTHOR', payload: value })}
              styleName={state.selectedStyle.name}
              onInitiateStudio={handleRitualInitiation}
              onRestoreArchive={handleRestoreJsonArchive}
              vrHref={!Capacitor.isNativePlatform() ? '/vr' : null}
            />
          </motion.div>`;
app = replaceOnce(app, oldLanding, newLanding, 'Threshold landing surface');

app = replaceOnce(
  app,
  "                onArchive={() => dispatch({ type: 'OPEN_ARCHIVE_PROMPT' })}\n                onNewReading={() => dispatch({ type: 'OPEN_ORACLE' })}\n              />",
  "                onArchive={() => dispatch({ type: 'OPEN_ARCHIVE_PROMPT' })}\n                onNewReading={() => dispatch({ type: 'OPEN_THRESHOLD' })}\n                onInterpret={handleThresholdInterpretation}\n                isInterpreting={isThresholdInterpreting}\n              />",
  'Threshold Living Book actions',
);

if (!app.includes("import ThresholdLanding from './ThresholdLanding.jsx';")) fail('ThresholdLanding import missing');
if (!app.includes("import { buildThresholdReading } from './tarotBridge/thresholdReading.js';")) fail('Threshold model import missing');
if (!app.includes('handleThresholdDraw')) fail('Threshold draw handler missing');
if (!app.includes('THRESHOLD_READING_READY')) fail('Threshold reducer transition missing');
if (!app.includes('handleThresholdInterpretation')) fail('Threshold interpretation handler missing');
if (!app.includes('<ThresholdLanding')) fail('Threshold landing surface missing');

fs.writeFileSync(appPath, app);
console.log('Applied 0.43 Threshold provider-free first reading to src/App.jsx.');
