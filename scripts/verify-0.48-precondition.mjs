import { execFileSync } from 'node:child_process';

const EXPECTED_BRANCH = 'agent/0.47-semantic-ontology-integrity';
const EXPECTED_VR_CONTRACT = 'f4534b4f92d88f3950ec0c9c211bfa4648cd08ea';

const git = args => execFileSync('git', args, { encoding: 'utf8' }).trim();
const branch = git(['branch', '--show-current']);
const status = git(['status', '--short']);
const head = git(['rev-parse', 'HEAD']);

if (branch !== EXPECTED_BRANCH) throw new Error(`0.48 precondition requires ${EXPECTED_BRANCH}, got ${branch}`);
if (status && status !== '?? .vercel/') throw new Error(`0.48 precondition requires a clean tracked worktree; status was:\n${status}`);
if (!head) throw new Error('0.48 precondition could not resolve the frozen 0.47 head.');

console.log(`PASS frozen 0.47 candidate head is available: ${head}`);
console.log(`PASS authoritative VR semantic contract remains pinned: ${EXPECTED_VR_CONTRACT}`);
console.log('PASS 0.48 may be cut only from this pushed 0.47 head; this script does not create the branch.');
