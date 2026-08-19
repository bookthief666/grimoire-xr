import fs from 'node:fs';

const fail = message => { throw new Error(`0.47 Phase D activator refused to edit: ${message}`); };
const replaceOnce = (source, before, after, label) => {
  const count = source.split(before).length - 1;
  if (count !== 1) fail(`${label} expected exactly one anchor, found ${count}`);
  return source.replace(before, after);
};

const appPath = 'src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

if (!app.includes("import SemanticConfigurationPanel from './semantic/SemanticConfigurationPanel.jsx';") || !app.includes("case 'PATCH_SEMANTIC_CONFIG':")) {
  fail('Phase C semantic runtime is not active; apply and verify Phase C first');
}

if (!app.includes("import CodexStyleLibrary from './codex/CodexStyleLibrary.jsx';")) {
  app = replaceOnce(app, "import SemanticConfigurationPanel from './semantic/SemanticConfigurationPanel.jsx';", "import SemanticConfigurationPanel from './semantic/SemanticConfigurationPanel.jsx';\nimport CodexStyleLibrary from './codex/CodexStyleLibrary.jsx';", 'Codex Style Library import');
}

if (!app.includes('{!isMenuOpen && <AudioController />}')) {
  app = replaceOnce(app, '      <AudioController />', '      {!isMenuOpen && <AudioController />}', 'hide floating audio control while Codex is open');
}

const oldDrawer = 'className="grimoire-codex-drawer fixed inset-y-0 right-0 w-full max-w-80 bg-black border-l-2 border-red-600 z-[60] pt-[calc(1.5rem+env(safe-area-inset-top))] pr-[max(1.5rem,env(safe-area-inset-right))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] pl-6 shadow-[0_0_50px_#ff000033] overflow-y-auto native-scroll"';
const newDrawer = 'className="grimoire-codex-drawer fixed inset-y-0 right-0 w-[min(94vw,30rem)] sm:w-[min(72vw,34rem)] max-w-none bg-black border-l-2 border-red-600 z-[70] pt-[calc(1rem+env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] shadow-[0_0_50px_#ff000033] overflow-y-auto native-scroll"';
if (!app.includes(newDrawer)) app = replaceOnce(app, oldDrawer, newDrawer, 'Fold-aware Codex drawer width');

const oldHeader = '<div className="flex justify-between items-center mb-8 pb-4 border-b border-red-600/30">';
const newHeader = '<div className="sticky top-0 z-20 -mx-2 px-2 py-3 mb-6 flex justify-between items-center border-b border-red-600/30 bg-black/95 backdrop-blur-md">';
if (!app.includes(newHeader)) app = replaceOnce(app, oldHeader, newHeader, 'sticky Codex header');

const oldStyleLibrary = `            <div className="mb-6">
              <h3 className="font-header text-xs mb-2 opacity-50 text-[#b8860b]">STYLE ({ART_STYLES.length})</h3>
              {ART_STYLES.map(s => (
                <button key={s.id} onClick={() => dispatch({ type: 'SET_STYLE', payload: s })} className={\`block w-full text-left p-2 mb-2 border \${state.selectedStyle.id === s.id ? 'bg-[#b8860b] text-black border-[#b8860b]' : 'border-[#b8860b]/30 text-[#b8860b] hover:border-[#b8860b]'}\`}>{s.name}</button>
              ))}
            </div>`;
const newStyleLibrary = `            <CodexStyleLibrary
              styles={ART_STYLES}
              selectedStyle={state.selectedStyle}
              disabled={state.isConsulting || state.isForging}
              onSelect={(style) => dispatch({ type: 'SET_STYLE', payload: style })}
            />`;
if (!app.includes('<CodexStyleLibrary')) app = replaceOnce(app, oldStyleLibrary, newStyleLibrary, 'replace 51-style scroll wall with searchable library');

fs.writeFileSync(appPath, app);
console.log('Applied 0.47 Phase D Codex Fold UX stabilization.');
