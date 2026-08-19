import { stringifyFoldConformanceSnapshot } from '../src/tarotBridge/conformanceSnapshot.js';

const coreOnly = process.argv.includes('--core');
process.stdout.write(`${stringifyFoldConformanceSnapshot({ coreOnly })}\n`);
