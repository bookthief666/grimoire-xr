import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPath = path.join(root, 'src', 'App.jsx');
let app = fs.readFileSync(appPath, 'utf8');

const landingMarker = 'RESTORE ARCHIVE FROM JSON';
const pickerMarker = 'document.body.appendChild(picker);';
if (app.includes(landingMarker) && app.includes(pickerMarker)) {
  console.log('0.36 restore entry hardening already applied.');
  process.exit(0);
}

const oldPicker = `  const handleRestoreJsonArchive = () => {
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = 'application/json,.json';
    picker.onchange = async () => {
      const file = picker.files?.[0];
      if (!file) return;
      try {
        const parsed = parseGrimoireArchive(await file.text());
        const restored = buildArchiveRestoreState({
          envelope: parsed.envelope,
          styles: ART_STYLES,
          traditions: TRADITIONS,
        });
        dispatch({ type: 'RESTORE_ARCHIVE', payload: restored });
        if (parsed.contractStatus !== 'CURRENT_CONTRACT_MATCH') {
          dispatch({
            type: 'SET_ERROR_MESSAGE',
            payload: parsed.migratedLegacy
              ? 'Legacy archive restored. Canonical semantic provenance was not present in that archive.'
              : 'Archive restored from a different canonical semantic contract. Historical ReadingRecord preserved without being reclassified as current.',
          });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR_MESSAGE', payload: \`Archive Restore Failed: \${error.message || 'Invalid JSON archive.'}\` });
      }
    };
    picker.click();
  };`;

const newPicker = `  const handleRestoreJsonArchive = () => {
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = 'application/json,.json';
    picker.style.display = 'none';
    const cleanup = () => picker.remove();
    picker.addEventListener('cancel', cleanup, { once: true });
    picker.onchange = async () => {
      const file = picker.files?.[0];
      if (!file) {
        cleanup();
        return;
      }
      try {
        const parsed = parseGrimoireArchive(await file.text());
        const restored = buildArchiveRestoreState({
          envelope: parsed.envelope,
          styles: ART_STYLES,
          traditions: TRADITIONS,
        });
        dispatch({ type: 'RESTORE_ARCHIVE', payload: restored });
        if (parsed.contractStatus !== 'CURRENT_CONTRACT_MATCH') {
          dispatch({
            type: 'SET_ERROR_MESSAGE',
            payload: parsed.migratedLegacy
              ? 'Legacy archive restored. Canonical semantic provenance was not present in that archive.'
              : 'Archive restored from a different canonical semantic contract. Historical ReadingRecord preserved without being reclassified as current.',
          });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR_MESSAGE', payload: \`Archive Restore Failed: \${error.message || 'Invalid JSON archive.'}\` });
      } finally {
        cleanup();
      }
    };
    document.body.appendChild(picker);
    picker.click();
  };`;

const oldLanding = `              <button onClick={handleRitualInitiation} className="w-full py-4 bg-red-600 text-black font-header text-sm hover:bg-white transition-colors shadow-[0_0_15px_#ff0000]">INITIATE RITUAL</button>
              {!Capacitor.isNativePlatform() && (`;

const newLanding = `              <button onClick={handleRitualInitiation} className="w-full py-4 bg-red-600 text-black font-header text-sm hover:bg-white transition-colors shadow-[0_0_15px_#ff0000]">INITIATE RITUAL</button>
              <button onClick={handleRestoreJsonArchive} className="w-full mt-3 py-3 border border-red-600/70 text-red-500 font-header text-[10px] hover:bg-red-600 hover:text-black transition-colors">
                RESTORE ARCHIVE FROM JSON
              </button>
              {!Capacitor.isNativePlatform() && (`;

if (!app.includes(oldPicker)) throw new Error('0.36 restore hardening refused: picker parent shape changed.');
if (!app.includes(oldLanding)) throw new Error('0.36 restore hardening refused: landing parent shape changed.');

app = app.replace(oldPicker, newPicker).replace(oldLanding, newLanding);
fs.writeFileSync(appPath, app);
console.log('Applied 0.36 cold-start archive restore hardening to src/App.jsx.');
