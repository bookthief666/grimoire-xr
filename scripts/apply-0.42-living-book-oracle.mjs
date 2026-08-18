import fs from 'node:fs';
import path from 'node:path';

const appPath = path.join(process.cwd(), 'src/App.jsx');
let app = fs.readFileSync(appPath, 'utf8');

const fail = message => { throw new Error(`0.42 Living Book activator refused to edit: ${message}`); };
const replaceOnce = (source, before, after, label) => {
  if (source.includes(after)) return source;
  const first = source.indexOf(before);
  if (first < 0) fail(`${label} anchor not found`);
  if (source.indexOf(before, first + before.length) >= 0) fail(`${label} anchor ambiguous`);
  return source.replace(before, after);
};

app = replaceOnce(
  app,
  "import ReadingProvenancePanel from './tarotBridge/ReadingProvenancePanel.jsx';",
  "import OracleLivingBook from './tarotBridge/OracleLivingBook.jsx';",
  'Oracle component import',
);

app = replaceOnce(
  app,
  '          <motion.div key="oracle" className="min-h-[100dvh] pt-[calc(8rem+env(safe-area-inset-top))] pr-[max(1.5rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] flex flex-col items-center max-w-4xl mx-auto z-20 relative">',
  '          <motion.div key="oracle" className={`min-h-[100dvh] pt-[calc(8rem+env(safe-area-inset-top))] pr-[max(1.5rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] flex flex-col items-center ${state.reading ? \'max-w-5xl\' : \'max-w-4xl\'} mx-auto z-20 relative`}>',
  'completed-reading measure',
);

app = replaceOnce(
  app,
  '            <h2 className="text-6xl font-header text-red-600 mb-12 neon-text text-center"><GlitchText text="THE ORACLE" isEgregore={isEgregoreActive} /></h2>',
  '            {!state.reading && <h2 className="text-6xl font-header text-red-600 mb-12 neon-text text-center"><GlitchText text="THE ORACLE" isEgregore={isEgregoreActive} /></h2>}',
  'completed-reading title hierarchy',
);

const oldReading = `            {state.reading && !state.isConsulting && (\n              <div className="w-full space-y-12 pb-40">\n                <div className="flex justify-center gap-6">\n                  {state.reading.cards.map((c, i) => (\n                    <div key={i} className="w-28 sm:w-40 aspect-[2/3.4] border-2 border-red-600 bg-black/40 shadow-[0_0_20px_#ff000033] relative">\n                      {c.imageUrl ? <><img src={c.imageUrl} className="w-full h-full object-cover pixelated" /><ArcaneFrame element={normalizeElement(c.meta)}/></> : <CardSkeleton />}\n                    </div>\n                  ))}\n                </div>\n                <div className="p-10 border-2 border-red-600 bg-black/80 text-xl leading-relaxed text-red-600 font-body shadow-[0_0_30px_#ff000022] backdrop-blur-md overflow-y-auto max-h-[50vh]"><p>{state.reading.answer}</p></div>\n                <ReadingProvenancePanel reading={state.reading} />\n                <button onClick={() => dispatch({ type: 'OPEN_ORACLE' })} className="w-full text-center text-sm font-header text-red-600 opacity-60 hover:opacity-100 hover:text-white transition-colors">NEW READING</button>\n              </div>\n            )}`;

const newReading = `            {state.reading && !state.isConsulting && (\n              <OracleLivingBook\n                reading={state.reading}\n                onCopy={copyToClipboard}\n                copied={copied}\n                onArchive={() => dispatch({ type: 'OPEN_ARCHIVE_PROMPT' })}\n                onNewReading={() => dispatch({ type: 'OPEN_ORACLE' })}\n              />\n            )}`;

app = replaceOnce(app, oldReading, newReading, 'completed Oracle reading surface');

if (!app.includes("import OracleLivingBook from './tarotBridge/OracleLivingBook.jsx';")) fail('Living Book import missing');
if (!app.includes('<OracleLivingBook')) fail('Living Book surface missing');
if (!app.includes("state.reading ? 'max-w-5xl' : 'max-w-4xl'")) fail('completed-reading width hierarchy missing');
if (app.includes('<ReadingProvenancePanel reading={state.reading} />')) fail('old technical provenance surface still mounted in Oracle');

fs.writeFileSync(appPath, app);
console.log('Applied 0.42 Living Book Oracle Coherence to src/App.jsx.');
