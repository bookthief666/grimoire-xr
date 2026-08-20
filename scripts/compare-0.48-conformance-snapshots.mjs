import fs from 'node:fs';

const args = process.argv.slice(2);
const positional = [];
let jsonOut = null;
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === '--json-out') {
    jsonOut = args[index + 1];
    index += 1;
  } else {
    positional.push(args[index]);
  }
}

const [leftPath, rightPath] = positional;
if (!leftPath || !rightPath) {
  console.error('Usage: node scripts/compare-0.48-conformance-snapshots.mjs <fold.json> <vr.json> [--json-out <report.json>]');
  process.exit(2);
}

const readCore = path => {
  const parsed = JSON.parse(fs.readFileSync(path, 'utf8'));
  return parsed.parityCore || parsed;
};

const left = readCore(leftPath);
const right = readCore(rightPath);
const differences = [];

const classify = path => {
  if (path.includes('.claimIds')) return 'CLAIM_PROVENANCE';
  if (path.startsWith('$.fixtures') && path.includes('.provenance')) return 'FIXTURE_PROVENANCE';
  if (path.startsWith('$.fixtures') && (path.includes('.relations') || path.includes('.spreadPatterns'))) return 'RELATION_SEMANTICS';
  if (path.startsWith('$.fixtures')) return 'FIXTURE_SEMANTICS';
  if (path.startsWith('$.cards')) return 'CARD_SEMANTICS';
  if (path.startsWith('$.spreads')) return 'SPREAD_SEMANTICS';
  if (path.startsWith('$.relationMethods')) return 'RELATION_METHOD_VOCABULARY';
  if (path.startsWith('$.contract')) return 'CONTRACT_METADATA';
  return 'GENERAL';
};

const addDifference = (path, detail) => differences.push({
  category: classify(path),
  path,
  detail,
});

const walk = (a, b, path = '$') => {
  if (Object.is(a, b)) return;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      addDifference(path, 'type mismatch');
      return;
    }
    if (a.length !== b.length) addDifference(path, `array length ${a.length} != ${b.length}`);
    const length = Math.max(a.length, b.length);
    for (let index = 0; index < length; index += 1) walk(a[index], b[index], `${path}[${index}]`);
    return;
  }
  if ((a && typeof a === 'object') || (b && typeof b === 'object')) {
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
      addDifference(path, 'type mismatch');
      return;
    }
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    keys.forEach(key => {
      if (!(key in a)) addDifference(`${path}.${key}`, 'missing on Fold snapshot');
      else if (!(key in b)) addDifference(`${path}.${key}`, 'missing on VR snapshot');
      else walk(a[key], b[key], `${path}.${key}`);
    });
    return;
  }
  addDifference(path, `${JSON.stringify(a)} != ${JSON.stringify(b)}`);
};

walk(left, right);

const byCategory = differences.reduce((map, difference) => {
  const bucket = map.get(difference.category) || [];
  bucket.push(difference);
  map.set(difference.category, bucket);
  return map;
}, new Map());

const report = {
  schemaId: 'grimoire.tarot.conformance-drift-report',
  schemaVersion: 1,
  foldSnapshot: leftPath,
  vrSnapshot: rightPath,
  parity: differences.length === 0,
  differenceCount: differences.length,
  categories: Object.fromEntries(
    [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => [category, {
      count: items.length,
      examples: items.slice(0, 12),
    }]),
  ),
};

if (jsonOut) fs.writeFileSync(jsonOut, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (!differences.length) {
  console.log('0.48 cross-client parity core: PASS');
  if (jsonOut) console.log(`0.48 drift report written: ${jsonOut}`);
  process.exit(0);
}

console.error(`0.48 cross-client parity core: DRIFT (${differences.length} differences)`);
for (const [category, items] of [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  console.error(`\n[${category}] ${items.length}`);
  items.slice(0, 12).forEach(({ path, detail }) => console.error(`- ${path}: ${detail}`));
  if (items.length > 12) console.error(`- ... ${items.length - 12} more in ${category}`);
}
if (jsonOut) console.error(`\n0.48 drift report written: ${jsonOut}`);
process.exit(1);
