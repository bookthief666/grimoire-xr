import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ART_STYLES,
  EROS_LEVELS,
  TECH_LEVELS,
  TRADITIONS,
} from '../grimoireCatalog.js';
import { ATMOSPHERE_MODES, VR_SPREADS } from './vrContent.js';
import { buildCourtJourney } from './vrJourney.js';
import { ART_STYLE_FAMILIES } from './spatialRitualModel.js';

const TABS = [
  { id: 'setup', label: 'RITUAL', station: 'scriptorium' },
  { id: 'deck', label: 'DECK · 78', station: 'forge' },
  { id: 'oracle', label: 'ORACLE', station: 'oracle' },
  { id: 'spirit', label: 'SPIRIT', station: 'spirit' },
  { id: 'archive', label: 'ARCHIVE', station: 'archive' },
];

const SHOWCASE_STEPS = [
  {
    tab: 'setup',
    station: 'scriptorium',
    eyebrow: 'I · NAME THE CURRENT',
    title: 'Awaken the complete 78-card architecture',
    body: 'Choose a subject and current, then awaken the Grimoire. Phone Demo performs the entire rite without the Mac; Live AI invokes Qwen and ComfyUI through the bridge.',
  },
  {
    tab: 'deck',
    station: 'forge',
    eyebrow: 'II · GIVE THE ARCHETYPE A BODY',
    title: 'Inscribe, manifest, and temper an arcanum',
    body: 'Select any of the 78 archetypes. Scribe its exegesis, manifest its image, inspect it for patina, or use the guarded Grand Forge in deliberate batches.',
  },
  {
    tab: 'oracle',
    station: 'oracle',
    eyebrow: 'III · ARRANGE THE ORACLE',
    title: 'Draw randomly or compose the cloth by hand',
    body: 'Ask a precise living question, choose a spread, then draw or place exact cards. Cast Reading turns the arrangement into a contextual interpretation.',
  },
  {
    tab: 'spirit',
    station: 'spirit',
    eyebrow: 'IV · OPEN THE IMAGINATIVE SIGNAL',
    title: 'Continue a historically informed dialogue',
    body: 'Type or dictate into the Spirit Box. The voice remains explicitly imaginative while retaining the ritual subject and this session’s conversational memory.',
  },
  {
    tab: 'archive',
    station: 'archive',
    eyebrow: 'V · CARRY THE PALACE WITH YOU',
    title: 'Gallery, statistics, export, restore, and install',
    body: 'Inspect manifested cards as a swipeable reliquary. Export JSON for restoration, create a readable HTML Grimoire, share it, or install the offline shell on the Fold.',
  },
];
const SHOWCASE_STORAGE_KEY = 'grimoire_vr_showcase_seen_v1';
const META_DISPLAY_FIELDS = [
  ['inherited', 'INHERITED CARD'],
  ['hebrew', 'HEBREW PATH'],
  ['attribution', 'FIXED ATTRIBUTION'],
  ['gematria', 'LETTER VALUE'],
  ['symbolicElement', 'SYMBOLIC ELEMENT'],
  ['alchemical', 'ALCHEMICAL LENS'],
  ['daimon', 'MNEMONIC INTELLIGENCE'],
  ['operation', 'OPERATION'],
];

const TarotMeta = ({ meta, includePatina = false, patina = 0 }) => !meta ? null : (
  <>
    <div className="vr-meta-strip">
      {META_DISPLAY_FIELDS.filter(([key]) => meta[key] !== undefined).map(([key, label]) => (
        <span key={key}><small>{label}</small>{String(meta[key])}</span>
      ))}
      {includePatina && <span><small>PATINA</small>{patina}</span>}
    </div>
    {meta.reference && <div className="vr-reference-lock"><strong>◆ REFERENCE LOCKED</strong><span>{meta.reference}</span></div>}
  </>
);

const copyText = async value => {
  const text = String(value || '');
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement('textarea');
    field.value = text;
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    return copied;
  }
};

export default function VrCommandDeck({ model, actions }) {
  const [showcaseStep, setShowcaseStep] = useState(() => {
    try {
      return localStorage.getItem(SHOWCASE_STORAGE_KEY) === 'true' ? null : 0;
    } catch {
      return 0;
    }
  });
  const [tab, setTab] = useState(showcaseStep === null && model.awakened ? 'deck' : 'setup');
  const [deckSearch, setDeckSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [galleryCopied, setGalleryCopied] = useState(false);
  const [grandForgeArmed, setGrandForgeArmed] = useState(false);
  const [galleryCardId, setGalleryCardId] = useState(null);
  const [importing, setImporting] = useState(false);
  const [busySeconds, setBusySeconds] = useState(0);
  const importInputRef = useRef(null);
  const galleryTouchStart = useRef(null);
  const filteredCards = useMemo(() => {
    const query = deckSearch.trim().toLowerCase();
    if (!query) return model.ritual.cards;
    return model.ritual.cards.filter(card => [card.name, card.arcana, card.suit, card.planet]
      .some(value => String(value || '').toLowerCase().includes(query)));
  }, [deckSearch, model.ritual.cards]);
  const forgedIds = useMemo(() => new Set(model.forgedDeck.map(card => card.id)), [model.forgedDeck]);
  const manifestedIds = useMemo(() => new Set(model.forgedDeck.filter(card => card.imageUrl).map(card => card.id)), [model.forgedDeck]);
  const galleryCards = useMemo(() => model.forgedDeck
    .filter(card => card.imageUrl)
    .sort((left, right) => left.id - right.id), [model.forgedDeck]);
  const galleryCard = useMemo(() => galleryCards.find(card => card.id === galleryCardId) || null, [galleryCardId, galleryCards]);
  const galleryCardIndex = galleryCard ? galleryCards.findIndex(card => card.id === galleryCard.id) : -1;
  const activeShowcase = showcaseStep === null ? null : SHOWCASE_STEPS[showcaseStep];
  const courtJourney = useMemo(() => buildCourtJourney(model.completedCourtIds), [model.completedCourtIds]);
  const selectedCard = model.ritual.cards[model.cardIndex];
  const textReady = model.demoMode || Boolean(model.health?.textConfigured);
  const imageReady = model.demoMode || Boolean(model.health?.imageConfigured);
  const providerReady = model.demoMode || Boolean(model.health?.textConfigured && model.health?.imageConfigured);
  const busyClock = `${String(Math.floor(busySeconds / 60)).padStart(2, '0')}:${String(busySeconds % 60).padStart(2, '0')}`;

  const selectTab = next => {
    setTab(next);
    const destination = TABS.find(entry => entry.id === next)?.station;
    if (destination) actions.openStation(destination);
  };

  const openCourt = court => {
    setTab(court.tab);
    actions.openStation(court.station);
  };

  const invokeCourt = court => {
    if (court.id === 'archive' && !court.complete) {
      void actions.exportArchive('json');
      return;
    }
    openCourt(court);
  };

  const openShowcaseStep = nextStep => {
    const normalized = Math.max(0, Math.min(SHOWCASE_STEPS.length - 1, nextStep));
    const step = SHOWCASE_STEPS[normalized];
    setShowcaseStep(normalized);
    setTab(step.tab);
    actions.openStation(step.station);
  };

  const startShowcase = () => openShowcaseStep(0);

  const endShowcase = () => {
    setShowcaseStep(null);
    try {
      localStorage.setItem(SHOWCASE_STORAGE_KEY, 'true');
    } catch {
      // The guide can still be dismissed when private storage is unavailable.
    }
  };

  const stepGallery = direction => {
    if (!galleryCards.length) return;
    const current = galleryCardIndex >= 0 ? galleryCardIndex : 0;
    const next = (current + direction + galleryCards.length) % galleryCards.length;
    setGalleryCardId(galleryCards[next].id);
  };

  const handleArchiveFile = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const restored = actions.importArchiveText(await file.text());
      if (restored) {
        setTab('archive');
        actions.openStation('archive');
      }
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const copyPrompt = async () => {
    if (await copyText(model.forgedCard?.promptUsed || model.forgedCard?.visual)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  const copyGalleryPrompt = async () => {
    if (await copyText(galleryCard?.promptUsed || galleryCard?.visual)) {
      setGalleryCopied(true);
      window.setTimeout(() => setGalleryCopied(false), 1600);
    }
  };

  useEffect(() => {
    if (!galleryCard) return undefined;
    const handleKey = event => {
      if (event.key === 'Escape') setGalleryCardId(null);
      if (event.key === 'ArrowLeft') stepGallery(-1);
      if (event.key === 'ArrowRight') stepGallery(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [galleryCard, galleryCardIndex, galleryCards]);

  useEffect(() => {
    if (!model.status.busy) {
      setBusySeconds(0);
      return undefined;
    }
    const startedAt = Date.now();
    const updateClock = () => setBusySeconds(Math.floor((Date.now() - startedAt) / 1000));
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, [model.status.busy]);

  return (
    <>
      <button className="vr-console-close" type="button" onClick={() => { if (activeShowcase) endShowcase(); actions.close(); }} aria-label="Hide ritual console">×</button>
      <div className="vr-panel-head">
        <div>
          <div className="vr-kicker">GRIMOIRE XR · LIVING INVOCATION 0.11A</div>
          <div className="vr-panel-subtitle">ONE CONSOLE · SEVEN COURTS · SEVENTY-EIGHT ARCANA</div>
        </div>
        <div className="vr-head-actions">
          <button type="button" className={activeShowcase ? 'is-active' : ''} onClick={activeShowcase ? endShowcase : startShowcase}>
            {activeShowcase ? 'END TOUR' : 'SHOWCASE'}
          </button>
          <button type="button" className={model.audioEnabled ? 'is-active' : ''} onClick={actions.toggleAudio}>
            {model.audioEnabled ? 'AUDIO ON' : 'AUDIO OFF'}
          </button>
          <div className="vr-93" aria-label="Thelemic greeting 93">93</div>
        </div>
      </div>

      <nav className="vr-console-tabs" aria-label="Grimoire tools">
        {TABS.map(entry => (
          <button
            key={entry.id}
            type="button"
            className={`${tab === entry.id ? 'is-active' : ''} ${activeShowcase?.tab === entry.id ? 'is-showcase' : ''}`}
            aria-pressed={tab === entry.id}
            onClick={() => selectTab(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </nav>

      <div className={`vr-live-status ${model.status.error ? 'is-error' : model.status.busy ? 'is-busy' : ''}`}>
        <span className="vr-status-lamp" />
        <strong>{model.status.label}</strong>
        <span>{model.healthLabel}</span>
      </div>

      {model.invocationStale && (
        <div className="vr-rebind-banner" role="alert">
          <strong>THE INVOCATION HAS CHANGED</strong>
          <span>The preserved deck is safe, but it belongs to the previous subject or lineage. Rebind all 78 arcana before using the Forge, Oracle, or Spirit Box.</span>
          <button type="button" onClick={() => selectTab('setup')} disabled={model.status.busy}>REVIEW + REBIND</button>
        </div>
      )}

      {model.status.busy && (
        <div className="vr-operation-lock" role="status" aria-live="polite">
          <div>
            <strong>{model.awakened ? 'ARCANE OPERATION IN PROGRESS' : 'AWAKENING THE COMPLETE 78-CARD PALACE'}</strong>
            <span>{busyClock} ELAPSED</span>
          </div>
          <p>{model.awakened
            ? 'The active local-AI operation has sole use of the ritual controls. They unlock automatically when its result returns.'
            : 'Qwen is composing all seventy-eight arcana as one coherent architecture. On an M2 this first rite can take several minutes. Stay on this page; the deck below is placeholder architecture until the result returns.'}</p>
        </div>
      )}

      {model.demoMode && (
        <div className="vr-demo-banner" role="status">
          <strong>PHONE DEMO ACTIVE</strong>
          <span>Provider-free deterministic rehearsal · exports are labeled · switch to Live AI for Qwen and ComfyUI</span>
        </div>
      )}

      {activeShowcase && (
        <aside className="vr-showcase" aria-live="polite">
          <div className="vr-showcase-progress" aria-label={`Showcase step ${showcaseStep + 1} of ${SHOWCASE_STEPS.length}`}>
            {SHOWCASE_STEPS.map((step, index) => (
              <button key={step.tab} type="button" className={index === showcaseStep ? 'is-active' : index < showcaseStep ? 'is-complete' : ''} onClick={() => openShowcaseStep(index)} aria-label={`Open ${step.eyebrow}`} />
            ))}
          </div>
          <span>{activeShowcase.eyebrow}</span>
          <strong>{activeShowcase.title}</strong>
          <p>{activeShowcase.body}</p>
          <div>
            <button type="button" onClick={() => openShowcaseStep(showcaseStep - 1)} disabled={showcaseStep === 0}>BACK</button>
            <button type="button" onClick={showcaseStep === SHOWCASE_STEPS.length - 1 ? endShowcase : () => openShowcaseStep(showcaseStep + 1)}>
              {showcaseStep === SHOWCASE_STEPS.length - 1 ? 'ENTER THE PALACE' : 'NEXT COURT'}
            </button>
          </div>
        </aside>
      )}

      {tab === 'setup' && (
        <section className="vr-console-page" aria-label="Ritual setup">
          <div className="vr-invocation-heading">
            <span>☿ THE NAMING MIRROR</span>
            <strong>WHAT SHALL THE GRIMOIRE REMEMBER?</strong>
            <small>Your words become the governing subject of all seventy-eight cards.</small>
          </div>

          <label className="vr-subject-field">
            INVOKE A PERSON, DEITY, TEXT, DREAM, CONCEPT, OR LIVING QUESTION
            <input
              value={model.subject}
              maxLength={240}
              onChange={event => actions.setSubject(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing && !model.status.busy) actions.beginRitual();
              }}
              disabled={model.status.busy}
              enterKeyHint="go"
              autoCapitalize="words"
              placeholder="TYPE THE SUBJECT OF YOUR GRIMOIRE…"
            />
          </label>
          <button type="button" className="vr-dictate-invocation" onClick={actions.dictateInvocation} disabled={model.status.busy}>
            ◉ SPEAK INVOCATION
          </button>

          <div className="vr-current-table" aria-label="Ritual current settings">
            <label className="vr-current-row">
              <i aria-hidden="true">♄</i>
              <span><small>TRADITION</small><b>{TRADITIONS[model.traditionIndex]?.name}</b></span>
              <select value={model.traditionIndex} onChange={event => actions.setTraditionIndex(Number(event.target.value))} disabled={model.status.busy}>
                {TRADITIONS.map((entry, index) => <option key={entry.id} value={index}>{entry.name}</option>)}
              </select>
            </label>
            <label className="vr-current-row vr-current-row-venus">
              <i aria-hidden="true">♀</i>
              <span><small>AESTHETIC CURRENT</small><b>{ART_STYLES[model.styleIndex]?.name}</b></span>
              <select value={model.styleIndex} onChange={event => actions.setStyleIndex(Number(event.target.value))} disabled={model.status.busy}>
                {ART_STYLE_FAMILIES.map(family => (
                  <optgroup key={family.id} label={family.label}>
                    {family.styles.map(entry => <option key={entry.id} value={entry.catalogIndex}>{entry.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </label>
            <label className="vr-current-row vr-current-row-range">
              <i aria-hidden="true">△</i>
              <span><small>EROS</small><b>{EROS_LEVELS[model.erosIndex]?.label}</b></span>
              <input type="range" min="0" max={EROS_LEVELS.length - 1} step="1" value={model.erosIndex} onChange={event => actions.setErosIndex(Number(event.target.value))} disabled={model.status.busy} />
            </label>
            <label className="vr-current-row vr-current-row-range">
              <i aria-hidden="true">☉</i>
              <span><small>INTELLECT</small><b>{TECH_LEVELS[model.techIndex]?.label}</b></span>
              <input type="range" min="0" max={TECH_LEVELS.length - 1} step="1" value={model.techIndex} onChange={event => actions.setTechIndex(Number(event.target.value))} disabled={model.status.busy} />
            </label>
            <label className="vr-current-row vr-current-row-luna">
              <i aria-hidden="true">☾</i>
              <span><small>ASTRAL WEATHER</small><b>{ATMOSPHERE_MODES.find(entry => entry.id === model.atmosphereMode)?.label}</b></span>
              <select value={model.atmosphereMode} onChange={event => actions.setAtmosphereMode(event.target.value)} disabled={model.status.busy}>
                {ATMOSPHERE_MODES.map(entry => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
              </select>
            </label>
          </div>

          <div className="vr-readiness-grid">
            <div className={textReady ? 'is-ready' : ''}><span>TEXT</span><strong>{model.demoMode ? 'LOCAL REHEARSAL VOICE' : model.health?.ollama?.ready ? model.health.ollama.model : 'CHECK OLLAMA'}</strong></div>
            <div className={imageReady ? 'is-ready' : ''}><span>IMAGE</span><strong>{model.demoMode ? 'LOCAL SVG RELIC FORGE' : model.health?.comfyui?.ready ? model.health.comfyui.checkpoint : 'CHECK COMFYUI'}</strong></div>
            <div className={providerReady ? 'is-ready' : ''}><span>QUEUE</span><strong>{model.demoMode ? 'LOCAL · NO WAIT' : `${model.health?.resourceScheduler?.queueDepth ?? '—'} WAITING`}</strong></div>
            <div className={model.xrSupported ? 'is-ready' : ''}><span>HEADSET</span><strong>{model.xrSupported ? 'WEBXR READY' : 'DESKTOP MODE'}</strong></div>
          </div>
          <div className="vr-readiness-actions">
            <button type="button" onClick={actions.toggleDemoMode} disabled={model.status.busy} className={model.demoMode ? 'is-active' : ''}>
              {model.demoMode ? 'RETURN TO LIVE LOCAL AI' : 'USE PHONE DEMO · NO MAC'}
            </button>
            <button type="button" onClick={actions.refreshHealth} disabled={model.status.busy || model.demoMode}>RECHECK PROVIDERS</button>
          </div>

          <div className="vr-primary-actions">
            <button className="vr-primary" type="button" onClick={actions.enterVr} disabled={!model.xrSupported || model.status.busy}>
              {model.xrSupported === null ? 'CHECKING HEADSET' : model.xrSupported ? 'ENTER IMMERSIVE VR' : 'DESKTOP PREVIEW ACTIVE'}
            </button>
            <button className="vr-awaken" type="button" onClick={actions.beginRitual} disabled={!model.subject.trim() || !textReady || model.status.busy}>
              {model.invocationStale ? 'REBIND 78 ARCANA TO THIS INVOCATION' : model.awakened ? 'RE-ARRANGE 78 ARCANA' : 'AWAKEN THE COMPLETE GRIMOIRE'}
            </button>
          </div>
          {model.awakened && (
            <>
              <div className="vr-solar-tool">
                <div><span>SOL · RULING GENIUS</span><strong>{model.ritual.geniusTitle}</strong><p>{model.ritual.geniusCharge}</p></div>
                <div className="vr-solar-actions">
                  <button type="button" onClick={actions.turnGeniusSeal} disabled={model.status.busy}>TURN SEAL · NO IMAGE</button>
                  <button type="button" onClick={model.portraitUrl ? () => actions.openStation('genius') : actions.manifestPortrait} disabled={!imageReady || model.status.busy}>
                    {model.portraitUrl ? 'OPEN RULING PORTRAIT' : 'MANIFEST RULING PORTRAIT'}
                  </button>
                </div>
              </div>
              <div className="vr-venus-tool">
                <div><span>VENUS · AESTHETIC LOOM</span><strong>{ART_STYLES[model.styleIndex]?.name}</strong><p>Changing the aesthetic selector consecrates the current weave. Keep this style or pull the next one into the Forge.</p></div>
                <button type="button" onClick={actions.weaveNextAesthetic} disabled={model.status.busy}>WEAVE NEXT AESTHETIC</button>
              </div>
            </>
          )}
          <p className="vr-help-copy">{model.demoMode ? 'Demo Current keeps every tool available on this phone. Its deterministic rehearsal text and local SVG relics are clearly labeled in the archive.' : 'Text generation comes first. Portraits and card images remain explicit so the M2 never receives an accidental render queue.'}</p>
        </section>
      )}

      {tab === 'deck' && (
        <section className="vr-console-page" aria-label="Tarot deck and forge">
          {!model.awakened && (
            <div className="vr-deck-lock" role="note">
              <div>
                <strong>{model.status.busy ? 'THE 78 ARCANA ARE BEING WRITTEN' : 'THE COMPLETE GRIMOIRE HAS NOT AWAKENED'}</strong>
                <span>{model.status.busy ? `LOCAL AI ACTIVE · ${busyClock} ELAPSED` : 'RETURN TO RITUAL AND AWAKEN THE COMPLETE GRIMOIRE'}</span>
              </div>
              <p>The names visible below are navigation placeholders. Scribe Exegesis, Spatial Forge, Oracle, and Spirit unlock only after the generated ritual replaces them.</p>
              <button type="button" onClick={() => selectTab('setup')}>VIEW RITUAL STATUS</button>
            </div>
          )}
          <div className="vr-page-title"><div><span>MARS · CARD FORGE</span><h2>{selectedCard?.name || 'AWAKEN THE DECK'}</h2></div><strong>{model.cardIndex + 1} / {model.ritual.cards.length}</strong></div>
          <div className="vr-deck-navigator">
            <button type="button" onClick={() => actions.selectCard(model.cardIndex - 1)} disabled={!model.awakened || model.status.busy}>◀</button>
            <div><span>{model.forgedCard ? model.forgedCard.imageUrl ? 'MANIFESTED' : 'INSCRIBED' : 'LATENT ARCHETYPE'}</span><strong>{selectedCard?.arcana} {selectedCard?.suit ? `· ${selectedCard.rank} OF ${selectedCard.suit}` : ''}</strong></div>
            <button type="button" onClick={() => actions.selectCard(model.cardIndex + 1)} disabled={!model.awakened || model.status.busy}>▶</button>
          </div>

          <div className="vr-forge-focus">
            {model.forgedCard?.imageUrl && <img src={model.forgedCard.imageUrl} alt="Manifested arcanum" />}
            <div>
              <p>{model.forgedCard?.exegesis || selectedCard?.oracle || 'Awaken the ritual before opening the forge.'}</p>
              <TarotMeta meta={model.forgedCard?.meta} />
            </div>
          </div>

          <div className="vr-card-actions vr-forge-actions">
            <button type="button" onClick={actions.openForge} disabled={!model.awakened || model.status.busy}>OPEN SPATIAL FORGE</button>
            {!model.forgedCard && <button type="button" onClick={actions.scribeCard} disabled={!model.awakened || !textReady || model.status.busy}>SCRIBE EXEGESIS</button>}
            {model.forgedCard && <button type="button" onClick={actions.rescribeCard} disabled={!textReady || model.status.busy}>RE-SCRIBE · LOCK REFERENCES</button>}
            {model.forgedCard && !model.forgedCard.imageUrl && <button type="button" onClick={actions.manifestCard} disabled={!imageReady || model.status.busy}>MANIFEST IMAGE</button>}
            {model.forgedCard?.imageUrl && <button type="button" onClick={actions.inspectRelic} disabled={model.status.busy}>INSPECT + ADD PATINA</button>}
            {model.forgedCard && <button type="button" onClick={actions.resetCurrentCard} disabled={model.status.busy}>RETURN TO PRIMA MATERIA</button>}
            {model.forgedCard?.visual && <button type="button" onClick={copyPrompt}>{copied ? 'PROMPT COPIED' : 'COPY VISUAL PROMPT'}</button>}
          </div>

          <label className="vr-deck-search">SEARCH THE 78-CARD ARCHITECTURE<input value={deckSearch} onChange={event => setDeckSearch(event.target.value)} placeholder="NAME, SUIT, PLANET…" disabled={!model.awakened || model.status.busy} /></label>
          <div className="vr-mini-deck" aria-label="Complete tarot deck">
            {filteredCards.map(card => (
              <button
                key={card.id}
                type="button"
                className={`${card.id === model.cardIndex ? 'is-selected' : ''} ${manifestedIds.has(card.id) ? 'is-manifested' : forgedIds.has(card.id) ? 'is-forged' : ''}`}
                onClick={() => actions.selectCard(card.id)}
                disabled={!model.awakened || model.status.busy}
              >
                <span>{String(card.id + 1).padStart(2, '0')}</span>{card.name}
              </button>
            ))}
          </div>

          <div className="vr-grand-forge">
            <div><span>GRAND FORGE · RESUMABLE BETWEEN CARDS</span><strong>{model.stats.manifestedCount} / 78 IMAGES COMPLETE</strong></div>
            {model.batchProgress.running ? (
              <>
                <div className="vr-progress"><i style={{ width: `${(model.batchProgress.current / Math.max(1, model.batchProgress.total)) * 100}%` }} /></div>
                <p>{model.batchProgress.label} · {model.batchProgress.current}/{model.batchProgress.total}</p>
                <button type="button" onClick={actions.pauseBatchForge}>{model.batchProgress.pausing ? 'PAUSE REQUESTED' : 'PAUSE AFTER CURRENT CARD'}</button>
              </>
            ) : (
              <>
                <div className="vr-batch-actions">
                  <button type="button" onClick={() => actions.startBatchForge(3)} disabled={!model.awakened || !providerReady || model.status.busy}>FORGE NEXT 3</button>
                  <button type="button" onClick={() => actions.startBatchForge(10)} disabled={!model.awakened || !providerReady || model.status.busy}>FORGE NEXT 10</button>
                  <button type="button" onClick={() => actions.startBatchForge(Infinity)} disabled={!model.awakened || !providerReady || model.status.busy || !grandForgeArmed}>FORGE ALL MISSING</button>
                </div>
                <label className="vr-arm-forge"><input type="checkbox" checked={grandForgeArmed} onChange={event => setGrandForgeArmed(event.target.checked)} /> ARM THE COMPLETE 78-IMAGE FORGE</label>
                <p>{model.demoMode ? 'Phone-demo relics are generated locally and quickly. Use this to test the full 78-card workflow; Live AI will create entirely different images.' : 'Each image may take several minutes on the M2. Pause between cards and export before closing; leaving the page prevents another card from being submitted.'}</p>
              </>
            )}
          </div>
        </section>
      )}

      {tab === 'oracle' && (
        <section className="vr-console-page" aria-label="Oracle and manual reading cloth">
          <div className="vr-page-title"><div><span>JUPITER · LIVING ORACLE</span><h2>{model.spread.id} · {model.spread.count} POSITIONS</h2></div></div>
          <div className="vr-suggestion-row">
            {model.ritual.questions.map(question => <button key={question} type="button" onClick={() => actions.setOracleQuestion(question)}>{question}</button>)}
          </div>
          <label>ORACLE QUESTION<textarea value={model.oracleQuestion} maxLength={240} onChange={event => actions.setOracleQuestion(event.target.value)} placeholder="INSCRIBE A PRECISE LIVING QUESTION…" /></label>
          <label className="vr-select-field"><span>SPREAD</span><select value={model.spreadIndex} onChange={event => actions.setSpreadIndex(Number(event.target.value))}>{VR_SPREADS.map((entry, index) => <option key={entry.id} value={index}>{entry.id} · {entry.label}</option>)}</select></label>

          <div className="vr-spread-slots">
            {model.oracleDraftIds.map((cardId, index) => {
              const card = model.ritual.cards[cardId];
              return <button key={index} type="button" className={card ? 'is-filled' : ''} onClick={() => actions.placeOracleCard(index)}><span>POSITION {index + 1}</span><strong>{card?.name || 'EMPTY LOCUS'}</strong></button>;
            })}
          </div>
          <div className="vr-tool-actions">
            <button type="button" onClick={actions.drawOracleSpread} disabled={!model.awakened || model.status.busy}>DRAW RANDOM SPREAD</button>
            <button type="button" onClick={actions.clearOracleSpread} disabled={model.status.busy}>CLEAR CLOTH</button>
            <button type="button" onClick={actions.consultOracle} disabled={!model.awakened || !textReady || model.status.busy || !model.oracleQuestion.trim()}>CAST READING</button>
          </div>
          <p className="vr-help-copy">Manual cloth: select an arcanum below, then touch a position. Touch a filled position with no card selected to remove it.</p>
          <div className="vr-oracle-tray">
            {model.ritual.cards.map(card => <button key={card.id} type="button" className={model.oracleSelectedId === card.id ? 'is-selected' : ''} onClick={() => actions.selectOracleCard(model.oracleSelectedId === card.id ? null : card.id)}><span>{card.id + 1}</span>{card.name}</button>)}
          </div>
          {model.oracleAnswer && <div className="vr-reading-result"><strong>{model.oracleCards.map(card => card.name).join(' · ')}</strong><p>{model.oracleAnswer}</p></div>}
        </section>
      )}

      {tab === 'spirit' && (
        <section className="vr-console-page" aria-label="Spirit Box conversation">
          <div className="vr-page-title"><div><span>SATURN · SPIRIT BOX</span><h2>IMAGINATIVE DIALOGUE WITH {model.subject || 'THE UNKNOWN'}</h2></div><strong>{model.spiritMessages.length} ECHOES</strong></div>
          <div className="vr-spirit-log" aria-live="polite">
            {model.spiritMessages.length ? model.spiritMessages.map((message, index) => <div key={`${message.role}-${index}`} className={`is-${message.role}`}><span>{message.role}</span><p>{message.text}</p></div>) : <p className="vr-empty">AWAKEN THE GRIMOIRE TO OPEN THE SIGNAL.</p>}
            {model.status.busy && <div className="is-system"><span>SIGNAL</span><p>THE ARCHIVE IS FORMING A REPLY…</p></div>}
          </div>
          <label>MESSAGE<textarea value={model.spiritDraft} maxLength={500} onChange={event => actions.setSpiritDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); actions.sendSpirit(); } }} placeholder="ADDRESS THE IMAGINATIVE VOICE…" /></label>
          <div className="vr-tool-actions">
            <button type="button" onClick={actions.dictateSpirit} disabled={model.status.busy}>DICTATE</button>
            <button type="button" onClick={actions.sendSpirit} disabled={!model.awakened || !textReady || model.status.busy || !model.spiritDraft.trim()}>SEND MESSAGE</button>
            <button type="button" onClick={actions.clearSpirit} disabled={model.status.busy || !model.spiritMessages.length}>CLEAR LOCAL DIALOGUE</button>
          </div>
          <p className="vr-help-copy">The voice is explicitly an imaginative, historically informed simulation—not an authentic quotation or supernatural authentication.</p>
        </section>
      )}

      {tab === 'archive' && (
        <section className="vr-console-page" aria-label="Archive, statistics, and sharing">
          <div className="vr-page-title"><div><span>LUNA · LIVING ARCHIVE</span><h2>{model.subject || 'THE UNREMEMBERED NAME'}</h2></div><strong>{model.completedCourtIds.length}/7 COURTS</strong></div>
          <div className={`vr-court-circuit ${courtJourney.sealed ? 'is-sealed' : ''}`}>
            <div className="vr-circuit-head">
              <div>
                <span>SEVEN-COURT PILGRIMAGE</span>
                <strong>{courtJourney.sealed ? 'THE CONSTELLATION IS SEALED' : `${courtJourney.completedCount} OF ${courtJourney.total} LOCI AWAKENED`}</strong>
                <p>{courtJourney.sealed
                  ? 'Every planetary instrument has received a deliberate operation. Export again whenever the palace changes.'
                  : `Next current: ${courtJourney.nextCourt.planet} · ${courtJourney.nextCourt.action}. Progress may also be completed out of order.`}</p>
              </div>
              {!courtJourney.sealed && (
                <button type="button" onClick={() => invokeCourt(courtJourney.nextCourt)}>
                  {courtJourney.nextCourt.id === 'archive' ? 'SEAL + DOWNLOAD JSON' : `OPEN ${courtJourney.nextCourt.planet}`}
                </button>
              )}
            </div>
            <div className="vr-court-list">
              {courtJourney.courts.map(court => (
                <button key={court.id} type="button" className={court.complete ? 'is-complete' : ''} onClick={() => invokeCourt(court)}>
                  <b>{court.complete ? '◆' : court.glyph}</b>
                  <span><small>{court.number} · {court.planet} · {court.concept}</small><strong>{court.complete ? 'COURT AWAKENED' : court.action}</strong><em>{court.instruction}</em></span>
                </button>
              ))}
            </div>
          </div>
          <div className="vr-stats-grid">
            <div><span>INSCRIBED</span><strong>{model.stats.forgedCount}/78</strong></div>
            <div><span>MANIFESTED</span><strong>{model.stats.manifestedCount}/78</strong></div>
            <div><span>TOTAL PATINA</span><strong>{model.stats.totalPatina}</strong></div>
            <div><span>OPERATIONS</span><strong>{model.stats.operationCount}</strong></div>
            <div className="is-wide"><span>DOMINANT CARD</span><strong>{model.stats.dominantCard?.name || 'INSUFFICIENT DATA'}</strong></div>
            <div className="is-wide"><span>ALCHEMICAL CURRENT</span><strong>{model.stats.dominantStage}</strong></div>
          </div>
          <div className="vr-echo-cloud"><span>SPIRIT BOX ECHOES</span>{model.stats.echoes.length ? model.stats.echoes.map(([word, count], index) => <b key={word} style={{ fontSize: `${0.72 + Math.min(0.6, count * 0.08)}rem`, opacity: 1 - index * 0.055 }}>{word}</b>) : <p>NO ECHOES RECORDED</p>}</div>
          <div className="vr-gallery-head">
            <div><span>MANIFESTED RELIQUARY</span><strong>{galleryCards.length} IMAGE{galleryCards.length === 1 ? '' : 'S'} BOUND</strong></div>
            {galleryCards.length > 0 && <button type="button" onClick={() => setGalleryCardId(galleryCards[0].id)}>OPEN GALLERY</button>}
          </div>
          {galleryCards.length ? (
            <div className="vr-gallery" aria-label="Manifested card gallery">
              {galleryCards.map(card => (
                <button key={card.id} type="button" className="vr-gallery-card" onClick={() => setGalleryCardId(card.id)}>
                  <img src={card.imageUrl} alt="" loading="lazy" />
                  <span>{String(card.id + 1).padStart(2, '0')}</span>
                  <strong>{card.name}</strong>
                  <small>PATINA {card.patina || 0}</small>
                </button>
              ))}
            </div>
          ) : (
            <div className="vr-gallery-empty">
              <span>◇</span>
              <strong>THE RELIQUARY AWAITS ITS FIRST IMAGE</strong>
              <p>Inscribe and manifest any arcanum in the Deck, or enable Phone Demo and rehearse the image-forging flow locally.</p>
              <button type="button" onClick={() => selectTab('deck')}>OPEN THE 78-CARD FORGE</button>
            </div>
          )}
          <div className="vr-export-actions">
            <button type="button" onClick={() => actions.exportArchive('json')} disabled={model.status.busy}>DOWNLOAD JSON</button>
            <button type="button" onClick={() => actions.exportArchive('html')} disabled={model.status.busy}>DOWNLOAD HTML GRIMOIRE</button>
            <button type="button" onClick={actions.shareArchive} disabled={model.status.busy}>SHARE / SAVE ARCHIVE</button>
            <button type="button" onClick={() => importInputRef.current?.click()} disabled={model.status.busy || importing}>{importing ? 'READING ARCHIVE…' : 'RESTORE JSON ARCHIVE'}</button>
            <input ref={importInputRef} className="vr-import-input" type="file" accept="application/json,.json" onChange={handleArchiveFile} tabIndex={-1} />
          </div>
          <div className={`vr-install-card ${model.standaloneInstalled ? 'is-installed' : ''}`}>
            <div>
              <span>OFFLINE PHONE SHELL</span>
              <strong>{model.standaloneInstalled ? 'HOME-SCREEN PALACE INSTALLED' : model.canInstall ? 'INSTALL GRIMOIRE XR' : 'ADD TO HOME SCREEN WHEN OFFERED'}</strong>
              <p>The temple shell and Phone Demo can reopen offline. Live Qwen and ComfyUI operations still require the Mac bridge.</p>
            </div>
            {model.canInstall && !model.standaloneInstalled && <button type="button" onClick={actions.installWebApp}>INSTALL</button>}
          </div>
          <p className="vr-help-copy">JSON is the restorable source of truth, including currently embedded card images. HTML creates a readable portable book. Imported images return immediately for this session; keep the JSON file as the durable backup.</p>
        </section>
      )}

      {galleryCard && createPortal((
        <div
          className="vr-gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${galleryCard.name} manifested card`}
          onClick={event => { if (event.target === event.currentTarget) setGalleryCardId(null); }}
          onTouchStart={event => { galleryTouchStart.current = event.changedTouches[0]?.clientX ?? null; }}
          onTouchEnd={event => {
            const start = galleryTouchStart.current;
            const end = event.changedTouches[0]?.clientX;
            galleryTouchStart.current = null;
            if (start === null || end === undefined || Math.abs(end - start) < 42) return;
            stepGallery(end < start ? 1 : -1);
          }}
        >
          <article>
            <button className="vr-lightbox-close" type="button" onClick={() => setGalleryCardId(null)} aria-label="Close gallery">×</button>
            <div className="vr-lightbox-image">
              <button type="button" onClick={() => stepGallery(-1)} aria-label="Previous manifested card">‹</button>
              <img src={galleryCard.imageUrl} alt={`Manifested ${galleryCard.name}`} />
              <button type="button" onClick={() => stepGallery(1)} aria-label="Next manifested card">›</button>
            </div>
            <section>
              <span>ARCANUM {String(galleryCard.id + 1).padStart(2, '0')} · {galleryCardIndex + 1}/{galleryCards.length}</span>
              <h2>{galleryCard.name}</h2>
              <p>{galleryCard.exegesis || 'This manifested arcanum awaits its exegesis.'}</p>
              <div className="vr-lightbox-meta-wrap"><TarotMeta meta={galleryCard.meta} includePatina patina={galleryCard.patina || 0} /></div>
              <div className="vr-lightbox-actions">
                <button type="button" onClick={() => { actions.selectCard(galleryCard.id); setGalleryCardId(null); selectTab('deck'); }}>OPEN IN FORGE</button>
                {(galleryCard.promptUsed || galleryCard.visual) && <button type="button" onClick={copyGalleryPrompt}>{galleryCopied ? 'PROMPT COPIED' : 'COPY PROMPT'}</button>}
              </div>
            </section>
          </article>
        </div>
      ), document.body)}

      <footer className="vr-console-footer">
        <button type="button" onClick={() => selectTab('setup')}>QUICK SETUP</button>
        <button type="button" onClick={activeShowcase ? endShowcase : startShowcase}>{activeShowcase ? 'END SHOWCASE' : 'START SHOWCASE RITE'}</button>
        <a href="/">RETURN TO 2D GRIMOIRE</a>
      </footer>
    </>
  );
}
