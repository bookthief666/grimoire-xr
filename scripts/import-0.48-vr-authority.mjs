import fs from 'node:fs';
import path from 'node:path';
import {
  renderAuthorityCardManifestModule,
  summarizeAuthorityParityCore,
  validateAuthorityParityCore,
} from '../src/tarotBridge/authorityArtifact.js';

const args = process.argv.slice(2);
const inputPath = args.find(arg => !arg.startsWith('--'));
const outIndex = args.indexOf('--out');
const outputPath = outIndex >= 0
  ? args[outIndex + 1]
  : 'src/tarotBridge/authoritativeCardManifest.generated.js';

if (!inputPath) {
  console.error('Usage: node scripts/import-0.48-vr-authority.mjs <vr-conformance.json> [--out <generated.js>]');
  process.exit(2);
}
if (!outputPath) {
  console.error('Missing value for --out');
  process.exit(2);
}

const parsed = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const errors = validateAuthorityParityCore(parsed);
if (errors.length) {
  errors.forEach(error => console.error(`FAIL ${error}`));
  process.exit(1);
}

const summary = summarizeAuthorityParityCore(parsed);
const rendered = renderAuthorityCardManifestModule(parsed);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, rendered, 'utf8');

console.log(`PASS exact pinned authority snapshot`);
console.log(`PASS authoritative cards ${summary.cards}`);
console.log(`PASS source fields ${summary.totalSourceFields}`);
console.log(`PASS fields carrying claim provenance ${summary.fieldsWithClaims}/${summary.totalSourceFields}`);
console.log(`0.48 authoritative card manifest written: ${outputPath}`);
