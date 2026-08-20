import fs from 'node:fs';

const [foldPath, vrPath] = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
if (!foldPath || !vrPath) {
  console.error('Usage: node scripts/compare-0.48-d2-relation-space.mjs <fold.json> <vr.json> [--json-out <path>]');
  process.exit(2);
}

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const fold = read(foldPath);
const vr = read(vrPath);

const diffs = [];
const walk = (left, right, path = '$') => {
  if (Object.is(left, right)) return;
  const leftArray = Array.isArray(left);
  const rightArray = Array.isArray(right);
  if (leftArray || rightArray) {
    if (!leftArray || !rightArray) {
      diffs.push(`${path}: type ${leftArray ? 'array' : typeof left} != ${rightArray ? 'array' : typeof right}`);
      return;
    }
    if (left.length !== right.length) diffs.push(`${path}: array length ${left.length} != ${right.length}`);
    const length = Math.max(left.length, right.length);
    for (let i = 0; i < length; i += 1) walk(left[i], right[i], `${path}[${i}]`);
    return;
  }
  const leftObject = left && typeof left === 'object';
  const rightObject = right && typeof right === 'object';
  if (leftObject || rightObject) {
    if (!leftObject || !rightObject) {
      diffs.push(`${path}: type ${leftObject ? 'object' : typeof left} != ${rightObject ? 'object' : typeof right}`);
      return;
    }
    const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
    for (const key of keys) {
      if (!(key in left)) diffs.push(`${path}.${key}: missing on Fold relation snapshot`);
      else if (!(key in right)) diffs.push(`${path}.${key}: missing on VR relation snapshot`);
      else walk(left[key], right[key], `${path}.${key}`);
    }
    return;
  }
  diffs.push(`${path}: ${JSON.stringify(left)} != ${JSON.stringify(right)}`);
};

const expectedSchema = 'grimoire.tarot.relation-conformance.d2';
for (const [name, snapshot] of [['Fold', fold], ['VR', vr]]) {
  if (snapshot.schemaId !== expectedSchema || snapshot.schemaVersion !== '1.0.0') {
    console.error(`${name} D2 snapshot schema mismatch`);
    process.exit(2);
  }
  if (snapshot.contract?.authorityCommit !== 'f4534b4f92d88f3950ec0c9c211bfa4648cd08ea') {
    console.error(`${name} D2 snapshot authority pin mismatch`);
    process.exit(2);
  }
  if (snapshot.relationCore?.pairCases?.length !== 50 || snapshot.relationCore?.triadCases?.length !== 125) {
    console.error(`${name} D2 snapshot has incomplete relation-space coverage`);
    process.exit(2);
  }
}

walk(fold.contract, vr.contract, '$.contract');
walk(fold.relationCore, vr.relationCore, '$.relationCore');

const categories = new Map();
const categoryOf = diff => {
  if (diff.includes('.pairCases')) return 'PAIR_CONTEXT';
  if (diff.includes('.triadCases')) {
    if (diff.includes('.provenance')) return 'TRIAD_PROVENANCE';
    if (diff.includes('.centerContext')) return 'CENTER_CONTEXT';
    if (diff.includes('.outerContext')) return 'OUTER_CONTEXT';
    return 'TRIAD_RELATIONS';
  }
  if (diff.includes('contract')) return 'CONTRACT';
  return 'OTHER';
};
for (const diff of diffs) {
  const category = categoryOf(diff);
  if (!categories.has(category)) categories.set(category, []);
  categories.get(category).push(diff);
}

const report = {
  schemaId: 'grimoire.tarot.relation-conformance.d2.report',
  schemaVersion: '1.0.0',
  totalDifferences: diffs.length,
  counts: Object.fromEntries([...categories.entries()].map(([category, entries]) => [category, entries.length])),
  examples: Object.fromEntries([...categories.entries()].map(([category, entries]) => [category, entries.slice(0, 20)])),
};

const jsonOutIndex = process.argv.indexOf('--json-out');
const jsonOutPath = jsonOutIndex >= 0 ? process.argv[jsonOutIndex + 1] : null;
if (jsonOutIndex >= 0 && !jsonOutPath) {
  console.error('--json-out requires a file path');
  process.exit(2);
}
if (jsonOutPath) fs.writeFileSync(jsonOutPath, `${JSON.stringify(report, null, 2)}\n`);

if (diffs.length) {
  console.error(`0.48 D2 exhaustive relation parity: DRIFT (${diffs.length} differences)`);
  for (const [category, entries] of categories.entries()) {
    console.error(`\n[${category}] ${entries.length}`);
    entries.slice(0, 12).forEach(entry => console.error(`- ${entry}`));
    if (entries.length > 12) console.error(`- ... ${entries.length - 12} more in ${category}`);
  }
  if (jsonOutPath) console.error(`0.48 D2 drift report written: ${jsonOutPath}`);
  process.exit(1);
}

console.log('0.48 D2 exhaustive relation parity: PASS');
console.log('PASS 50 pair/context cases');
console.log('PASS 125 representative three-card family combinations');
console.log('PASS relation types, reason codes, source IDs, claim IDs and rule versions');
console.log('PASS outer-pair and center-between-contraries context');
console.log('PASS ReadingRecord relation provenance');
if (jsonOutPath) console.log(`0.48 D2 parity report written: ${jsonOutPath}`);
