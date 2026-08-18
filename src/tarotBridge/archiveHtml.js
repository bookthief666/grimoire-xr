import { buildGrimoireArchiveEnvelope, summarizeReadingProvenance } from './archiveEnvelope.js';

const escapeHtml = value => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const safeEmbeddedJson = value => JSON.stringify(value).replace(/</g, '\\u003c');

const renderReading = reading => {
  if (!reading) return '';
  const record = reading.readingRecord;
  const summary = summarizeReadingProvenance(reading);
  if (!record) {
    return `<section class="reading"><h2>Oracle Reading</h2><p>${escapeHtml(reading.answer || '')}</p><p class="authority">Generated synthesis · no canonical ReadingRecord archived.</p></section>`;
  }
  const positions = (record.positions || []).map(position => (
    `<li><strong>${escapeHtml(position.label || position.positionId)}</strong> · ${escapeHtml(position.cardId)} · ${escapeHtml(position.orientation)}</li>`
  )).join('');
  const relations = (record.relations || []).map(relation => (
    `<li>${escapeHtml(relation.fromCardId)} → ${escapeHtml(relation.toCardId)}: <strong>${escapeHtml(relation.relationType)}</strong>${relation.reasonCode ? ` · ${escapeHtml(relation.reasonCode)}` : ''}</li>`
  )).join('');
  const sources = summary.sourceIds.map(source => `<li>${escapeHtml(source)}</li>`).join('');
  const unresolved = summary.unresolvedReasonCodes.length
    ? `<div><h3>Unresolved source gaps</h3><ul>${summary.unresolvedReasonCodes.map(code => `<li>${escapeHtml(code)}</li>`).join('')}</ul></div>`
    : '';
  return `<section class="reading">
    <h2>Oracle Reading</h2>
    <p>${escapeHtml(reading.answer || '')}</p>
    <p class="authority">Generated prose authority: MODEL_GENERATED_SYNTHESIS</p>
    <div class="semantic">
      <h3>Canonical semantic basis</h3>
      <p><strong>Contract:</strong> ${escapeHtml(reading.semanticContract?.contractId)}@${escapeHtml(reading.semanticContract?.contractVersion)} · ${escapeHtml(reading.semanticContract?.commit)}</p>
      <p><strong>Contract status:</strong> ${escapeHtml(summary.contractStatus)}</p>
      <p><strong>Spread:</strong> ${escapeHtml(summary.spreadId)} · <strong>Tarot system:</strong> ${escapeHtml(summary.tarotSystem)}</p>
      <p><strong>Relation method:</strong> ${escapeHtml(summary.relationMethod)} · ${escapeHtml(summary.relationMethodAuthority)}</p>
      <p><strong>Selection:</strong> ${escapeHtml(summary.selectionSource)}</p>
      <h3>Positions</h3><ol>${positions}</ol>
      <h3>Immediate relations</h3><ul>${relations || '<li>No technical relations bound.</li>'}</ul>
      <h3>Sources</h3><ul>${sources || '<li>No source IDs bound.</li>'}</ul>
      ${unresolved}
    </div>
  </section>`;
};

export const generateGrimoireHtmlDocument = (state, deck = state?.deck || []) => {
  const envelope = buildGrimoireArchiveEnvelope({ state, deck });
  const author = escapeHtml(state?.author || 'Untitled');
  const cards = deck.map(card => {
    const image = typeof card.imageUrl === 'string' && /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=\r\n]+$/i.test(card.imageUrl)
      ? `<img src="${card.imageUrl}" alt="${escapeHtml(card.name)}" />`
      : '<div class="missing">UNFORGED</div>';
    return `<article class="card">
      <div class="image">${image}</div>
      <section>
        <h2>${escapeHtml(card.name)}</h2>
        ${card.canonicalCardId ? `<p class="canonical-id">${escapeHtml(card.canonicalCardId)}</p>` : ''}
        <p>${escapeHtml(card.exegesis || 'This card has not yet been forged.')}</p>
        ${card.meta ? `<pre>${escapeHtml(JSON.stringify(card.meta, null, 2))}</pre>` : ''}
        ${card.interpretiveMetaAuthority ? `<p class="authority">Metadata authority: ${escapeHtml(card.interpretiveMetaAuthority)}</p>` : ''}
      </section>
    </article>`;
  }).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Grimoire Archive — ${author}</title>
  <style>
    :root { color-scheme: dark; } * { box-sizing: border-box; }
    body { margin: 0; padding: 32px; background: #050000; color: #d22; font: 18px/1.5 ui-monospace, monospace; }
    header, .reading { max-width: 1100px; margin: 0 auto 48px; border: 1px solid #900; padding: 24px; background: #0b0000; }
    header { border-width: 0 0 2px; background: transparent; padding-inline: 0; }
    h1, h2, h3 { color: #e5c158; text-transform: uppercase; } .dossier { white-space: pre-wrap; }
    main { max-width: 1100px; margin: auto; display: grid; gap: 32px; }
    .card { display: grid; grid-template-columns: minmax(180px, 280px) 1fr; gap: 24px; padding: 20px; border: 1px solid #900; background: #0b0000; }
    .image { aspect-ratio: 2/3; border: 1px solid #b8860b; display: grid; place-items: center; }
    img { width: 100%; height: 100%; object-fit: cover; } .missing { opacity: .5; }
    p { white-space: pre-wrap; } pre { overflow-wrap: anywhere; white-space: pre-wrap; color: #b8860b; }
    .semantic { margin-top: 24px; padding: 20px; border: 1px solid #b8860b; color: #d7b75b; }
    .authority, .canonical-id { font-size: .82rem; opacity: .75; }
    @media (max-width: 640px) { body { padding: 16px; } .card { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header><h1>${author} Grimoire</h1><p class="dossier">${escapeHtml(state?.dossier || '')}</p></header>
  ${renderReading(envelope.grimoire.reading)}
  <main>${cards || '<p>No cards have been inscribed.</p>'}</main>
  <script id="grimoire-archive-data" type="application/json">${safeEmbeddedJson(envelope)}</script>
</body>
</html>`;
};
