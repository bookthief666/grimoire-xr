import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPath = path.join(root, 'src', 'App.jsx');
let app = fs.readFileSync(appPath, 'utf8');

const done = app.includes("import LivingTriadCurrent from './tarotBridge/LivingTriadCurrent.jsx';")
  && app.includes('<LivingTriadCurrent')
  && app.includes('onTrace={currentTraceBuzz}')
  && app.includes('currentTraceBuzz: () => safely(() => Haptics.impact({ style: ImpactStyle.Light }))');
if (done) {
  console.log('0.41 living triad current activation already applied.');
  process.exit(0);
}

const importAnchor = `import LivingRelicSurface from './tarotBridge/LivingRelicSurface.jsx';`;
if (!app.includes(importAnchor)) throw new Error('0.41 activation refused: accepted 0.40 LivingRelicSurface import not found.');
app = app.replace(
  importAnchor,
  `${importAnchor}\nimport LivingTriadCurrent from './tarotBridge/LivingTriadCurrent.jsx';`,
);

const hapticAnchor = `    ritualShake: () => safely(async () => {`;
if (!app.includes(hapticAnchor)) throw new Error('0.41 activation refused: haptic surface changed.');
app = app.replace(
  hapticAnchor,
  `    currentTraceBuzz: () => safely(() => Haptics.impact({ style: ImpactStyle.Light })),\n${hapticAnchor}`,
);

const oldHapticDestructure = `  const { forgeBuzz, oracleBuzz, spiritBuzz, ritualShake, relicAttuneBuzz } = useHaptic();`;
const newHapticDestructure = `  const { forgeBuzz, oracleBuzz, spiritBuzz, ritualShake, relicAttuneBuzz, currentTraceBuzz } = useHaptic();`;
if (!app.includes(oldHapticDestructure)) throw new Error('0.41 activation refused: accepted 0.40 haptic destructure changed.');
app = app.replace(oldHapticDestructure, newHapticDestructure);

const oracleAnchor = `                </div>\n                <div className="p-10 border-2 border-red-600 bg-black/80 text-xl leading-relaxed text-red-600 font-body shadow-[0_0_30px_#ff000022] backdrop-blur-md overflow-y-auto max-h-[50vh]"><p>{state.reading.answer}</p></div>\n                <ReadingProvenancePanel reading={state.reading} />`;
const oracleReplacement = `                </div>\n                <LivingTriadCurrent\n                  reading={state.reading}\n                  cards={state.reading.cards}\n                  reducedMotion={reducedMotion}\n                  onTrace={currentTraceBuzz}\n                />\n                <div className="p-10 border-2 border-red-600 bg-black/80 text-xl leading-relaxed text-red-600 font-body shadow-[0_0_30px_#ff000022] backdrop-blur-md overflow-y-auto max-h-[50vh]"><p>{state.reading.answer}</p></div>\n                <ReadingProvenancePanel reading={state.reading} />`;
if (!app.includes(oracleAnchor)) throw new Error('0.41 activation refused: accepted 0.40 Oracle reading surface changed.');
app = app.replace(oracleAnchor, oracleReplacement);

fs.writeFileSync(appPath, app);
console.log('Applied 0.41 Living Triad Current to src/App.jsx.');
