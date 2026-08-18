import fs from 'node:fs';
import path from 'node:path';

const app = fs.readFileSync(path.join(process.cwd(), 'src/App.jsx'), 'utf8');
const css = fs.readFileSync(path.join(process.cwd(), 'src/aesthetic/aestheticShell.css'), 'utf8');

const requireText = (source, text, label) => {
  if (!source.includes(text)) throw new Error(`0.44 aesthetic gate failed: ${label}`);
};

requireText(app, "import AestheticField from './aesthetic/AestheticField.jsx';", 'AestheticField import missing');
requireText(app, "import AestheticCurrentControl from './aesthetic/AestheticCurrentControl.jsx';", 'AestheticCurrentControl import missing');
requireText(app, "data-aesthetic-current={aestheticCurrent}", 'root current binding missing');
requireText(app, "data-enchantment={enchantmentLevel}", 'root enchantment binding missing');
requireText(app, '<AestheticField current={aestheticCurrent}', 'magical field mount missing');
requireText(app, '<AestheticCurrentControl', 'Codex current control missing');
requireText(app, 'grimoire-topbar', 'topbar theme boundary missing');
requireText(app, 'grimoire-codex-drawer', 'Codex drawer theme boundary missing');
requireText(app, 'grimoire-shell-button', 'shell buttons not theme-bound');
requireText(app, 'persistAestheticPreferences({ current: aestheticCurrent, enchantment: enchantmentLevel })', 'visual preference persistence missing');
requireText(css, '[data-aesthetic-current="arcane-os"]', 'ARCANE OS CSS profile missing');
requireText(css, '[data-aesthetic-current="ritual-hybrid"]', 'RITUAL HYBRID CSS profile missing');
requireText(css, '[data-aesthetic-current="living-book"]', 'LIVING BOOK CSS profile missing');

console.log('0.44 aesthetic currents integration gate: PASS');
