import fs from 'node:fs';
import path from 'node:path';

const requiredFiles = [
  'src/reliquary/oracleRelicResolver.js',
  'src/reliquary/oracleRelicResolver.test.js',
  'scripts/qa-0.46-behavioral-regressions.mjs',
  'scripts/apply-0.46-oracle-relic-resolver.mjs',
  'scripts/verify-0.46-oracle-relic-resolver.mjs',
  'docs/0.46-BUG-BASH-CHECKLIST.md',
  'docs/ENGINEERING-GATE-POLICY.md',
];

const missing = requiredFiles.filter(relative => !fs.existsSync(path.join(process.cwd(), relative)));
if (missing.length) {
  throw new Error(`0.46 behavioral policy gate missing required files: ${missing.join(', ')}`);
}

const checklist = fs.readFileSync(path.join(process.cwd(), 'docs/0.46-BUG-BASH-CHECKLIST.md'), 'utf8');
for (const phrase of [
  'Tap Thesis card body',
  'RELIC HISTORY must increase monotonically',
  'Hard refresh: memory remains',
  'Failure criterion: a card only lifts/animates without mounting the Chamber.',
]) {
  if (!checklist.includes(phrase)) throw new Error(`0.46 bug-bash checklist lost required behavioral proof: ${phrase}`);
}

console.log('0.46 behavioral policy gate: PASS');
