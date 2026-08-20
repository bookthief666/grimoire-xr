import fs from 'node:fs';
import { stringifyFoldConformanceSnapshot } from '../src/tarotBridge/conformanceSnapshot.js';

const args = process.argv.slice(2);
const coreOnly = args.includes('--core');
const outIndex = args.indexOf('--out');
const outPath = outIndex >= 0 ? args[outIndex + 1] : null;
if (outIndex >= 0 && !outPath) {
  console.error('Usage: emit-0.48-conformance-snapshot.mjs [--core] [--out <file>]');
  process.exit(2);
}

const text = `${stringifyFoldConformanceSnapshot({ coreOnly })}\n`;
if (outPath) {
  fs.writeFileSync(outPath, text, 'utf8');
  console.log(`0.48 Fold conformance snapshot written: ${outPath}`);
} else {
  process.stdout.write(text);
}
