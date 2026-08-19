import fs from 'node:fs';

const [leftPath, rightPath] = process.argv.slice(2);
if (!leftPath || !rightPath) {
  console.error('Usage: node scripts/compare-0.48-conformance-snapshots.mjs <fold.json> <vr.json>');
  process.exit(2);
}

const readCore = path => {
  const parsed = JSON.parse(fs.readFileSync(path, 'utf8'));
  return parsed.parityCore || parsed;
};

const left = readCore(leftPath);
const right = readCore(rightPath);
const differences = [];

const walk = (a, b, path = '$') => {
  if (differences.length >= 200) return;
  if (Object.is(a, b)) return;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      differences.push(`${path}: type mismatch`);
      return;
    }
    if (a.length !== b.length) differences.push(`${path}: array length ${a.length} != ${b.length}`);
    const length = Math.max(a.length, b.length);
    for (let index = 0; index < length; index += 1) walk(a[index], b[index], `${path}[${index}]`);
    return;
  }
  if ((a && typeof a === 'object') || (b && typeof b === 'object')) {
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
      differences.push(`${path}: type mismatch`);
      return;
    }
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    keys.forEach(key => {
      if (!(key in a)) differences.push(`${path}.${key}: missing on left`);
      else if (!(key in b)) differences.push(`${path}.${key}: missing on right`);
      else walk(a[key], b[key], `${path}.${key}`);
    });
    return;
  }
  differences.push(`${path}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
};

walk(left, right);

if (!differences.length) {
  console.log('0.48 cross-client parity core: PASS');
  process.exit(0);
}

console.error(`0.48 cross-client parity core: DRIFT (${differences.length}${differences.length >= 200 ? '+' : ''} differences)`);
differences.forEach(diff => console.error(`- ${diff}`));
process.exit(1);
