export const TEXT_TASKS = Object.freeze({
  ritual: 'ritual',
  card: 'card',
  oracle: 'oracle',
});

const closedObject = (properties, required = Object.keys(properties)) => ({
  type: 'object',
  properties,
  required,
  additionalProperties: false,
});

export const TEXT_SCHEMAS = Object.freeze({
  [TEXT_TASKS.ritual]: closedObject({
    dossier: { type: 'string', minLength: 1 },
    cards: {
      type: 'array',
      items: { type: 'string', minLength: 1 },
      minItems: 78,
      maxItems: 78,
    },
    questions: {
      type: 'array',
      items: { type: 'string', minLength: 1 },
      minItems: 3,
      maxItems: 3,
    },
  }),
  [TEXT_TASKS.card]: closedObject({
    exegesis: { type: 'string', minLength: 1 },
    meta: closedObject({
      hebrew: { type: 'string', minLength: 1 },
      planet: { type: 'string', minLength: 1 },
      alchemical: { type: 'string', minLength: 1 },
      daimon: { type: 'string', minLength: 1 },
      gematria: { type: 'number' },
    }),
    visual: { type: 'string', minLength: 1 },
  }),
  [TEXT_TASKS.oracle]: closedObject({
    answer: { type: 'string', minLength: 1 },
  }),
});

export const normalizeTextTask = value => {
  const task = String(value || '').trim().toLowerCase();
  return Object.values(TEXT_TASKS).includes(task) ? task : null;
};

export const getTextSchema = task => TEXT_SCHEMAS[normalizeTextTask(task)] || null;

const fail = message => {
  throw Object.assign(new Error(message), { status: 502, code: 'TEXT_SCHEMA_INVALID' });
};

const assertString = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) fail(`${label} must be a non-empty string.`);
};

export const validateStructuredTextResult = (task, value) => {
  const normalizedTask = normalizeTextTask(task);
  if (!normalizedTask) return value;
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${normalizedTask} output must be an object.`);

  if (normalizedTask === TEXT_TASKS.ritual) {
    assertString(value.dossier, 'dossier');
    if (!Array.isArray(value.cards) || value.cards.length !== 78) fail('ritual output must contain exactly 78 card names.');
    value.cards.forEach((card, index) => assertString(card, `cards[${index}]`));
    const normalizedCards = value.cards.map(card => card.trim().toLowerCase());
    if (new Set(normalizedCards).size !== 78) fail('ritual output card names must be unique.');
    if (!Array.isArray(value.questions) || value.questions.length !== 3) fail('ritual output must contain exactly 3 oracle questions.');
    value.questions.forEach((question, index) => assertString(question, `questions[${index}]`));
    return value;
  }

  if (normalizedTask === TEXT_TASKS.card) {
    assertString(value.exegesis, 'exegesis');
    assertString(value.visual, 'visual');
    if (!value.meta || typeof value.meta !== 'object' || Array.isArray(value.meta)) fail('card meta must be an object.');
    for (const key of ['hebrew', 'planet', 'alchemical', 'daimon']) assertString(value.meta[key], `meta.${key}`);
    if (!Number.isFinite(Number(value.meta.gematria))) fail('meta.gematria must be numeric.');
    return value;
  }

  assertString(value.answer, 'answer');
  return value;
};
