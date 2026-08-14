import { TAROT_ARCHETYPES } from './vrContent.js';
import { lockTarotReferenceMeta } from './tarotReference.js';

const DEMO_STAGES = ['NIGREDO', 'ALBEDO', 'CITRINITAS', 'RUBEDO'];
const DEMO_ELEMENTS = ['FIRE', 'WATER', 'AIR', 'EARTH'];
const DEMO_DAIMONS = ['MNEMOSYNE', 'AGATHODAIMON', 'PHOSPHOROS', 'NOUS', 'EROS', 'LOGOS', 'ANIMA MUNDI'];

const hashText = value => {
  let hash = 2166136261;
  for (const character of String(value || 'DEMO CURRENT')) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const focusName = subject => String(subject || 'THE UNREMEMBERED NAME')
  .trim()
  .toUpperCase()
  .split(/\s+/)
  .slice(0, 4)
  .join(' ');

const escapeXml = value => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const demoSealWords = subject => {
  const words = String(subject || '').toUpperCase().match(/[A-Z]{3,}/g) || [];
  return [...new Set([...words, 'MEMORY', 'IMAGE', 'EROS', 'WILL', 'GNOSIS', 'GENIUS'])].slice(0, 7);
};

export const createDemoRitual = (subject, { tradition = 'HERMETIC', aesthetic = 'PIXEL TEMPLE' } = {}) => {
  const focus = focusName(subject);
  return {
    dossier: `${focus} enters the rehearsal palace through the ${tradition} current. This provider-free Demo Current is a deterministic instrument for testing the complete interface on a phone: it does not claim to be an AI interpretation. The seventy-eight inherited Tarot functions remain intact while each is turned toward the named subject as a mnemonic operation. The palace asks how memory can become image, how image can become disciplined desire, and how desire can return as practical will. Its visual grammar is ${aesthetic}: black ground, scarlet voltage, brass measure, bone-white signal, and deliberate pixel fracture. Use this current to arrange cards, rehearse the Oracle, test Spirit dialogue, forge local symbolic placeholders, inspect patina, and export a portable archive. When the Mac is available, return to Live Local AI to replace rehearsal matter with Qwen and ComfyUI manifestations.`,
    geniusTitle: `THE MNEMONIC GENIUS OF ${focus}`,
    geniusCharge: `Arrange the shadows of ${focus} until one image becomes an executable act.`,
    sealWords: demoSealWords(subject),
    cards: TAROT_ARCHETYPES.map((card, index) => ({
      ...card,
      name: index < 22 ? `${card.name} OF ${focus}` : `${card.name} · ${focus}`,
      oracle: `What must ${card.name} teach ${focus} before the next operation?`,
    })),
    questions: [
      `Which image of ${focus} is ready to become an instrument?`,
      `Where has the memory of ${focus} hardened into an idol?`,
      `What operation would let ${focus} become living will?`,
    ],
  };
};

export const createDemoForgedCard = ({ seedCard, index = 0, subject, tradition, aesthetic }) => {
  const focus = focusName(subject);
  const hash = hashText(`${focus}:${seedCard?.name}:${index}`);
  const stage = DEMO_STAGES[hash % DEMO_STAGES.length];
  const element = DEMO_ELEMENTS[(hash >>> 3) % DEMO_ELEMENTS.length];
  const daimon = DEMO_DAIMONS[(hash >>> 7) % DEMO_DAIMONS.length];
  const name = seedCard?.name || `ARCANUM ${index + 1}`;
  return {
    id: index,
    name,
    exegesis: `${name} preserves its inherited Tarot function while turning it toward ${focus}. In this deterministic rehearsal, the card is treated as a shadow of an idea: not an authority to obey, but a compact scene that can be remembered, questioned, and converted into action. Its ${element.toLowerCase()} current tests what in the subject is moving, resisting, clarifying, or seeking embodiment. Under the ${tradition} lens, the operative task is to identify one concrete correspondence between the card and the living question, then alter behavior rather than merely admire the image. The ${stage} phase names the present condition of the work. ${daimon} is a mnemonic title for the faculty that performs it, not a supernatural authentication. When Live Local AI returns, this rehearsal exegesis can be returned to prima materia and forged again through Qwen.`,
    visual: `${aesthetic} ritual card for ${name}; a geometric ${element.toLowerCase()} emblem suspended above a black and scarlet mnemonic floor, brass orbit, bone-white voltage, pixel fracture, no portrait realism`,
    meta: lockTarotReferenceMeta(index, tradition, {
      symbolicElement: element,
      alchemical: stage,
      daimon,
      operation: ['REMEMBER', 'SEPARATE', 'CONJOIN', 'EMBODY'][hash % 4],
    }),
    imageUrl: null,
    promptUsed: null,
    patina: 0,
  };
};

export const createDemoImage = ({ title, subtitle = 'DEMO CURRENT', seed = '' }) => {
  const hash = hashText(`${title}:${subtitle}:${seed}`);
  const rotation = hash % 360;
  const sides = 5 + (hash % 4);
  const points = Array.from({ length: sides }, (_, index) => {
    const angle = ((index / sides) * Math.PI * 2) - Math.PI / 2;
    const radius = index % 2 ? 124 : 176;
    return `${320 + Math.cos(angle) * radius},${430 + Math.sin(angle) * radius}`;
  }).join(' ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="960" viewBox="0 0 640 960">
  <rect width="640" height="960" fill="#020102"/><path d="M0 780L320 120L640 780Z" fill="none" stroke="#54101d" stroke-width="8"/>
  <g transform="rotate(${rotation} 320 430)"><circle cx="320" cy="430" r="224" fill="#130408" stroke="#d6b45b" stroke-width="9"/><circle cx="320" cy="430" r="188" fill="none" stroke="#ef233c" stroke-width="5"/><polygon points="${points}" fill="#ef233c22" stroke="#f5ead7" stroke-width="10"/><path d="M176 430H464M320 286V574" stroke="#35c6b4" stroke-width="7" stroke-dasharray="18 12"/></g>
  <rect x="54" y="716" width="532" height="150" fill="#090304" stroke="#b8860b" stroke-width="5"/>
  <text x="320" y="770" fill="#ef233c" font-family="monospace" font-size="24" text-anchor="middle">PROVIDER-FREE REHEARSAL</text>
  <text x="320" y="818" fill="#e5c158" font-family="monospace" font-size="30" text-anchor="middle">${escapeXml(String(title || 'ARCANUM').slice(0, 30))}</text>
  <text x="320" y="850" fill="#35c6b4" font-family="monospace" font-size="20" text-anchor="middle">${escapeXml(String(subtitle).slice(0, 44))}</text>
  <g fill="#ef233c">${Array.from({ length: 19 }, (_, index) => `<rect x="${(hash + index * 83) % 610}" y="${80 + ((hash >>> 4) + index * 47) % 760}" width="${8 + (index % 4) * 7}" height="${3 + (index % 3) * 4}"/>`).join('')}</g>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const createDemoOracleReading = ({ subject, question, spread, cards = [], tradition }) => {
  const focus = focusName(subject);
  const sequence = cards.map((card, index) => `${index + 1}. ${card.name}`).join('; ');
  return `DEMO CURRENT — deterministic rehearsal, not a live AI reading. The question placed before the ${spread.id} is: “${question}” The positional sequence is ${sequence}. Read the first position as the image already governing ${focus}; the middle positions as tensions, mediators, or resources; and the final position as the operation that must become observable behavior. Under the ${tradition} current, do not ask which card predicts an event. Ask what each inherited Tarot function makes easier to notice. Repetition indicates a faculty demanding practice; contradiction indicates energy that has not yet found a form. Choose the card that produces the strongest bodily or intellectual resistance. State its demand in one sentence, then design one small act that could confirm or falsify the interpretation within twenty-four hours. Record the result as patina rather than certainty. When Live Local AI is available, cast the same arrangement again to receive a contextual relational analysis from Qwen while preserving this exact card order.`;
};

export const createDemoSpiritReply = ({ subject, question, history = [] }) => {
  const focus = focusName(subject);
  const prior = history.filter(message => message?.role === 'user').at(-1)?.text;
  return `DEMO CURRENT — imaginative rehearsal voice of ${focus}, not a quotation or supernatural claim. You ask: “${question}” ${prior ? `Your previous approach was “${prior},” so the signal now turns from repetition toward revision.` : 'The archive has no earlier human question, so it begins with first principles.'} Treat the strongest image in your question as a mnemonic device. What does it make impossible to forget, and what action does it still allow you to avoid? Name the avoided action without ornament. Then reduce it until it can be performed once, witnessed, and recorded. A living symbol changes conduct; an idol only accumulates attention. I would preserve the image only if it continues to generate distinctions, courage, or useful doubt. Which single action would prove that this conversation has crossed from atmosphere into will?`;
};

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

export const runDemoJob = async (producer, onStatus = () => {}, delayMs = 260) => {
  onStatus({ status: 'queued', queuePosition: 0, demo: true });
  await wait(Math.max(0, delayMs / 2));
  onStatus({ status: 'running', demo: true });
  await wait(Math.max(0, delayMs / 2));
  const output = producer();
  onStatus({ status: 'ready', demo: true });
  return output;
};
