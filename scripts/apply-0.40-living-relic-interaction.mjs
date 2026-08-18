import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPath = path.join(root, 'src', 'App.jsx');
let app = fs.readFileSync(appPath, 'utf8');

const done = app.includes("import LivingRelicSurface from './tarotBridge/LivingRelicSurface.jsx';")
  && app.includes('<LivingRelicSurface')
  && app.includes('onAttuned={relicAttuneBuzz}')
  && app.includes('relicAttuneBuzz: () => safely(async () =>');
if (done) {
  console.log('0.40 living relic interaction activation already applied.');
  process.exit(0);
}

const workspaceImport = `import RelicWorkspace from './tarotBridge/RelicWorkspace.jsx';`;
if (!app.includes(workspaceImport)) throw new Error('0.40 activation refused: accepted 0.39 RelicWorkspace import not found.');

const oldRelicBlock = `                <div className="flex-shrink-0 w-full md:w-80 aspect-[2/3] bg-black border-2 border-[#b8860b] relative overflow-hidden shadow-[0_0_30px_#b8860b44] mx-auto md:mx-0 md:sticky md:top-4 h-max">\n                  {state.focusedCard.imageUrl ? (\n                    <>\n                      <img src={state.focusedCard.imageUrl} className={\`w-full h-full object-cover pixelated \${state.focusedCard.patina >= 10 ? 'grayscale sepia contrast-125' : ''}\`} />\n                      <ArcaneFrame element={normalizeElement(state.focusedCard.meta)} />\n                    </>\n                  ) : (\n                    <CardSkeleton />\n                  )}\n                  {state.isForging && (\n                    <div className="absolute inset-x-0 bottom-0 p-4 bg-black/80 flex flex-col items-center justify-center">\n                      <span className="text-[10px] font-header text-red-600 animate-pulse text-center">{state.reforgeStatus || "FORGING ARCANUM..."}</span>\n                    </div>\n                  )}\n                  {(state.focusedCard.patina >= 1) && <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-40 mix-blend-overlay pointer-events-none" />}\n                </div>`;

const newRelicBlock = `                <div className="flex-shrink-0 w-full md:w-80 aspect-[2/3] bg-black border-2 border-[#b8860b] relative overflow-hidden shadow-[0_0_30px_#b8860b44] mx-auto md:mx-0 md:sticky md:top-4 h-max">\n                  <LivingRelicSurface\n                    card={state.focusedCard}\n                    tradition={state.selectedTradition}\n                    reducedMotion={reducedMotion}\n                    onAttuned={relicAttuneBuzz}\n                  >\n                    {state.focusedCard.imageUrl ? (\n                      <>\n                        <img src={state.focusedCard.imageUrl} className={\`w-full h-full object-cover pixelated \${state.focusedCard.patina >= 10 ? 'grayscale sepia contrast-125' : ''}\`} />\n                        <ArcaneFrame element={normalizeElement(state.focusedCard.meta)} />\n                      </>\n                    ) : (\n                      <CardSkeleton />\n                    )}\n                    {state.isForging && (\n                      <div className="absolute inset-x-0 bottom-0 p-4 bg-black/80 flex flex-col items-center justify-center">\n                        <span className="text-[10px] font-header text-red-600 animate-pulse text-center">{state.reforgeStatus || "FORGING ARCANUM..."}</span>\n                      </div>\n                    )}\n                    {(state.focusedCard.patina >= 1) && <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-40 mix-blend-overlay pointer-events-none" />}\n                  </LivingRelicSurface>\n                </div>`;

if (!app.includes(oldRelicBlock)) throw new Error('0.40 activation refused: accepted 0.39 focused-card image block not found.');
app = app.replace(oldRelicBlock, newRelicBlock);

app = app.replace(
  workspaceImport,
  `${workspaceImport}\nimport LivingRelicSurface from './tarotBridge/LivingRelicSurface.jsx';`,
);

const oldSpiritHaptic = `    spiritBuzz: () => safely(() => Haptics.impact({ style: ImpactStyle.Light })),`;
const newSpiritHaptic = `${oldSpiritHaptic}\n    relicAttuneBuzz: () => safely(async () => {\n      await Haptics.impact({ style: ImpactStyle.Light });\n      await pause(55);\n      await Haptics.impact({ style: ImpactStyle.Medium });\n    }),`;
if (!app.includes(oldSpiritHaptic)) throw new Error('0.40 activation refused: haptic surface changed.');
app = app.replace(oldSpiritHaptic, newSpiritHaptic);

const oldHapticDestructure = `  const { forgeBuzz, oracleBuzz, spiritBuzz, ritualShake } = useHaptic();`;
const newHapticDestructure = `  const { forgeBuzz, oracleBuzz, spiritBuzz, ritualShake, relicAttuneBuzz } = useHaptic();`;
if (!app.includes(oldHapticDestructure)) throw new Error('0.40 activation refused: App haptic destructure changed.');
app = app.replace(oldHapticDestructure, newHapticDestructure);

fs.writeFileSync(appPath, app);
console.log('Applied 0.40 Living Relic Interaction to src/App.jsx.');
