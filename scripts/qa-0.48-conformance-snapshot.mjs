import {
  buildFoldConformanceParityCore,
  countFoldSourceClaimCoverage,
  stringifyFoldConformanceSnapshot,
  validateFoldConformanceSnapshot,
} from '../src/tarotBridge/conformanceSnapshot.js';

const errors = validateFoldConformanceSnapshot();
const core = buildFoldConformanceParityCore();
const claimCoverage = countFoldSourceClaimCoverage();

console.log(`PASS snapshot contract ${core.contract.contractId}@${core.contract.contractVersion}`);
console.log(`PASS authoritative contract pin ${core.contract.authorityCommit}`);
console.log(`PASS canonical cards ${core.cards.length}`);
console.log(`PASS relation methods ${core.relationMethodIds.join(', ')}`);
console.log(`PASS fixtures ${Object.keys(core.fixtures).join(', ')}`);
console.log(`INFO Fold source fields with claim IDs ${claimCoverage.fieldsWithClaims}/${claimCoverage.totalFields}`);

if (errors.length) {
  errors.forEach(error => console.error(`FAIL ${error}`));
  process.exit(1);
}

if (process.argv.includes('--json')) {
  console.log(stringifyFoldConformanceSnapshot({ coreOnly: process.argv.includes('--core') }));
}

console.log('0.48 Fold conformance snapshot QA: PASS');
