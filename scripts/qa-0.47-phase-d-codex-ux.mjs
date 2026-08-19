import assert from 'node:assert/strict';
import { ART_STYLES } from '../src/grimoireCatalog.js';
import { filterCodexStyles, codexStyleSelectionSummary } from '../src/codex/codexStyleLibrary.js';
import { createSemanticConfig } from '../src/semantic/semanticConfig.js';

const pass = label => console.log(`PASS ${label}`);

assert.ok(Array.isArray(ART_STYLES));
assert.ok(ART_STYLES.length >= 40);
pass('style library receives the full existing visual catalog');

const blake = filterCodexStyles({ styles: ART_STYLES, query: 'William Blake' });
assert.ok(blake.some(style => /William Blake/i.test(style.name)));
pass('style search resolves exact artist-name queries');

const manuscript = filterCodexStyles({ styles: ART_STYLES, query: 'manuscript' });
assert.ok(manuscript.some(style => /manuscript/i.test(`${style.name} ${style.prompt || ''}`)));
pass('style search resolves descriptive prompt/name fragments');

const beforeIds = ART_STYLES.map(style => style.id);
filterCodexStyles({ styles: ART_STYLES, query: 'ritual' });
assert.deepEqual(ART_STYLES.map(style => style.id), beforeIds);
pass('style search is presentation-only and does not mutate catalog order or identity');

const selected = ART_STYLES[0];
const summary = codexStyleSelectionSummary({ selectedStyle: selected, total: ART_STYLES.length });
assert.equal(summary.id, selected.id);
assert.equal(summary.name, selected.name);
assert.equal(summary.total, ART_STYLES.length);
pass('collapsed style library preserves current selection independently of filtering');

const semantic = createSemanticConfig({
  tarotSystem: 'thoth',
  interpretiveLenses: ['bataille_eroticism', 'nietzsche_dionysian'],
  readingDepth: 'magus',
});
assert.equal(semantic.tarotSystem, 'thoth');
assert.equal(semantic.relationMethod, 'crowley_lxxviii_dignities');
assert.deepEqual(semantic.interpretiveLenses, ['bataille_eroticism', 'nietzsche_dionysian']);
pass('Codex UX slice leaves accepted semantic ontology unchanged');

console.log('0.47 Phase D Codex UX QA: PASS');
