const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();

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

export const compileTarotImagePrompt = ({
  cardName,
  traditionName,
  styleName,
  stylePrompt,
  visual,
  erosPrompt,
  meta,
} = {}) => {
  const subject = clean(cardName);
  if (!subject) throw new Error('A card name is required to compile an image prompt.');

  const sections = [
    `SUBJECT: Tarot card \"${subject}\".`,
    clean(traditionName) ? `TAROT SYSTEM: ${clean(traditionName)}. Preserve recognizable symbolic logic from this lineage without adding readable text.` : '',
    clean(visual) ? `COMPOSITION AND ICONOGRAPHY: ${clean(visual)}.` : '',
    correspondenceLine(meta) ? `CORRESPONDENCES: ${correspondenceLine(meta)}.` : '',
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
