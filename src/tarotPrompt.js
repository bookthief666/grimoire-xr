export const TAROT_PROMPT_SCHEMA = 'tarot-structured-v1';

const clean = value => {
  if (value === null || value === undefined) return '';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return text.replace(/\s+/g, ' ').trim();
};

const correspondenceLine = meta => {
  if (!meta || typeof meta !== 'object') return '';
  const entries = [
    ['Hebrew letter', meta.hebrew],
    ['Astrological ruler', meta.planet],
    ['Alchemical stage', meta.alchemical],
    ['Grimoire spirit', meta.daimon],
  ]
    .map(([label, value]) => [label, clean(value)])
    .filter(([, value]) => value);

  return entries.length
    ? entries.map(([label, value]) => `${label}: ${value}`).join('; ')
    : '';
};

const canonicalFieldEntries = fields => Object.entries(fields || {})
  .map(([key, field]) => [key, clean(field?.value)])
  .filter(([, value]) => value);

const canonicalContextLines = context => {
  if (!context || context.sourceQualification !== 'SOURCE_QUALIFIED') return [];
  const expression = canonicalFieldEntries(context.canonicalExpression);
  const correspondences = canonicalFieldEntries(context.canonicalCorrespondences);
  return [
    `CANONICAL CARD ID: ${clean(context.cardId)}.`,
    expression.length
      ? `CANONICAL THOTH EXPRESSION: ${expression.map(([key, value]) => `${key}=${value}`).join('; ')}.`
      : '',
    correspondences.length
      ? `REVIEWED CANONICAL CORRESPONDENCES: ${correspondences.map(([key, value]) => `${key}=${value}`).join('; ')}.`
      : '',
    'CANONICALITY RULE: preserve these source-qualified facts. Generated interpretive notes may elaborate imagery but may not replace or contradict them.',
  ].filter(Boolean);
};

export const compileTarotImagePrompt = ({
  cardName,
  invocationSubject,
  traditionName,
  styleName,
  stylePrompt,
  visual,
  erosPrompt,
  meta,
  canonicalContext = null,
} = {}) => {
  const subject = clean(cardName);
  if (!subject) throw new Error('A card name is required to compile an image prompt.');

  const correspondences = correspondenceLine(meta);
  const sections = [
    `SUBJECT: Tarot card \"${subject}\".`,
    ...canonicalContextLines(canonicalContext),
    clean(invocationSubject) ? `INVOCATION SUBJECT: ${clean(invocationSubject)}. Let this current inform the scene without replacing the card's canonical identity.` : '',
    clean(traditionName) ? `TAROT SYSTEM: ${clean(traditionName)}. Preserve recognizable symbolic logic from this lineage without adding readable text.` : '',
    clean(visual) ? `COMPOSITION AND ICONOGRAPHY: ${clean(visual)}.` : '',
    correspondences ? `GENERATED INTERPRETIVE NOTES (NON-CANONICAL): ${correspondences}.` : '',
    clean(stylePrompt) ? `ART DIRECTION: ${clean(stylePrompt)}.` : '',
    clean(styleName) ? `AESTHETIC REGISTER: ${clean(styleName)}.` : '',
    clean(erosPrompt) ? `EROS REGISTER: ${clean(erosPrompt)}.` : '',
    'FRAMING: premium vertical tarot-card illustration, strong central hierarchy, deliberate foreground/midground/background separation, clear focal subject, balanced negative space, edge-safe composition for a 2:3 card crop.',
    'LIGHTING: cinematic but legible, controlled contrast, coherent practical or ritual light sources, preserve important symbols from being swallowed by shadow.',
    'SURFACE AND DETAIL: materially convincing textures, intentional line and shape language, high visual coherence, refined anatomy and hands when figures appear.',
    'CONSTRAINTS: no captions, no typography, no logos, no watermarks, no UI, no duplicate figures, no accidental extra limbs, no random occult glyph clutter, no decorative symbols that contradict the requested correspondences.',
  ].filter(Boolean);

  return sections.join('\n');
};
