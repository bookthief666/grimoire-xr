import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const app = read('src/App.jsx');
const main = read('src/main.jsx');
const store = read('src/persistence/grimoireStore.js');

const assert = (condition, message) => {
  if (!condition) throw new Error(`0.40.1 continuity activation failed: ${message}`);
};

assert(store.includes("GRIMOIRE_SESSION_SCHEMA_ID = 'grimoire.xr.session'"), 'versioned session schema is missing');
assert(store.includes("GRIMOIRE_IMAGE_REFERENCE_PREFIX = 'grimoire-image://'"), 'lightweight image-reference contract is missing');
assert(store.includes('RESTORED_WITH_MISSING_IMAGES'), 'missing artwork no longer fails soft');
assert(store.includes('shouldPersistGrimoireSession'), 'stable-checkpoint policy is missing');

assert(app.includes("from './persistence/grimoireStore.js'"), 'App is not connected to the continuity store');
assert(app.includes('restoreGrimoireSession()'), 'startup restore is not mounted');
assert(app.includes('persistGrimoireSession({ state })'), 'autosave is not mounted');
assert(app.includes('shouldPersistGrimoireSession(state)'), 'expensive-work checkpoint guard is not mounted');
assert(app.includes('onClick={handleReturnToLanding}'), 'logo does not use the safe landing action');
assert(!app.includes("onClick={() => dispatch({ type: 'RETURN_TO_LANDING' })}"), 'destructive one-click reset remains');
assert(app.includes('AUTOSAVE FAILED · EXPORT A JSON ARCHIVE BEFORE LEAVING THIS SESSION'), 'storage failure is not user-visible');

assert(main.includes("import ErrorBoundary from './ErrorBoundary.jsx';"), 'root crash boundary import is missing');
assert(main.includes('<ErrorBoundary>') && main.includes('</ErrorBoundary>'), 'root crash boundary is not mounted');

console.log('0.40.1 continuity foundation activation gate: PASS');
