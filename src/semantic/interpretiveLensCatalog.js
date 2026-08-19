export const INTERPRETIVE_LENS_AUTHORITY = 'PROJECT_AUTHORED_INTERPRETIVE_LENS_NOT_TAROT_FACT';

const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};

const lens = ({ id, label, shortLabel, family, description, directive }) => freeze({
  id,
  label,
  shortLabel,
  family,
  description,
  directive,
  authority: INTERPRETIVE_LENS_AUTHORITY,
});

export const INTERPRETIVE_LENS_CATALOG = freeze([
  lens({
    id: 'hermetic_qabalah',
    label: 'Hermetic Qabalah',
    shortLabel: 'QABALAH',
    family: 'occult-philosophical',
    description: 'Reads symbolic structure through emanation, polarity, correspondence and initiatory pattern without inventing unprovided card attributions.',
    directive: 'Use Hermetic-Qabalistic structure as an interpretive metaphor. Do not assign Sephiroth, Paths, Hebrew letters, planets or other correspondences unless the canonical record already supplies them.',
  }),
  lens({
    id: 'jungian_shadow',
    label: 'Jungian Shadow & Individuation',
    shortLabel: 'JUNG',
    family: 'depth-psychological',
    description: 'Emphasizes archetypal conflict, shadow integration, compensation and individuation while avoiding diagnosis.',
    directive: 'Read through archetype, shadow, projection, compensation and individuation. Treat these as psychological interpretation, never as clinical diagnosis or canonical Tarot fact.',
  }),
  lens({
    id: 'enochian',
    label: 'Enochian Visionary',
    shortLabel: 'ENOCHIAN',
    family: 'visionary-magical',
    description: 'Frames the reading as visionary hierarchy, angelic address and charged symbolic language without manufacturing Enochian correspondences.',
    directive: 'Use visionary, angelic and linguistic imagery as project-authored framing only. Never invent Enochian tables, names, calls or card correspondences that are absent from the supplied record.',
  }),
  lens({
    id: 'chaos_magick',
    label: 'Chaos Magick',
    shortLabel: 'CHAOS',
    family: 'operative-magical',
    description: 'Treats belief, symbol and identity as provisional magical instruments oriented toward experimentation and result.',
    directive: 'Emphasize belief-as-tool, reframing, sigil-like condensation and pragmatic experimentation. Keep all Tarot identity and relation truth subordinate to the canonical record.',
  }),
  lens({
    id: 'bertiaux_nightside',
    label: 'Nightside / Bertiaux',
    shortLabel: 'NIGHTSIDE',
    family: 'liminal-occult',
    description: 'Emphasizes liminality, shadow-worlds, dream logic and esoteric otherness without asserting historical correspondences.',
    directive: 'Use nightside, liminal and dreamlike imagery as interpretive atmosphere. Do not promote project-authored occult associations into historical or canonical Tarot facts.',
  }),
  lens({
    id: 'alchemical',
    label: 'Alchemical Transformation',
    shortLabel: 'ALCHEMY',
    family: 'transformative-symbolic',
    description: 'Reads the spread as processes of dissolution, conjunction, fixation, death and renewal.',
    directive: 'Use alchemical operations such as solve/coagula, nigredo, albedo and rubedo as interpretive metaphors unless an operation is explicitly present in canonical source data.',
  }),
  lens({
    id: 'bruno_mnemonic',
    label: 'Giordano Bruno — Mnemonic Eros',
    shortLabel: 'BRUNO',
    family: 'mnemonic-magical',
    description: 'Reads images as charged mnemonic bonds, imaginative operators and arrangements of memory.',
    directive: 'Interpret images through memory, imaginative bonds, ordering and mnemonic transformation. Do not claim Bruno supplied Tarot correspondences unless such a source is explicitly present.',
  }),
  lens({
    id: 'astarte_venus_devotional',
    label: 'Astarte / Venus Devotional',
    shortLabel: 'ASTARTE',
    family: 'devotional-erotic',
    description: 'Emphasizes attraction, offering, beauty, reciprocity and devotional Eros as ritual framing.',
    directive: 'Use Venusian and devotional language around attraction, offering, reciprocity and beauty as project-authored ritual framing. Do not manufacture planetary card authority.',
  }),
  lens({
    id: 'bataille_eroticism',
    label: 'Georges Bataille — Eroticism & Excess',
    shortLabel: 'BATAILLE',
    family: 'erotic-philosophical',
    description: 'Reads tension through expenditure, taboo and transgression, continuity/discontinuity, sacrifice, sovereignty and the unstable border of sacred/profane.',
    directive: 'Interpret through Bataillean excess, expenditure, taboo/transgression, continuity and discontinuity, sovereignty, sacrifice and sacred/profane tension. Do not moralize, and do not turn this philosophical lens into a Tarot source claim.',
  }),
  lens({
    id: 'nietzsche_dionysian',
    label: 'Nietzsche — Dionysian Becoming',
    shortLabel: 'NIETZSCHE',
    family: 'philosophical-genealogical',
    description: 'Emphasizes becoming, valuation, affirmation, amor fati, perspectivism and Dionysian tension rather than fixed moral categories.',
    directive: 'Read through becoming, value-creation, genealogy, affirmation, amor fati and Dionysian tension. Avoid reducing Nietzsche to domination or simplistic will-to-power slogans; canonical Tarot facts remain unchanged.',
  }),
  lens({
    id: 'neoplatonic_theurgy',
    label: 'Neoplatonic Theurgy',
    shortLabel: 'THEURGY',
    family: 'metaphysical-theurgic',
    description: 'Reads symbols through participation, procession and return, mediation, ascent and the capacity of ritual images to orient the soul.',
    directive: 'Interpret through participation, procession and return, symbolic mediation and theurgic ascent. Treat theurgy as philosophical/ritual framing and never as evidence for unprovided Tarot correspondences.',
  }),
  lens({
    id: 'thelemic_hga',
    label: 'Thelemic Will & HGA',
    shortLabel: 'THELEMA',
    family: 'initiatory-magical',
    description: 'Emphasizes True Will, Knowledge and Conversation of the HGA, ordeal, integration and the distinction between transient desire and governing trajectory.',
    directive: 'Interpret through True Will, HGA, ordeal, initiation and alignment. Distinguish project-authored Thelemic interpretation from canonical card facts, even when the active Tarot system is Thoth.',
  }),
]);

const BY_ID = new Map(INTERPRETIVE_LENS_CATALOG.map(entry => [entry.id, entry]));

export const getInterpretiveLens = id => BY_ID.get(String(id || '').trim().toLowerCase()) || null;

export const resolveInterpretiveLenses = ids => (
  Array.isArray(ids)
    ? ids.map(getInterpretiveLens).filter(Boolean)
    : []
);

export const buildInterpretiveLensPromptContext = ids => {
  const selected = resolveInterpretiveLenses(ids);
  if (!selected.length) return 'INTERPRETIVE LENSES: none selected.';
  const directives = selected.map(entry => `- ${entry.label}: ${entry.directive}`);
  return [
    `INTERPRETIVE LENS AUTHORITY: ${INTERPRETIVE_LENS_AUTHORITY}.`,
    'These lenses may shape emphasis, philosophical framing, metaphor, reflection and generated imagery. They MUST NOT recalculate, replace, contradict or invent canonical Tarot identity, correspondence, relation, provenance or source claims.',
    ...directives,
  ].join('\n');
};
