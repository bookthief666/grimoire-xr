import fs from 'node:fs';

const path = 'src/reliquary/reliquary.css';
const fail = message => { throw new Error(`0.49 Phase B returning-relic style refused: ${message}`); };
const source = fs.readFileSync(path, 'utf8');

const before = `.reliquary-returning-relic {
  display: flex;
  align-items: center;
  gap: .7rem;
  padding: .8rem;
  border-left: 1px solid rgba(184, 134, 11, .45);
  background: rgba(184, 134, 11, .035);
}
`;
const after = `.reliquary-returning-relic {
  width: 100%;
  display: flex;
  align-items: center;
  gap: .7rem;
  padding: .8rem;
  appearance: none;
  border: 0;
  border-left: 1px solid rgba(184, 134, 11, .45);
  background: rgba(184, 134, 11, .035);
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color .18s ease, background .18s ease, box-shadow .18s ease, transform .18s ease;
}
.reliquary-returning-relic:hover,
.reliquary-returning-relic.is-selected {
  border-left-color: var(--grimoire-gold, #e5c158);
  background: rgba(184, 134, 11, .09);
  box-shadow: inset 0 0 28px rgba(184, 134, 11, .035);
}
.reliquary-returning-relic:hover { transform: translateX(2px); }
.reliquary-returning-relic.is-selected {
  outline: 1px solid rgba(184, 134, 11, .22);
  outline-offset: -1px;
}
.reliquary-returning-relic:focus-visible {
  outline: 1px solid var(--grimoire-gold, #e5c158);
  outline-offset: 2px;
}
`;

const count = source.split(before).length - 1;
if (count !== 1) fail(`expected one returning-relic style anchor, found ${count}`);
const next = source.replace(before, after);
for (const marker of ['appearance: none;', '.reliquary-returning-relic.is-selected', '.reliquary-returning-relic:focus-visible']) {
  if (!next.includes(marker)) fail(`missing interactive style marker ${marker}`);
}
fs.writeFileSync(path, next, 'utf8');
console.log('0.49 Phase B Returning Relic interactive styling: PASS');
