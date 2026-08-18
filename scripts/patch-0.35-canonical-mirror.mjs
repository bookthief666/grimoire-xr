import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridgePath = path.join(root, 'src', 'tarotBridge', 'canonicalTarotBridge.js');
let source = fs.readFileSync(bridgePath, 'utf8');

const replacements = [
  {
    label: 'Major familyId',
    before: "      familyId: 'major',",
    after: '      familyId: slug,',
  },
  {
    label: 'Minor familyId',
    before: '        familyId: `minor.${suit.familyId}`,',
    after: '        familyId: suit.familyId,',
  },
  {
    label: 'Minor rankClass',
    before: "        rankClass: rankIndex >= 10 ? 'court' : 'numbered',",
    after: "        rankClass: rankIndex < 10 ? 'pip' : 'court',",
  },
  {
    label: 'TRIAD spread descriptor',
    before: `  TRIAD: {\n    spreadId: 'grimoire.triad.dialectic',\n    version: '1.0.0',\n    semanticStatus: 'CANONICAL_PROJECT',\n    positions: [\n      { positionId: 'thesis', label: 'THESIS', questionFunction: 'the first articulated force or proposition in the question' },\n      { positionId: 'antithesis', label: 'ANTITHESIS', questionFunction: 'the force that resists, complicates, or qualifies the first' },\n      { positionId: 'synthesis', label: 'SYNTHESIS', questionFunction: 'what becomes visible when the first two are read in relation' },\n    ],\n  },`,
    after: `  TRIAD: {\n    spreadId: 'grimoire.triad.dialectic',\n    version: '1.0.0',\n    cardCount: 3,\n    semanticStatus: 'CANONICAL_PROJECT',\n    positions: [\n      { positionId: 'thesis', ordinal: 0, label: 'THESIS', questionFunction: 'the first articulated force or proposition in the question' },\n      { positionId: 'antithesis', ordinal: 1, label: 'ANTITHESIS', questionFunction: 'the force that resists, complicates, or qualifies the first' },\n      { positionId: 'synthesis', ordinal: 2, label: 'SYNTHESIS', questionFunction: 'what becomes visible when the first two are read in relation' },\n    ],\n    topology: {\n      orderedAdjacency: [['thesis', 'antithesis'], ['antithesis', 'synthesis']],\n      visualEdges: [['thesis', 'antithesis'], ['thesis', 'synthesis'], ['antithesis', 'synthesis']],\n    },\n  },`,
  },
  {
    label: 'HEXAGRAM spread descriptor',
    before: "  HEXAGRAM: { spreadId: 'legacy.hexagram.v031', version: '0.31.0', semanticStatus: 'PROVISIONAL', positions: [] },",
    after: `  HEXAGRAM: {\n    spreadId: 'legacy.hexagram.v031',\n    version: '0.31.0',\n    cardCount: 6,\n    semanticStatus: 'PROVISIONAL',\n    positions: Array.from({ length: 6 }, (_, index) => ({\n      positionId: \`p\${index + 1}\`, ordinal: index, label: \`POSITION \${index + 1}\`, questionFunction: null,\n    })),\n    topology: { orderedAdjacency: [], visualEdges: [] },\n  },`,
  },
  {
    label: 'CROSS spread descriptor',
    before: "  CROSS: { spreadId: 'legacy.cross.v031', version: '0.31.0', semanticStatus: 'PROVISIONAL', positions: [] },",
    after: `  CROSS: {\n    spreadId: 'legacy.cross.v031',\n    version: '0.31.0',\n    cardCount: 10,\n    semanticStatus: 'PROVISIONAL',\n    positions: Array.from({ length: 10 }, (_, index) => ({\n      positionId: \`p\${index + 1}\`, ordinal: index, label: \`POSITION \${index + 1}\`, questionFunction: null,\n    })),\n    topology: { orderedAdjacency: [], visualEdges: [] },\n  },`,
  },
  {
    label: 'bound selection client ownership',
    before: "    if (selected.every(Boolean)) return deepFreeze({ cards: selected, source: 'BOUND_TRIAD_CLOTH' });",
    after: "    if (selected.every(Boolean)) return Object.freeze({ cards: Object.freeze([...selected]), source: 'BOUND_TRIAD_CLOTH' });",
  },
  {
    label: 'fallback selection client ownership',
    before: "  return deepFreeze({ cards: pool.slice(0, 3), source: 'RANDOM_TRIAD_FALLBACK' });",
    after: "  return Object.freeze({ cards: Object.freeze(pool.slice(0, 3)), source: 'RANDOM_TRIAD_FALLBACK' });",
  },
];

let changed = false;
for (const { label, before, after } of replacements) {
  if (source.includes(after)) continue;
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`0.35 mirror normalization refused: ${label} marker drifted.`);
  if (source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`0.35 mirror normalization refused: ${label} marker is not unique.`);
  }
  source = `${source.slice(0, first)}${after}${source.slice(first + before.length)}`;
  changed = true;
}

const postconditions = [
  'familyId: slug,',
  'familyId: suit.familyId,',
  "rankClass: rankIndex < 10 ? 'pip' : 'court',",
  'cardCount: 3,',
  'cardCount: 6,',
  'cardCount: 10,',
  "orderedAdjacency: [['thesis', 'antithesis'], ['antithesis', 'synthesis']]",
  'positionId: `p${index + 1}`',
  "Object.freeze({ cards: Object.freeze([...selected]), source: 'BOUND_TRIAD_CLOTH' })",
  "Object.freeze({ cards: Object.freeze(pool.slice(0, 3)), source: 'RANDOM_TRIAD_FALLBACK' })",
];
for (const marker of postconditions) {
  if (!source.includes(marker)) throw new Error(`0.35 mirror normalization postcondition failed: ${marker}`);
}

if (changed) {
  fs.writeFileSync(bridgePath, source);
  console.log('Normalized canonical Tarot mirror identity/spread/ownership fields to the pinned 0.35 contract.');
} else {
  console.log('0.35 canonical Tarot mirror is already normalized.');
}
