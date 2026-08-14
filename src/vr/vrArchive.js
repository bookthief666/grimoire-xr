import { PLANETARY_STATIONS, normalizeRitual, truncateForPanel } from './vrContent.js';
import { lockTarotReferenceMeta } from './tarotReference.js';

const escapeHtml = value => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const STOP_WORDS = new Set([
  'about', 'after', 'again', 'also', 'been', 'being', 'from', 'have', 'into',
  'just', 'more', 'must', 'that', 'their', 'there', 'these', 'they', 'this',
  'through', 'what', 'when', 'where', 'which', 'with', 'would', 'your',
]);

const ARCHIVE_FORMAT = 'grimoire-xr-archive-v1';
const MAX_ARCHIVE_CHARACTERS = 220 * 1024 * 1024;
const INTERPRETIVE_META_FIELDS = ['symbolicElement', 'element', 'alchemical', 'daimon', 'operation'];

const safeImageUrl = value => {
  const url = String(value || '');
  return /^data:image\/(?:png|jpe?g|webp|gif|svg\+xml)(?:;charset=[^;,]+)?(?:;base64)?,/i.test(url)
    ? url
    : null;
};

const normalizeImportedCard = (value, ritual, tradition) => {
  const id = Number(value?.id);
  if (!Number.isInteger(id) || id < 0 || id >= 78) return null;
  const seed = ritual.cards[id];
  const interpretiveMeta = Object.fromEntries(INTERPRETIVE_META_FIELDS
    .filter(key => value?.meta?.[key] !== undefined)
    .map(key => [key, typeof value.meta[key] === 'number'
      ? value.meta[key]
      : truncateForPanel(value.meta[key], 120)]));
  return {
    id,
    name: truncateForPanel(value?.name || seed?.name || `ARCANUM ${id + 1}`, 72),
    exegesis: truncateForPanel(value?.exegesis, 1800),
    visual: truncateForPanel(value?.visual, 900),
    meta: lockTarotReferenceMeta(id, tradition, interpretiveMeta),
    imageUrl: safeImageUrl(value?.imageUrl),
    promptUsed: truncateForPanel(value?.promptUsed, 1400) || null,
    patina: Math.max(0, Math.min(9999, Number(value?.patina) || 0)),
  };
};

const normalizeImportedMessages = value => (Array.isArray(value) ? value : [])
  .filter(message => ['user', 'ai', 'system'].includes(message?.role))
  .map(message => ({ role: message.role, text: truncateForPanel(message.text, 1800) }))
  .filter(message => message.text)
  .slice(-24);

export const parseVrArchive = rawValue => {
  const source = typeof rawValue === 'string' ? rawValue : JSON.stringify(rawValue ?? null);
  if (source.length > MAX_ARCHIVE_CHARACTERS) throw new Error('This archive is too large to restore safely on this device.');
  let value;
  try {
    value = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  if (!value || typeof value !== 'object' || value.format !== ARCHIVE_FORMAT) {
    throw new Error('This is not a Grimoire XR archive.');
  }
  const subject = truncateForPanel(value.subject, 120);
  if (!subject) throw new Error('The archive has no subject.');
  const ritual = normalizeRitual(value.ritual, subject);
  const deckById = new Map();
  (Array.isArray(value.forgedDeck) ? value.forgedDeck : []).forEach(card => {
    const normalized = normalizeImportedCard(card, ritual, value.tradition);
    if (normalized) deckById.set(normalized.id, normalized);
  });
  const oracleCards = (Array.isArray(value.oracle?.cards) ? value.oracle.cards : [])
    .map(card => {
      const id = Number(card?.id);
      if (!Number.isInteger(id) || id < 0 || id >= ritual.cards.length) return null;
      return { id, name: truncateForPanel(card?.name || ritual.cards[id].name, 72) };
    })
    .filter(Boolean)
    .slice(0, 10);
  const operations = (Array.isArray(value.operations) ? value.operations : [])
    .filter(operation => operation && typeof operation === 'object')
    .map(operation => ({
      type: truncateForPanel(operation.type, 40),
      subject: truncateForPanel(operation.subject || subject, 120),
      title: truncateForPanel(operation.title, 240),
      operationMode: operation.operationMode === 'provider-free-demo' ? 'provider-free-demo' : 'live-local-ai',
      createdAt: truncateForPanel(operation.createdAt, 40),
    }))
    .slice(-24);
  return {
    format: ARCHIVE_FORMAT,
    exportedAt: truncateForPanel(value.exportedAt, 40),
    operationMode: value.operationMode === 'provider-free-demo' ? 'provider-free-demo' : 'live-local-ai',
    subject,
    tradition: truncateForPanel(value.tradition, 100),
    aesthetic: truncateForPanel(value.aesthetic, 100),
    eros: truncateForPanel(value.eros, 40),
    intellect: truncateForPanel(value.intellect, 40),
    atmosphere: truncateForPanel(value.atmosphere, 40),
    ritual,
    portraitUrl: safeImageUrl(value.portraitUrl),
    forgedDeck: [...deckById.values()].sort((left, right) => left.id - right.id),
    oracle: {
      question: truncateForPanel(value.oracle?.question, 240),
      spread: truncateForPanel(value.oracle?.spread, 40),
      cards: oracleCards,
      answer: truncateForPanel(value.oracle?.answer, 1800),
    },
    spiritMessages: normalizeImportedMessages(value.spiritMessages),
    operations,
    completedCourtIds: [...new Set((Array.isArray(value.completedCourtIds) ? value.completedCourtIds : [])
      .filter(id => PLANETARY_STATIONS.some(station => station.id === id)))],
  };
};

export const safeArchiveName = subject => `${subject || 'grimoire'}-xr-archive`
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '') || 'grimoire-xr-archive';

export const deriveVrStats = ({ forgedDeck = [], spiritMessages = [], archive = [] } = {}) => {
  const dominantCard = [...forgedDeck]
    .sort((left, right) => (right.patina || 0) - (left.patina || 0))[0] || null;
  const alchemicalCounts = new Map();
  forgedDeck.forEach(card => {
    const stage = String(card.meta?.alchemical || '').trim().toUpperCase();
    if (stage) alchemicalCounts.set(stage, (alchemicalCounts.get(stage) || 0) + 1);
  });
  const dominantStage = [...alchemicalCounts.entries()]
    .sort((left, right) => right[1] - left[1])[0]?.[0] || 'PRIMA MATERIA';
  const wordCounts = new Map();
  spiritMessages.forEach(message => {
    String(message?.text || '').toLowerCase().match(/[a-z]{4,}/g)?.forEach(word => {
      if (!STOP_WORDS.has(word)) wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });
  });
  const echoes = [...wordCounts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 10);
  return {
    forgedCount: forgedDeck.length,
    manifestedCount: forgedDeck.filter(card => card.imageUrl).length,
    totalPatina: forgedDeck.reduce((sum, card) => sum + (Number(card.patina) || 0), 0),
    dominantCard,
    dominantStage,
    echoes,
    operationCount: archive.length,
  };
};

export const buildVrHtmlArchive = payload => {
  const subject = escapeHtml(payload.subject || 'THE UNREMEMBERED NAME');
  const includesDemo = Array.isArray(payload.operations)
    && payload.operations.some(operation => operation?.operationMode === 'provider-free-demo');
  const operationMode = payload.operationMode === 'provider-free-demo'
    ? 'DEMO CURRENT · PROVIDER-FREE DETERMINISTIC REHEARSAL'
    : includesDemo
      ? 'MIXED ARCHIVE · INCLUDES LABELED DEMO CURRENT OPERATIONS'
      : 'LIVE LOCAL AI ARCHIVE';
  const forged = Array.isArray(payload.forgedDeck) ? payload.forgedDeck : [];
  const cards = forged.map(card => {
    const image = card.imageUrl
      ? `<img src="${escapeHtml(card.imageUrl)}" alt="${escapeHtml(card.name)}" />`
      : '<div class="missing">IMAGE UNMANIFESTED</div>';
    const metadata = Object.entries(card.meta || {})
      .map(([key, value]) => `<div><b>${escapeHtml(key)}</b><span>${escapeHtml(typeof value === 'object' ? JSON.stringify(value) : value)}</span></div>`)
      .join('');
    return `<article class="card">
      <div class="image">${image}</div>
      <section><p class="index">ARCANUM ${Number(card.id) + 1}</p><h2>${escapeHtml(card.name)}</h2>
      <p>${escapeHtml(card.exegesis || 'This arcanum has not received an exegesis.')}</p>
      <div class="meta">${metadata}</div></section>
    </article>`;
  }).join('');
  const oracle = payload.oracle?.answer
    ? `<section class="record"><h2>ORACLE · ${escapeHtml(payload.oracle.spread)}</h2><h3>${escapeHtml(payload.oracle.question)}</h3><p>${escapeHtml(payload.oracle.answer)}</p></section>`
    : '';
  const spirit = Array.isArray(payload.spiritMessages) && payload.spiritMessages.length
    ? `<section class="record"><h2>SPIRIT BOX</h2>${payload.spiritMessages.map(message => `<p><b>${escapeHtml(message.role)}:</b> ${escapeHtml(message.text)}</p>`).join('')}</section>`
    : '';
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Grimoire XR — ${subject}</title><style>
  :root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;padding:32px;background:#020102;color:#e8d8c8;font:18px/1.5 ui-monospace,monospace}
  header,.record,.card{border:1px solid #8d1728;background:#090304;box-shadow:inset 0 0 32px #31081244}header,.record{max-width:1100px;margin:0 auto 28px;padding:24px}
  h1,h2{color:#e5c158;text-transform:uppercase}h1{letter-spacing:.06em}.sigil{color:#ef233c}.dossier,p{white-space:pre-wrap}
  main{max-width:1100px;margin:auto;display:grid;gap:28px}.card{display:grid;grid-template-columns:minmax(180px,280px) 1fr;gap:24px;padding:20px}
  .image{aspect-ratio:2/3;border:1px solid #b8860b;display:grid;place-items:center;color:#8d5963}img{width:100%;height:100%;object-fit:cover}.index{color:#ef233c;font-size:12px}
  .meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.meta div{border:1px solid #5c1722;padding:10px}.meta b,.meta span{display:block}.meta b{color:#a96f71;font-size:11px;text-transform:uppercase}.meta span{color:#e5c158}
  @media(max-width:640px){body{padding:14px}.card{grid-template-columns:1fr}.meta{grid-template-columns:1fr}}
  </style></head><body><header><p class="sigil">GRIMOIRE XR · PORTABLE LIVING ARCHIVE</p><p><b>${operationMode}</b></p><h1>${subject}</h1>
  <p>${escapeHtml(payload.tradition)} · ${escapeHtml(payload.aesthetic)} · EROS ${escapeHtml(payload.eros)} · ${escapeHtml(payload.intellect)}</p>
  <p class="dossier">${escapeHtml(payload.ritual?.dossier || '')}</p></header>${oracle}${spirit}<main>${cards || '<section class="record">NO ARCANA FORGED</section>'}</main></body></html>`;
};
