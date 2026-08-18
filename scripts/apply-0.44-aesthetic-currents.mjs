import fs from 'node:fs';
import path from 'node:path';

const appPath = path.join(process.cwd(), 'src/App.jsx');
let app = fs.readFileSync(appPath, 'utf8');

const fail = message => { throw new Error(`0.44 aesthetic activator refused to edit: ${message}`); };
const replaceOnce = (source, before, after, label) => {
  if (source.includes(after)) return source;
  const first = source.indexOf(before);
  if (first < 0) fail(`${label} anchor not found`);
  if (source.indexOf(before, first + before.length) >= 0) fail(`${label} anchor ambiguous`);
  return source.replace(before, after);
};

app = replaceOnce(
  app,
  "import ContinuityReturnDialog from './ContinuityReturnDialog.jsx';\nimport {",
  "import ContinuityReturnDialog from './ContinuityReturnDialog.jsx';\nimport AestheticField from './aesthetic/AestheticField.jsx';\nimport AestheticCurrentControl from './aesthetic/AestheticCurrentControl.jsx';\nimport { persistAestheticPreferences, restoreAestheticPreferences } from './aesthetic/aestheticCurrents.js';\nimport './aesthetic/aestheticShell.css';\nimport {",
  'aesthetic imports',
);

app = replaceOnce(
  app,
  "  const [landingConfirmOpen, setLandingConfirmOpen] = useState(false);\n  const [isThresholdInterpreting, setIsThresholdInterpreting] = useState(false);\n  \n  const { forgeBuzz, oracleBuzz, spiritBuzz, ritualShake, relicAttuneBuzz } = useHaptic();",
  "  const [landingConfirmOpen, setLandingConfirmOpen] = useState(false);\n  const [isThresholdInterpreting, setIsThresholdInterpreting] = useState(false);\n  const initialAesthetic = useMemo(restoreAestheticPreferences, []);\n  const [aestheticCurrent, setAestheticCurrent] = useState(initialAesthetic.current);\n  const [enchantmentLevel, setEnchantmentLevel] = useState(initialAesthetic.enchantment);\n  \n  const { forgeBuzz, oracleBuzz, spiritBuzz, ritualShake, relicAttuneBuzz } = useHaptic();",
  'aesthetic state',
);

app = replaceOnce(
  app,
  "  useNativeShell(spiritInputRef);\n\n  const isEgregoreActive = state.erosLevel >= 3;",
  "  useNativeShell(spiritInputRef);\n\n  useEffect(() => {\n    persistAestheticPreferences({ current: aestheticCurrent, enchantment: enchantmentLevel });\n  }, [aestheticCurrent, enchantmentLevel]);\n\n  const isEgregoreActive = state.erosLevel >= 3;",
  'aesthetic persistence',
);

app = replaceOnce(
  app,
  "    <div className=\"min-h-[100dvh] bg-transparent text-red-600 font-mono selection:bg-red-600 selection:text-black overflow-x-hidden relative flex flex-col\">",
  "    <div className=\"grimoire-shell min-h-[100dvh] bg-transparent text-red-600 font-mono selection:bg-red-600 selection:text-black overflow-x-hidden relative flex flex-col\" data-aesthetic-current={aestheticCurrent} data-enchantment={enchantmentLevel}>",
  'root presentation attributes',
);

app = replaceOnce(
  app,
  "      <LivingBackground mousePosition={mousePosition} reducedMotion={reducedMotion} />\n      <div className=\"scanlines\" />",
  "      <LivingBackground mousePosition={mousePosition} reducedMotion={reducedMotion} />\n      <AestheticField current={aestheticCurrent} enchantment={enchantmentLevel} reducedMotion={reducedMotion} />\n      <div className=\"scanlines\" />",
  'aesthetic field mount',
);

app = replaceOnce(
  app,
  "      <nav className=\"fixed top-0 inset-x-0 h-[calc(4rem+env(safe-area-inset-top))] z-50 flex items-center justify-between pt-[env(safe-area-inset-top)] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] bg-black/90 border-b-2 border-red-600 backdrop-blur-md shadow-[0_0_20px_rgba(255,0,0,0.4)]\">",
  "      <nav className=\"grimoire-topbar fixed top-0 inset-x-0 h-[calc(4rem+env(safe-area-inset-top))] z-50 flex items-center justify-between pt-[env(safe-area-inset-top)] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] bg-black/90 border-b-2 border-red-600 backdrop-blur-md shadow-[0_0_20px_rgba(255,0,0,0.4)]\">",
  'topbar class',
);

app = replaceOnce(
  app,
  "          <div className=\"w-8 h-8 bg-red-600 flex items-center justify-center text-black font-header font-bold text-xs shadow-[0_0_10px_#ff0000]\">Θ</div>",
  "          <div className=\"grimoire-brand-sigil w-8 h-8 bg-red-600 flex items-center justify-center text-black font-header font-bold text-xs shadow-[0_0_10px_#ff0000]\">Θ</div>",
  'brand sigil class',
);

const shellButtonBefore = 'className="flex items-center gap-2 px-3 py-2 bg-black border border-red-600 text-xs font-header hover:bg-red-600 hover:text-black transition-all shadow-[0_0_10px_#ff000033]"';
const shellButtonAfter = 'className="grimoire-shell-button flex items-center gap-2 px-3 py-2 bg-black border border-red-600 text-xs font-header hover:bg-red-600 hover:text-black transition-all shadow-[0_0_10px_#ff000033]"';
if (!app.includes(shellButtonAfter)) {
  const count = app.split(shellButtonBefore).length - 1;
  if (count < 3) fail(`expected at least 3 shell navigation buttons, found ${count}`);
  app = app.split(shellButtonBefore).join(shellButtonAfter);
}

app = replaceOnce(
  app,
  "<button onClick={() => setIsMenuOpen(true)} className=\"flex items-center gap-2 px-3 py-2 bg-black border border-red-600 text-xs font-header hover:bg-red-600 hover:text-black transition-all shadow-[0_0_10px_#ff000033]\"><Menu size={14} /></button>",
  "<button onClick={() => setIsMenuOpen(true)} className=\"grimoire-shell-button flex items-center gap-2 px-3 py-2 bg-black border border-red-600 text-xs font-header hover:bg-red-600 hover:text-black transition-all shadow-[0_0_10px_#ff000033]\"><Menu size={14} /></button>",
  'menu shell button',
);

app = replaceOnce(
  app,
  "className=\"fixed inset-y-0 right-0 w-full max-w-80 bg-black border-l-2 border-red-600 z-[60] pt-[calc(1.5rem+env(safe-area-inset-top))] pr-[max(1.5rem,env(safe-area-inset-right))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] pl-6 shadow-[0_0_50px_#ff000033] overflow-y-auto native-scroll\"",
  "className=\"grimoire-codex-drawer fixed inset-y-0 right-0 w-full max-w-80 bg-black border-l-2 border-red-600 z-[60] pt-[calc(1.5rem+env(safe-area-inset-top))] pr-[max(1.5rem,env(safe-area-inset-right))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] pl-6 shadow-[0_0_50px_#ff000033] overflow-y-auto native-scroll\"",
  'codex drawer class',
);

app = replaceOnce(
  app,
  "              <h2 className=\"font-header text-red-600 neon-text\">CODEX</h2>",
  "              <h2 className=\"grimoire-codex-title font-header text-red-600 neon-text\">CODEX</h2>",
  'codex title class',
);

app = replaceOnce(
  app,
  "            <div className=\"p-4 border border-[#b8860b]/50 bg-[#b8860b]/10 mb-8\">\n              <div className=\"flex justify-between items-center mb-2\">\n                <span className=\"text-xs font-header text-[#b8860b] flex items-center gap-2\"><Brain size={12}/> INTELLECT</span>",
  "            <AestheticCurrentControl\n              current={aestheticCurrent}\n              enchantment={enchantmentLevel}\n              onCurrentChange={setAestheticCurrent}\n              onEnchantmentChange={setEnchantmentLevel}\n            />\n            <div className=\"p-4 border border-[#b8860b]/50 bg-[#b8860b]/10 mb-8\">\n              <div className=\"flex justify-between items-center mb-2\">\n                <span className=\"text-xs font-header text-[#b8860b] flex items-center gap-2\"><Brain size={12}/> INTELLECT</span>",
  'aesthetic control mount',
);

for (const required of [
  "data-aesthetic-current={aestheticCurrent}",
  "<AestheticField current={aestheticCurrent}",
  "<AestheticCurrentControl",
  "persistAestheticPreferences({ current: aestheticCurrent, enchantment: enchantmentLevel })",
  "grimoire-topbar",
  "grimoire-codex-drawer",
]) {
  if (!app.includes(required)) fail(`required runtime marker missing: ${required}`);
}

fs.writeFileSync(appPath, app);
console.log('Applied 0.44 Grimoire Shell & Aesthetic Currents to src/App.jsx.');
