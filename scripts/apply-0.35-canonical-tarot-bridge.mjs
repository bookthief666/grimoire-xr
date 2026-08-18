import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPath = path.join(root, 'src', 'App.jsx');
const original = fs.readFileSync(appPath, 'utf8');

const IMPORT_SENTINEL = "from './tarotBridge/oracleSynthesis.js';";
const OLD_ORACLE_SENTINEL = "const drawn = [...state.deck].sort(() => 0.5 - Math.random()).slice(0, 3);";
const NEW_ORACLE_SENTINEL = 'prepareCanonicalOracleConsultation({';

if (original.includes(IMPORT_SENTINEL) && original.includes(NEW_ORACLE_SENTINEL) && !original.includes(OLD_ORACLE_SENTINEL)) {
  console.log('0.35 canonical Tarot App bridge is already applied.');
  process.exit(0);
}

const requireMarker = (source, marker, label) => {
  if (!source.includes(marker)) {
    throw new Error(`0.35 migration refused: missing ${label} marker. App.jsx is not the reviewed parent shape.`);
  }
};

requireMarker(original, "import { TAROT_PROMPT_SCHEMA, compileTarotImagePrompt } from './tarotPrompt.js';", 'tarotPrompt import');
requireMarker(original, "deck: action.payload.cards.map((name, i) => ({ id: i, name, imageUrl: null, exegesis: null, meta: null, promptUsed: null, patina: 0 })),", 'RITUAL_SUCCESS deck constructor');
requireMarker(original, OLD_ORACLE_SENTINEL, 'legacy random Oracle draw');
requireMarker(original, 'const compiledPrompt = compileTarotImagePrompt({', 'image prompt compiler call');
requireMarker(original, 'const handleOracleConsultation = useCallback(async () => {', 'Oracle handler start');
requireMarker(original, '  const handleSpiritMessage = useCallback(async (overrideText = null) => {', 'Oracle handler end boundary');

let source = original;

const replaceOnce = (label, before, after) => {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`0.35 migration refused: ${label} target not found.`);
  if (source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`0.35 migration refused: ${label} target is not unique.`);
  }
  source = `${source.slice(0, first)}${after}${source.slice(first + before.length)}`;
};

replaceOnce(
  'imports',
  "import { TAROT_PROMPT_SCHEMA, compileTarotImagePrompt } from './tarotPrompt.js';",
  `import { TAROT_PROMPT_SCHEMA, compileTarotImagePrompt } from './tarotPrompt.js';\nimport {\n  canonicalCardIdFromLegacyIndex,\n  getCanonicalCardPromptContext,\n} from './tarotBridge/canonicalTarotBridge.js';\nimport {\n  buildCanonicalOracleSynthesisPrompt,\n  prepareCanonicalOracleConsultation,\n} from './tarotBridge/oracleSynthesis.js';`,
);

replaceOnce(
  'canonical deck identity',
  "deck: action.payload.cards.map((name, i) => ({ id: i, name, imageUrl: null, exegesis: null, meta: null, promptUsed: null, patina: 0 })),",
  `deck: action.payload.cards.map((name, i) => ({\n          id: i,\n          canonicalCardId: canonicalCardIdFromLegacyIndex(i),\n          name,\n          imageUrl: null,\n          exegesis: null,\n          meta: null,\n          interpretiveMetaAuthority: null,\n          promptUsed: null,\n          patina: 0,\n        })),`,
);

replaceOnce(
  'ritual epistemic label',
  "Source: 'Secrets of the Thoth Tarot' (Katz). Style:",
  "Creative frame: generated manifestation names are presentation labels bound by position to the canonical 0..77 Tarot identity map; do not present generated names or correspondences as historical source facts. Style:",
);

const generateStart = source.indexOf('  const generateCardData = async (card, setStatusCb = null, imageOptions = {}) => {');
const generateEnd = source.indexOf('\n  const handleForgeCard = useCallback(async (card) => {', generateStart);
if (generateStart < 0 || generateEnd < 0 || generateEnd <= generateStart) {
  throw new Error('0.35 migration refused: generateCardData boundaries were not found.');
}
const oldGenerate = source.slice(generateStart, generateEnd);
const expectedGenerateMarkers = [
  'const techContext = TECH_LEVELS[state.techLevel].instruction;',
  'data = await fetchGemini(`Role: Grand Master of ${state.selectedTradition.name}. Task: Card interpretation for "${card.name}" linked to "${state.author}".',
  'meta: data.meta,',
  'return {\n      ...card,\n      ...data,',
];
for (const marker of expectedGenerateMarkers) {
  if (!oldGenerate.includes(marker)) throw new Error(`0.35 migration refused: generateCardData marker drifted: ${marker.slice(0, 72)}`);
}

let newGenerate = oldGenerate;
newGenerate = newGenerate.replace(
  '    const techContext = TECH_LEVELS[state.techLevel].instruction;\n',
  `    const techContext = TECH_LEVELS[state.techLevel].instruction;\n    const canonicalContext = getCanonicalCardPromptContext({\n      card,\n      tradition: state.selectedTradition,\n    });\n    const canonicalFacts = canonicalContext?.sourceQualification === 'SOURCE_QUALIFIED'\n      ? JSON.stringify({\n          cardId: canonicalContext.cardId,\n          expression: canonicalContext.canonicalExpression,\n          correspondences: canonicalContext.canonicalCorrespondences,\n        })\n      : 'No source-qualified canonical fact pack is active for this selected Tarot system.';\n`,
);
newGenerate = newGenerate.replace(
  ' - TONE: ${techContext} ${erosContext} Return JSON:',
  ' - CANONICAL SOURCE CONTEXT: ${canonicalFacts}. Preserve these facts exactly. The requested Meta fields are generated interpretive reflection only; do not present them as historical source facts. - TONE: ${techContext} ${erosContext} Return JSON:',
);
newGenerate = newGenerate.replace(
  '      meta: data.meta,\n    });',
  '      meta: data.meta,\n      canonicalContext,\n    });',
);
newGenerate = newGenerate.replace(
  '    return {\n      ...card,\n      ...data,',
  `    return {\n      ...card,\n      ...data,\n      canonicalCardId: canonicalContext?.cardId || card.canonicalCardId || null,\n      interpretiveMetaAuthority: 'MODEL_GENERATED_REFLECTION',`,
);
source = `${source.slice(0, generateStart)}${newGenerate}${source.slice(generateEnd)}`;

const oracleStart = source.indexOf('  const handleOracleConsultation = useCallback(async () => {');
const oracleEnd = source.indexOf('\n  const handleSpiritMessage = useCallback(async (overrideText = null) => {', oracleStart);
if (oracleStart < 0 || oracleEnd < 0 || oracleEnd <= oracleStart) {
  throw new Error('0.35 migration refused: Oracle handler boundaries were not found.');
}
const oldOracle = source.slice(oracleStart, oracleEnd);
if (!oldOracle.includes(OLD_ORACLE_SENTINEL)) throw new Error('0.35 migration refused: legacy Oracle random-draw marker drifted.');
if (!oldOracle.includes('Task: Synthesize a 300-word divinatory answer using Elemental Dignities')) {
  throw new Error('0.35 migration refused: legacy Oracle synthesis marker drifted.');
}

const newOracle = `  const handleOracleConsultation = useCallback(async () => {\n    if (!state.oracleQuestion) return;\n    dispatch({ type: 'CONSULT_ORACLE_START' });\n\n    const erosContext = getErosContext(state.erosLevel);\n    const techContext = TECH_LEVELS[state.techLevel].instruction;\n    let prepared;\n    try {\n      prepared = prepareCanonicalOracleConsultation({\n        deck: state.deck,\n        activeSpread: state.activeSpread,\n        spreadSlots: state.spreadSlots,\n        question: state.oracleQuestion,\n        tradition: state.selectedTradition,\n        author: state.author,\n        readingDepth: 'adept',\n        techContext,\n        erosContext,\n      });\n    } catch (e) {\n      dispatch({ type: 'CONSULT_ORACLE_FAILURE' });\n      dispatch({ type: 'SET_ERROR_MESSAGE', payload: \`Oracle Canonicalization Failed: \${e.message}\` });\n      return;\n    }\n\n    const drawn = prepared.cards;\n    const updatedCards = await Promise.all(drawn.map(async (c) => {\n      if (!c.exegesis || !c.imageUrl) {\n        try { return await generateCardData(c); } catch (e) { return c; }\n      }\n      return c;\n    }));\n    const newDeck = state.deck.map(deckCard => {\n      const newlyForged = updatedCards.find(u => u.id === deckCard.id);\n      return newlyForged || deckCard;\n    });\n\n    try {\n      const canonicalPrompt = buildCanonicalOracleSynthesisPrompt({\n        author: state.author,\n        traditionName: state.selectedTradition.name,\n        techContext,\n        erosContext,\n        record: prepared.record,\n        cards: updatedCards,\n      });\n      const res = await fetchGemini(canonicalPrompt);\n      oracleBuzz();\n      dispatch({\n        type: 'CONSULT_ORACLE_SUCCESS',\n        payload: {\n          cards: updatedCards,\n          answer: res.answer,\n          updatedDeck: newDeck,\n          readingRecord: prepared.record,\n          selectionSource: prepared.selectionSource,\n        },\n      });\n    } catch (e) {\n      dispatch({ type: 'CONSULT_ORACLE_FAILURE' });\n      dispatch({ type: 'SET_STATUS', payload: 'ORACLE SILENT' });\n      dispatch({ type: 'SET_ERROR_MESSAGE', payload: \`Oracle Disconnected: \${e.message || 'Connection lost'}\` });\n    }\n  }, [\n    state.oracleQuestion,\n    state.deck,\n    state.author,\n    state.selectedTradition,\n    state.erosLevel,\n    state.techLevel,\n    state.activeSpread,\n    state.spreadSlots,\n  ]);\n`;
source = `${source.slice(0, oracleStart)}${newOracle}${source.slice(oracleEnd)}`;

if (source === original) throw new Error('0.35 migration produced no change.');
if (source.includes(OLD_ORACLE_SENTINEL)) throw new Error('0.35 migration failed to remove the legacy random Oracle draw.');
for (const marker of [IMPORT_SENTINEL, NEW_ORACLE_SENTINEL, 'canonicalCardIdFromLegacyIndex(i)', 'canonicalContext,', 'readingRecord: prepared.record']) {
  if (!source.includes(marker)) throw new Error(`0.35 migration postcondition failed: ${marker}`);
}

fs.writeFileSync(appPath, source);
console.log('Applied 0.35 canonical Tarot bridge to src/App.jsx.');
console.log('Next: npm run check');
