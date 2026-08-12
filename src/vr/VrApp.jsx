import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, XROrigin, createXRStore } from '@react-three/xr';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';
import { Share } from '@capacitor/share';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import AtriumScene from './AtriumScene.jsx';
import VrCommandDeck from './VrCommandDeck.jsx';
import { generateVrImage, generateVrText, readVrHealth } from './grimoireVrApi.js';
import { buildVrHtmlArchive, deriveVrStats, parseVrArchive, safeArchiveName } from './vrArchive.js';
import { getVrRitualAudio } from './vrAudio.js';
import {
  createDemoForgedCard,
  createDemoImage,
  createDemoOracleReading,
  createDemoRitual,
  createDemoSpiritReply,
  runDemoJob,
} from './vrDemo.js';
import {
  ART_STYLES,
  EROS_LEVELS,
  TECH_LEVELS,
  TRADITIONS,
} from '../grimoireCatalog.js';
import {
  ATMOSPHERE_MODES,
  PLANETARY_STATIONS,
  PROTOTYPE_MEMORY,
  VR_SPREADS,
  createPalaceSnapshot,
  normalizeRitual,
  placeSpreadCard as placeCardInSpread,
  resolveAtmosphereTier,
  restorePalaceSnapshot,
  selectForgeTargets,
  selectSpreadCards,
  truncateForPanel,
} from './vrContent.js';

const vrStore = createXRStore({
  offerSession: false,
  emulate: false,
  frameRate: supported => {
    const rates = Array.from(supported || []);
    if (rates.includes(72)) return 72;
    return rates.length ? Math.min(...rates) : false;
  },
  frameBufferScaling: 'mid',
  foveation: 0.8,
  optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
});

const PALACE_STORAGE_KEY = 'grimoire_vr_palace_v3';
const ATMOSPHERE_STORAGE_KEY = 'grimoire_vr_atmosphere_v1';
const DEMO_STORAGE_KEY = 'grimoire_vr_demo_current_v1';
const ritualAudio = typeof window === 'undefined' ? null : getVrRitualAudio();

const pulseFeedback = (kind = 'light') => {
  if (Capacitor.isNativePlatform()) {
    const nativePulse = kind === 'success'
      ? Haptics.notification({ type: NotificationType.Success })
      : Haptics.impact({ style: kind === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light });
    void nativePulse.catch(() => {});
    return;
  }
  try {
    navigator.vibrate?.(kind === 'success' ? [18, 22, 28] : kind === 'medium' ? 18 : 9);
  } catch {
    // Haptics are enhancement-only.
  }
};

const restoreAtmosphereMode = () => {
  try {
    const stored = localStorage.getItem(ATMOSPHERE_STORAGE_KEY);
    return ATMOSPHERE_MODES.some(mode => mode.id === stored) ? stored : 'adaptive';
  } catch {
    return 'adaptive';
  }
};

const restoreDemoMode = () => {
  try {
    if (new URLSearchParams(window.location.search).get('demo') === '1') return true;
    return localStorage.getItem(DEMO_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

const statusFromJob = result => {
  if (result?.demo && result.status === 'queued') return 'DEMO CURRENT · ARRANGING LOCAL SYMBOLS';
  if (result?.demo && result.status === 'running') return 'DEMO CURRENT · THE PHONE IS REHEARSING';
  if (result?.demo && result.status === 'ready') return 'DEMO CURRENT · REHEARSAL COMPLETE';
  if (result?.status === 'queued') {
    return result.queuePosition
      ? `WAITING BEHIND ${result.queuePosition} LOCAL WORK${result.queuePosition === 1 ? '' : 'S'}`
      : 'ENTERING THE LOCAL AI QUEUE';
  }
  if (result?.status === 'preparing') return 'FREEING THE METAL ALTAR';
  if (result?.status === 'running') return 'THE LOCAL INTELLIGENCE IS WORKING';
  if (result?.status === 'ready') return 'THE OPERATION IS COMPLETE';
  return 'AWAITING AN OPERATION';
};

const restoreArchive = () => {
  try {
    const value = JSON.parse(localStorage.getItem('grimoire_vr_archive_v1') || '[]');
    return Array.isArray(value) ? value.slice(-24) : [];
  } catch {
    return [];
  }
};

const restorePalace = () => {
  try {
    return restorePalaceSnapshot(localStorage.getItem(PALACE_STORAGE_KEY));
  } catch {
    return null;
  }
};

const findCatalogIndex = (entries, value, fields = ['name', 'label', 'id']) => {
  const target = String(value || '').trim().toLowerCase();
  if (!target) return -1;
  return entries.findIndex(entry => fields.some(field => String(entry?.[field] || '').toLowerCase() === target));
};

export default function VrApp() {
  const restoredPalace = useMemo(restorePalace, []);
  const [subject, setSubject] = useState(restoredPalace?.subject || 'Giordano Bruno');
  const [traditionIndex, setTraditionIndex] = useState(restoredPalace?.traditionIndex
    ?? Math.max(0, TRADITIONS.findIndex(entry => entry.id === 'bruno')));
  const [styleIndex, setStyleIndex] = useState(restoredPalace?.styleIndex
    ?? Math.max(0, ART_STYLES.findIndex(entry => entry.id === 'pixel')));
  const [erosIndex, setErosIndex] = useState(restoredPalace?.erosIndex ?? 2);
  const [techIndex, setTechIndex] = useState(restoredPalace?.techIndex ?? 1);
  const [spreadIndex, setSpreadIndex] = useState(restoredPalace?.spreadIndex ?? 0);
  const [ritual, setRitual] = useState(restoredPalace?.ritual
    || normalizeRitual(PROTOTYPE_MEMORY, 'THE UNREMEMBERED NAME'));
  const [awakened, setAwakened] = useState(Boolean(restoredPalace?.awakened));
  const [activeStationId, setActiveStationId] = useState('scriptorium');
  const [forgedCard, setForgedCard] = useState(restoredPalace?.forgedCard || null);
  const [forgedDeck, setForgedDeck] = useState(restoredPalace?.forgedDeck || []);
  const [portraitUrl, setPortraitUrl] = useState(null);
  const [cardIndex, setCardIndex] = useState(restoredPalace?.cardIndex || 0);
  const [oracleQuestion, setOracleQuestion] = useState(restoredPalace?.oracleQuestion || '');
  const [oracleAnswer, setOracleAnswer] = useState(restoredPalace?.oracleAnswer || '');
  const [oracleCards, setOracleCards] = useState(restoredPalace?.oracleCards || []);
  const [oracleDraftIds, setOracleDraftIds] = useState(() => Array(
    (VR_SPREADS[restoredPalace?.spreadIndex || 0] || VR_SPREADS[0]).count,
  ).fill(null));
  const [oracleSelectedId, setOracleSelectedId] = useState(null);
  const [spiritAnswer, setSpiritAnswer] = useState(restoredPalace?.spiritAnswer || '');
  const [spiritMessages, setSpiritMessages] = useState(restoredPalace?.spiritMessages || []);
  const [spiritDraft, setSpiritDraft] = useState('');
  const [completedCourtIds, setCompletedCourtIds] = useState(restoredPalace?.completedCourtIds || []);
  const [relicInspected, setRelicInspected] = useState(false);
  const [archive, setArchive] = useState(restoreArchive);
  const [status, setStatus] = useState({
    busy: false,
    error: false,
    label: restoredPalace?.awakened ? 'THE PRESERVED PALACE REMEMBERS YOU' : 'ATRIUM READY',
  });
  const [health, setHealth] = useState(null);
  const [performance, setPerformance] = useState({ fps: 0, calls: 0, triangles: 0 });
  const [xrSupported, setXrSupported] = useState(null);
  const [inXR, setInXR] = useState(false);
  const [preflightOpen, setPreflightOpen] = useState(true);
  const [atmosphereMode, setAtmosphereMode] = useState(restoreAtmosphereMode);
  const [demoMode, setDemoMode] = useState(restoreDemoMode);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [batchProgress, setBatchProgress] = useState({
    running: false,
    pausing: false,
    current: 0,
    total: 0,
    label: 'GRAND FORGE IDLE',
  });
  const [installPrompt, setInstallPrompt] = useState(null);
  const [standaloneInstalled, setStandaloneInstalled] = useState(() => typeof window !== 'undefined'
    && (window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true));
  const batchStopRequested = useRef(false);

  const tradition = TRADITIONS[traditionIndex] || TRADITIONS[0];
  const style = ART_STYLES[styleIndex] || ART_STYLES[0];
  const eros = EROS_LEVELS[erosIndex] || EROS_LEVELS[0];
  const tech = TECH_LEVELS[techIndex] || TECH_LEVELS[1];
  const spread = VR_SPREADS[spreadIndex] || VR_SPREADS[0];
  const touchFirst = useMemo(() => typeof window !== 'undefined'
    && (window.matchMedia?.('(pointer: coarse)').matches || false), []);
  const activeStation = PLANETARY_STATIONS.find(entry => entry.id === activeStationId)
    || PLANETARY_STATIONS[1];
  const atmosphereTier = resolveAtmosphereTier({
    mode: atmosphereMode,
    fps: performance.fps,
    inXR,
    mobile: touchFirst,
  });
  const stats = useMemo(() => deriveVrStats({ forgedDeck, spiritMessages, archive }), [archive, forgedDeck, spiritMessages]);
  const spatialOracleCards = useMemo(() => {
    if (oracleCards.length) return oracleCards;
    return oracleDraftIds
      .map(cardId => ritual.cards[cardId])
      .filter(Boolean)
      .map(card => ({ id: card.id, name: card.name }));
  }, [oracleCards, oracleDraftIds, ritual.cards]);

  const completeCourt = useCallback(courtId => {
    if (!PLANETARY_STATIONS.some(station => station.id === courtId)) return;
    setCompletedCourtIds(previous => previous.includes(courtId)
      ? previous
      : [...previous, courtId]);
  }, []);

  const addArchiveEntry = useCallback(entry => {
    setArchive(previous => {
      const next = [...previous, {
        ...entry,
        operationMode: demoMode ? 'provider-free-demo' : 'live-local-ai',
        createdAt: new Date().toISOString(),
      }].slice(-24);
      try {
        localStorage.setItem('grimoire_vr_archive_v1', JSON.stringify(next));
      } catch {
        // Persistence is enhancement-only in privacy-restricted browsers.
      }
      return next;
    });
  }, [demoMode]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const snapshot = createPalaceSnapshot({
          subject,
          traditionIndex,
          styleIndex,
          erosIndex,
          techIndex,
          spreadIndex,
          ritual,
          awakened,
          forgedCard,
          forgedDeck,
          cardIndex,
          oracleQuestion,
          oracleAnswer,
          oracleCards,
          spiritAnswer,
          spiritMessages,
          completedCourtIds,
        });
        localStorage.setItem(PALACE_STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // Palace continuity is enhancement-only in storage-restricted browsers.
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [
    awakened,
    cardIndex,
    completedCourtIds,
    erosIndex,
    forgedCard,
    forgedDeck,
    oracleCards,
    oracleQuestion,
    oracleAnswer,
    ritual,
    spiritAnswer,
    spiritMessages,
    spreadIndex,
    styleIndex,
    subject,
    techIndex,
    traditionIndex,
  ]);

  useEffect(() => {
    if (archive.length) completeCourt('archive');
  }, [archive.length, completeCourt]);

  useEffect(() => {
    try {
      localStorage.setItem(ATMOSPHERE_STORAGE_KEY, atmosphereMode);
    } catch {
      // Atmosphere preference is enhancement-only in storage-restricted browsers.
    }
  }, [atmosphereMode]);

  useEffect(() => {
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, String(demoMode));
    } catch {
      // Demo preference is enhancement-only in storage-restricted browsers.
    }
  }, [demoMode]);

  useEffect(() => {
    setOracleDraftIds(Array(spread.count).fill(null));
    setOracleSelectedId(null);
  }, [spread.count]);

  useEffect(() => {
    ritualAudio?.setIntensity(status.busy ? 1 : awakened ? 0.38 : 0.12);
  }, [awakened, status.busy]);

  useEffect(() => () => ritualAudio?.stop(), []);

  useEffect(() => {
    if (!batchProgress.running) return undefined;
    const warnBeforeLeaving = event => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [batchProgress.running]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;
    let disposed = false;
    const listeners = [];
    const configureNativeInputs = async () => {
      await Promise.allSettled([
        StatusBar.show(),
        StatusBar.setStyle({ style: StatusBarStyle.Dark }),
        StatusBar.setOverlaysWebView({ overlay: true }),
        StatusBar.setBackgroundColor({ color: '#000000' }),
      ]);
      const shown = await Keyboard.addListener('keyboardWillShow', () => {
        document.documentElement.dataset.keyboard = 'open';
        requestAnimationFrame(() => document.activeElement?.scrollIntoView?.({ block: 'center' }));
      });
      const hidden = await Keyboard.addListener('keyboardWillHide', () => {
        delete document.documentElement.dataset.keyboard;
      });
      if (disposed) {
        await shown.remove();
        await hidden.remove();
      } else {
        listeners.push(shown, hidden);
      }
    };
    void configureNativeInputs();
    return () => {
      disposed = true;
      delete document.documentElement.dataset.keyboard;
      listeners.forEach(listener => void listener.remove());
    };
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;
    const updateViewport = () => {
      document.documentElement.style.setProperty('--vr-visual-height', `${viewport.height}px`);
      const keyboardLikelyOpen = window.innerHeight - viewport.height > 150;
      document.documentElement.dataset.vrKeyboard = keyboardLikelyOpen ? 'open' : 'closed';
    };
    updateViewport();
    viewport.addEventListener('resize', updateViewport);
    viewport.addEventListener('scroll', updateViewport);
    return () => {
      viewport.removeEventListener('resize', updateViewport);
      viewport.removeEventListener('scroll', updateViewport);
      document.documentElement.style.removeProperty('--vr-visual-height');
      delete document.documentElement.dataset.vrKeyboard;
    };
  }, []);

  useEffect(() => {
    const captureInstallPrompt = event => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const markInstalled = () => {
      setInstallPrompt(null);
      setStandaloneInstalled(true);
      setStatus(previous => previous.busy ? previous : {
        busy: false,
        error: false,
        label: 'GRIMOIRE XR INSTALLED · PHONE DEMO CAN OPEN FROM THE HOME SCREEN',
      });
    };
    window.addEventListener('beforeinstallprompt', captureInstallPrompt);
    window.addEventListener('appinstalled', markInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', captureInstallPrompt);
      window.removeEventListener('appinstalled', markInstalled);
    };
  }, []);

  const refreshHealth = useCallback(async () => {
    try {
      setHealth(await readVrHealth());
    } catch (error) {
      setHealth({ ok: false, error: error.message });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const detect = async () => {
      if (!navigator.xr?.isSessionSupported) {
        if (!cancelled) setXrSupported(false);
        return;
      }
      try {
        const supported = await navigator.xr.isSessionSupported('immersive-vr');
        if (!cancelled) setXrSupported(supported);
      } catch {
        if (!cancelled) setXrSupported(false);
      }
    };
    detect();
    refreshHealth();
    const healthTimer = window.setInterval(refreshHealth, 30_000);
    const unsubscribe = vrStore.subscribe(state => setInXR(Boolean(state.session)));
    return () => {
      cancelled = true;
      window.clearInterval(healthTimer);
      unsubscribe();
    };
  }, [refreshHealth]);

  const runOperation = useCallback(async (initialLabel, operation) => {
    if (status.busy) return null;
    setStatus({ busy: true, error: false, label: initialLabel });
    try {
      const result = await operation(job => {
        setStatus({ busy: true, error: false, label: statusFromJob(job) });
      });
      setStatus({ busy: false, error: false, label: 'OPERATION COMPLETE' });
      if (!demoMode) refreshHealth();
      return result;
    } catch (error) {
      setStatus({
        busy: false,
        error: true,
        label: truncateForPanel(error.message || 'THE OPERATION FAILED', 110),
      });
      if (!demoMode) refreshHealth();
      return null;
    }
  }, [demoMode, refreshHealth, status.busy]);

  const beginRitual = useCallback(async () => {
    if (!subject.trim()) {
      setStatus({ busy: false, error: true, label: 'NAME A SUBJECT BEFORE ENTERING THE PALACE' });
      return;
    }
    const result = await runOperation('ARRANGING THE SEVEN COURTS', onStatus => demoMode
      ? runDemoJob(() => createDemoRitual(subject.trim(), {
          tradition: tradition.name,
          aesthetic: style.name,
        }), onStatus)
      : generateVrText(
      `Role: You are the living mnemonic intelligence of a Giordano Bruno inspired VR memory palace. Subject: "${subject.trim()}". Tradition: ${tradition.name}. Aesthetic: ${style.name}. ${tech.instruction} ${eros.context}

Construct a rigorous but evocative initiation suitable for spatial display. Transform the complete traditional 78-card Tarot architecture into a subject-specific archetype deck: 22 Major Arcana followed by 14 cards for each suit (Wands, Cups, Swords, Pentacles). Preserve each traditional card's recognizable function while giving it a new subject-specific name. Erotic or transgressive imagery must function as a shadow of an idea—an instrument of memory and transformation—rather than an empty idol. Return only JSON with this exact shape:
{"dossier":"160-210 words","geniusTitle":"short title for the subject's ruling genius","geniusCharge":"one potent sentence","sealWords":["seven","single","mnemonic","words","in","uppercase","form"],"cards":[{"name":"subject-specific card name","arcana":"MAJOR or MINOR","suit":"blank for Major or WANDS/CUPS/SWORDS/PENTACLES","rank":"number or court rank","planet":"LUNA|MERCURY|VENUS|SOL|MARS|JUPITER|SATURN","oracle":"one question"}],"questions":["three profound questions"]}
The cards array must contain exactly 78 entries in canonical order. Do not add commentary outside JSON.`,
      onStatus,
      true,
    ));
    if (!result) return;
    const normalized = normalizeRitual(result, subject.trim());
    setRitual(normalized);
    setAwakened(true);
    setForgedCard(null);
    setForgedDeck([]);
    setPortraitUrl(null);
    setCardIndex(0);
    setOracleQuestion(normalized.questions[0] || 'What seeks a body through me?');
    setOracleAnswer('');
    setOracleCards([]);
    setOracleDraftIds(Array(spread.count).fill(null));
    setOracleSelectedId(null);
    setSpiritAnswer('');
    setSpiritMessages([{ role: 'ai', text: `I am the imaginative Spirit of ${subject.trim()}. Ask.` }]);
    setRelicInspected(false);
    setActiveStationId('scriptorium');
    setCompletedCourtIds(['scriptorium']);
    addArchiveEntry({ type: 'ritual', subject: subject.trim(), title: normalized.geniusTitle });
    pulseFeedback('success');
    void ritualAudio?.cue('success');
  }, [addArchiveEntry, demoMode, eros.context, runOperation, spread.count, style.name, subject, tech.instruction, tradition.name]);

  const storeForgedCard = useCallback(next => {
    if (!next) return;
    setForgedCard(previous => next.id === cardIndex ? next : previous);
    setForgedDeck(previous => [
      ...previous.filter(card => card.id !== next.id),
      next,
    ].sort((left, right) => left.id - right.id));
  }, [cardIndex]);

  const forgeCardAtIndex = useCallback(async (targetIndex, onStatus, includeImage = false) => {
    const seedCard = ritual.cards[targetIndex % ritual.cards.length] || PROTOTYPE_MEMORY.cards[0];
    let next = forgedDeck.find(card => card.id === targetIndex) || null;
    if (!next?.exegesis) {
      const result = demoMode
        ? await runDemoJob(() => createDemoForgedCard({
            seedCard,
            index: targetIndex,
            subject,
            tradition: tradition.name,
            aesthetic: style.name,
          }), onStatus)
        : await generateVrText(
        `Role: Master of the ${tradition.name} card forge. Subject: "${subject}". Card ${targetIndex + 1} of 78: "${seedCard.name}" (${seedCard.arcana}${seedCard.suit ? ` · ${seedCard.rank} OF ${seedCard.suit}` : ''}) under ${seedCard.planet}. Aesthetic: ${style.name}. ${tech.instruction} ${eros.context}

Explain how this card transforms its traditional Tarot function into a useful mnemonic shadow of an idea and not an idol. Return only JSON:
{"name":"card name","exegesis":"160-220 words","visual":"precise symbolic image description without readable lettering","meta":{"hebrew":"letter or path","planet":"planet or zodiacal ruler","element":"element","alchemical":"stage","daimon":"grimoire intelligence","gematria":0,"operation":"single magical or psychological operation"}}`,
        onStatus,
        true,
      );
      next = demoMode ? result : {
        id: targetIndex,
        name: truncateForPanel(result.name || seedCard.name, 72),
        exegesis: truncateForPanel(result.exegesis || 'No exegesis returned.', 620),
        visual: truncateForPanel(result.visual || seedCard.name, 460),
        meta: result.meta || { planet: seedCard.planet },
        imageUrl: null,
        promptUsed: null,
        patina: next?.patina || 0,
      };
    }
    if (includeImage && !next.imageUrl) {
      const promptUsed = `${style.prompt} Tarot card "${next.name}". ${next.visual}. ${eros.prompt} Portrait orientation, centered symbolic figure, black scarlet brass and bone ritual atmosphere, no readable text, no logo, masterpiece.`;
      const imageUrl = demoMode
        ? await runDemoJob(() => createDemoImage({ title: next.name, subtitle: seedCard.planet, seed: promptUsed }), onStatus, 140)
        : await generateVrImage(promptUsed, onStatus);
      next = { ...next, imageUrl, promptUsed: demoMode ? `DEMO CURRENT · ${promptUsed}` : promptUsed };
    }
    return next;
  }, [demoMode, eros.context, eros.prompt, forgedDeck, ritual.cards, style.name, style.prompt, subject, tech.instruction, tradition.name]);

  const scribeCard = useCallback(async () => {
    const next = await runOperation('SCRIBING THE ARCANUM', onStatus => forgeCardAtIndex(cardIndex, onStatus, false));
    if (!next) return;
    storeForgedCard(next);
    addArchiveEntry({ type: 'card', subject, title: next.name });
    void ritualAudio?.cue('forge');
  }, [addArchiveEntry, cardIndex, forgeCardAtIndex, runOperation, storeForgedCard, subject]);

  const manifestCard = useCallback(async () => {
    if (!forgedCard) return;
    const promptUsed = `${style.prompt} Tarot card "${forgedCard.name}". ${forgedCard.visual}. ${eros.prompt} Portrait orientation, centered symbolic figure, black scarlet brass and bone ritual atmosphere, no readable text, no logo, masterpiece.`;
    const imageUrl = await runOperation('MANIFESTING THE SYMBOLIC SHADOW', onStatus => demoMode
      ? runDemoJob(() => createDemoImage({
          title: forgedCard.name,
          subtitle: forgedCard.meta?.planet || 'ARCANUM',
          seed: promptUsed,
        }), onStatus, 180)
      : generateVrImage(promptUsed, onStatus));
    if (!imageUrl) return;
    const storedPrompt = demoMode ? `DEMO CURRENT · ${promptUsed}` : promptUsed;
    setForgedCard(previous => ({ ...previous, imageUrl, promptUsed: storedPrompt }));
    setForgedDeck(previous => previous.map(card => card.id === forgedCard.id
      ? { ...card, imageUrl, promptUsed: storedPrompt }
      : card));
    setRelicInspected(false);
    setStatus({ busy: false, error: false, label: 'THE RELIC HAS ARRIVED — POINT AT IT TO OPEN THE SHADOW' });
    void ritualAudio?.cue('forge');
  }, [demoMode, eros.prompt, forgedCard, runOperation, style.prompt]);

  const pauseBatchForge = useCallback(() => {
    batchStopRequested.current = true;
    setBatchProgress(previous => ({
      ...previous,
      pausing: true,
      label: 'PAUSE REQUESTED · FINISHING CURRENT SERVER JOB',
    }));
  }, []);

  const startBatchForge = useCallback(async limit => {
    if (!awakened || status.busy) return;
    const missing = selectForgeTargets(ritual.cards, forgedDeck, cardIndex, limit);
    if (!missing.length) {
      setStatus({ busy: false, error: false, label: 'THE COMPLETE DECK IS ALREADY MANIFESTED' });
      return;
    }
    batchStopRequested.current = false;
    setBatchProgress({ running: true, pausing: false, current: 0, total: missing.length, label: 'OPENING THE GRAND FORGE' });
    const outcome = await runOperation('OPENING THE GRAND FORGE', async () => {
      let completed = 0;
      for (let index = 0; index < missing.length; index += 1) {
        if (batchStopRequested.current) break;
        const seedCard = missing[index];
        const prefix = `GRAND FORGE ${index + 1}/${missing.length} · ${seedCard.name}`;
        setBatchProgress(previous => ({ ...previous, current: index, label: prefix }));
        const onStatus = job => {
          const phase = statusFromJob(job);
          setStatus({ busy: true, error: false, label: `${prefix} · ${phase}` });
          setBatchProgress(previous => ({ ...previous, label: `${seedCard.name} · ${phase}` }));
        };
        const next = await forgeCardAtIndex(seedCard.id, onStatus, true);
        storeForgedCard(next);
        completed += 1;
        setBatchProgress(previous => ({ ...previous, current: completed, label: `${next.name} MANIFESTED` }));
        addArchiveEntry({ type: 'batch-card', subject, title: next.name });
        void ritualAudio?.cue('forge');
        if (batchStopRequested.current) break;
      }
      return { completed, paused: batchStopRequested.current };
    });
    if (!outcome) {
      setBatchProgress(previous => ({ ...previous, running: false, label: 'GRAND FORGE INTERRUPTED' }));
      return;
    }
    setBatchProgress(previous => ({
      ...previous,
      running: false,
      pausing: false,
      current: outcome.completed,
      label: outcome.paused ? 'GRAND FORGE PAUSED SAFELY' : 'GRAND FORGE SLICE COMPLETE',
    }));
    setStatus({
      busy: false,
      error: false,
      label: outcome.paused
        ? `GRAND FORGE PAUSED AFTER ${outcome.completed} CARD${outcome.completed === 1 ? '' : 'S'}`
        : `GRAND FORGE COMPLETED ${outcome.completed} CARD${outcome.completed === 1 ? '' : 'S'}`,
    });
  }, [addArchiveEntry, awakened, cardIndex, forgeCardAtIndex, forgedDeck, ritual.cards, runOperation, status.busy, storeForgedCard, subject]);

  const manifestPortrait = useCallback(async () => {
    if (!awakened) return;
    const portraitPrompt = `${style.prompt} Iconic ritual portrait of ${subject} as ${ritual.geniusTitle}. ${ritual.geniusCharge}. ${eros.prompt} Thelemic black scarlet brass and bone palette, frontal archetypal presence, no readable lettering, no logo, masterpiece.`;
    const imageUrl = await runOperation('MANIFESTING THE RULING GENIUS', onStatus => demoMode
      ? runDemoJob(() => createDemoImage({ title: ritual.geniusTitle, subtitle: 'SOL · RULING GENIUS', seed: portraitPrompt }), onStatus, 180)
      : generateVrImage(portraitPrompt, onStatus));
    if (!imageUrl) return;
    setPortraitUrl(imageUrl);
    completeCourt('genius');
    addArchiveEntry({ type: 'portrait', subject, title: ritual.geniusTitle });
    setStatus({ busy: false, error: false, label: 'THE RULING IMAGE HAS ENTERED THE SOLAR SHRINE' });
  }, [addArchiveEntry, awakened, completeCourt, demoMode, eros.prompt, ritual.geniusCharge, ritual.geniusTitle, runOperation, style.prompt, subject]);

  const drawOracleSpread = useCallback(() => {
    const drawn = selectSpreadCards(
      ritual.cards,
      spread.count,
      `${subject}:${oracleQuestion}:${Date.now()}`,
    );
    setOracleDraftIds(drawn.map(card => card.id));
    setOracleSelectedId(null);
    setOracleCards([]);
    setOracleAnswer('');
    setActiveStationId('oracle');
    setStatus({ busy: false, error: false, label: `${spread.id} DRAWN · REARRANGE THE CLOTH OR CAST` });
    pulseFeedback('medium');
    void ritualAudio?.cue('oracle');
  }, [oracleQuestion, ritual.cards, spread.count, spread.id, subject]);

  const clearOracleSpread = useCallback(() => {
    setOracleDraftIds(Array(spread.count).fill(null));
    setOracleSelectedId(null);
    setOracleCards([]);
    setOracleAnswer('');
  }, [spread.count]);

  const placeOracleCard = useCallback(slotIndex => {
    setOracleDraftIds(previous => placeCardInSpread(previous, slotIndex, oracleSelectedId));
    setOracleSelectedId(null);
    setOracleCards([]);
    setOracleAnswer('');
    pulseFeedback('light');
    void ritualAudio?.cue('select');
  }, [oracleSelectedId]);

  const consultOracle = useCallback(async () => {
    const question = oracleQuestion.trim() || ritual.questions[0] || PROTOTYPE_MEMORY.questions[0];
    const manuallyArranged = oracleDraftIds.length === spread.count
      && oracleDraftIds.every(cardId => Number.isInteger(cardId));
    const selectedCards = manuallyArranged
      ? oracleDraftIds.map(cardId => ritual.cards[cardId]).filter(Boolean)
      : selectSpreadCards(ritual.cards, spread.count, `${subject}:${question}:${Date.now()}`);
    setOracleDraftIds(selectedCards.map(card => card.id));
    const cards = selectedCards.map((card, index) => `${index + 1}. ${card.name}`).join('; ');
    const result = await runOperation('OPENING THE JOVIAL ORACLE', onStatus => demoMode
      ? runDemoJob(() => createDemoOracleReading({
          subject,
          question,
          spread,
          cards: selectedCards,
          tradition: tradition.name,
        }), onStatus)
      : generateVrText(
      `Within a ${tradition.name} memory palace devoted to ${subject}, answer the question: "${question}". Spread: ${spread.id} — ${spread.label}. Cards in positional order: ${cards}. Write 220-320 words and interpret the cards relationally using elemental dignity, traditional Tarot function, and the subject-specific archetype deck. ${tech.instruction} ${eros.context} Be precise and psychologically useful; avoid generic fortune-cookie language.`,
      onStatus,
      false,
    ));
    if (!result) return;
    setOracleAnswer(truncateForPanel(result, 700));
    setOracleCards(selectedCards.map(card => ({ id: card.id, name: card.name })));
    completeCourt('oracle');
    addArchiveEntry({ type: 'oracle', subject, title: `${spread.id}: ${question}` });
    void ritualAudio?.cue('oracle');
  }, [addArchiveEntry, completeCourt, demoMode, eros.context, oracleDraftIds, oracleQuestion, ritual.cards, ritual.questions, runOperation, spread, subject, tech.instruction, tradition.name]);

  const communeSpirit = useCallback(async (questionOverride = '') => {
    const question = typeof questionOverride === 'string' && questionOverride.trim()
      ? questionOverride.trim()
      : ritual.questions[1] || 'Which image has become an idol?';
    const recentContext = spiritMessages.slice(-6)
      .map(message => `${message.role.toUpperCase()}: ${message.text}`)
      .join('\n');
    setSpiritDraft('');
    setSpiritMessages(previous => [...previous, { role: 'user', text: question }].slice(-24));
    const result = await runOperation('TUNING THE SATURNIAN VOICE', onStatus => demoMode
      ? runDemoJob(() => createDemoSpiritReply({
          subject,
          question,
          history: spiritMessages,
        }), onStatus)
      : generateVrText(
      `Speak as the archived intellectual voice of ${subject}, clearly marked as an imaginative simulation rather than an authentic quotation or supernatural claim. Tradition: ${tradition.name}. ${tech.instruction}
Recent dialogue:
${recentContext || 'No prior dialogue.'}
USER: ${question}
Answer in 120-180 words, in a distinct but historically and philosophically informed voice. End with one question for the user.`,
      onStatus,
      false,
    ));
    if (!result) {
      setSpiritMessages(previous => [...previous, { role: 'system', text: 'SIGNAL INTERRUPTED' }].slice(-24));
      return;
    }
    setSpiritAnswer(truncateForPanel(result, 700));
    setSpiritMessages(previous => [...previous, { role: 'ai', text: truncateForPanel(result, 700) }].slice(-24));
    completeCourt('spirit');
    addArchiveEntry({ type: 'spirit', subject, title: question });
    void ritualAudio?.cue('spirit');
  }, [addArchiveEntry, completeCourt, demoMode, ritual.questions, runOperation, spiritMessages, subject, tech.instruction, tradition.name]);

  const clearSpirit = useCallback(() => {
    setSpiritMessages([]);
    setSpiritAnswer('');
    setSpiritDraft('');
    setStatus({ busy: false, error: false, label: 'THE LOCAL SPIRIT DIALOGUE HAS BEEN CLEARED' });
  }, []);

  const inspectRelic = useCallback(() => {
    if (!forgedCard?.imageUrl || status.busy) return;
    setRelicInspected(true);
    setForgedCard(previous => previous ? { ...previous, patina: (previous.patina || 0) + 1 } : previous);
    setForgedDeck(previous => previous.map(card => card.id === forgedCard.id
      ? { ...card, patina: (card.patina || 0) + 1 }
      : card));
    completeCourt('forge');
    setStatus({
      busy: false,
      error: false,
      label: 'THE SHADOW OPENS — INSPECT ITS FORM, THEN RETURN IT TO THE FORGE',
    });
  }, [completeCourt, forgedCard?.id, forgedCard?.imageUrl, status.busy]);

  const selectCard = useCallback(nextIndex => {
    const length = Math.max(1, ritual.cards.length);
    const normalizedIndex = ((nextIndex % length) + length) % length;
    setCardIndex(normalizedIndex);
    setForgedCard(forgedDeck.find(card => card.id === normalizedIndex) || null);
    setRelicInspected(false);
    setStatus({ busy: false, error: false, label: `ARCANUM ${normalizedIndex + 1} OF ${length} SELECTED` });
    pulseFeedback('light');
  }, [forgedDeck, ritual.cards.length]);

  const resetCurrentCard = useCallback(() => {
    setForgedDeck(previous => previous.filter(card => card.id !== cardIndex));
    setForgedCard(null);
    setRelicInspected(false);
    setActiveStationId('forge');
    setStatus({ busy: false, error: false, label: `ARCANUM ${cardIndex + 1} HAS RETURNED TO PRIMA MATERIA` });
  }, [cardIndex]);

  const temperNextCard = useCallback(() => {
    selectCard(cardIndex + 1);
  }, [cardIndex, selectCard]);

  const weaveNextAesthetic = useCallback(() => {
    setStyleIndex(previous => (previous + 1) % ART_STYLES.length);
    completeCourt('loom');
    setStatus({ busy: false, error: false, label: 'THE LOOM HAS CHANGED WHAT THE NEXT IMAGE CAN REVEAL' });
  }, [completeCourt]);

  const turnGeniusSeal = useCallback(() => {
    completeCourt('genius');
    setStatus({ busy: false, error: false, label: ritual.geniusCharge });
  }, [completeCourt, ritual.geniusCharge]);

  const createArchivePayload = useCallback(() => ({
      format: 'grimoire-xr-archive-v1',
      exportedAt: new Date().toISOString(),
      operationMode: demoMode ? 'provider-free-demo' : 'live-local-ai',
      subject,
      tradition: tradition.name,
      aesthetic: style.name,
      eros: eros.label,
      intellect: tech.label,
      atmosphere: atmosphereMode,
      ritual,
      portraitUrl,
      forgedDeck,
      oracle: { question: oracleQuestion, spread: spread.id, cards: oracleCards, answer: oracleAnswer },
      spiritMessages,
      operations: archive,
      completedCourtIds,
    }), [archive, atmosphereMode, completedCourtIds, demoMode, eros.label, forgedDeck, oracleAnswer, oracleCards, oracleQuestion, portraitUrl, ritual, spiritMessages, spread.id, style.name, subject, tech.label, tradition.name]);

  const downloadArchiveFile = useCallback((contents, type, extension) => {
    const blob = new Blob([contents], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${safeArchiveName(subject)}.${extension}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [subject]);

  const finalizeArchiveAction = useCallback((type, title) => {
    completeCourt('archive');
    addArchiveEntry({ type, subject, title });
    setStatus({ busy: false, error: false, label: title.toUpperCase() });
    void ritualAudio?.cue('success');
  }, [addArchiveEntry, completeCourt, subject]);

  const exportArchive = useCallback(async (format = 'json') => {
    const payload = createArchivePayload();
    const html = format === 'html';
    const contents = html ? buildVrHtmlArchive(payload) : JSON.stringify(payload, null, 2);
    const extension = html ? 'html' : 'json';
    const mimeType = html ? 'text/html' : 'application/json';
    const fileName = `${safeArchiveName(subject)}.${extension}`;
    try {
      if (Capacitor.isNativePlatform()) {
        const saved = await Filesystem.writeFile({
          path: fileName,
          data: contents,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        await Share.share({
          title: `${subject || 'Grimoire'} XR Archive`,
          dialogTitle: 'Save or share the Grimoire archive',
          files: [saved.uri],
        });
      } else {
        downloadArchiveFile(contents, mimeType, extension);
      }
      finalizeArchiveAction('export', `${html ? 'HTML GRIMOIRE' : 'JSON ARCHIVE'} EXPORTED`);
    } catch (error) {
      setStatus({ busy: false, error: true, label: `ARCHIVE FAILED · ${truncateForPanel(error.message, 80)}` });
    }
  }, [createArchivePayload, downloadArchiveFile, finalizeArchiveAction, subject]);

  const shareArchive = useCallback(async () => {
    const payload = createArchivePayload();
    const contents = buildVrHtmlArchive(payload);
    const fileName = `${safeArchiveName(subject)}.html`;
    try {
      if (Capacitor.isNativePlatform()) {
        const saved = await Filesystem.writeFile({ path: fileName, data: contents, directory: Directory.Cache, encoding: Encoding.UTF8 });
        await Share.share({ title: `${subject || 'Grimoire'} XR Archive`, dialogTitle: 'Share the living Grimoire', files: [saved.uri] });
      } else {
        const file = new File([contents], fileName, { type: 'text/html' });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: `${subject || 'Grimoire'} XR Archive`, files: [file] });
        } else {
          downloadArchiveFile(contents, 'text/html', 'html');
        }
      }
      finalizeArchiveAction('share', 'PORTABLE GRIMOIRE SHARED OR SAVED');
    } catch (error) {
      if (error?.name === 'AbortError') return;
      setStatus({ busy: false, error: true, label: `SHARE FAILED · ${truncateForPanel(error.message, 80)}` });
    }
  }, [createArchivePayload, downloadArchiveFile, finalizeArchiveAction, subject]);

  const importArchiveText = useCallback(rawValue => {
    if (status.busy) return false;
    try {
      const restored = parseVrArchive(rawValue);
      const nextTradition = findCatalogIndex(TRADITIONS, restored.tradition);
      const nextStyle = findCatalogIndex(ART_STYLES, restored.aesthetic);
      const nextEros = findCatalogIndex(EROS_LEVELS, restored.eros);
      const nextTech = findCatalogIndex(TECH_LEVELS, restored.intellect);
      const nextSpread = findCatalogIndex(VR_SPREADS, restored.oracle.spread);
      const spreadDefinition = VR_SPREADS[nextSpread >= 0 ? nextSpread : 0];
      const firstCard = restored.forgedDeck[0] || null;
      const restoredOperations = [...restored.operations, {
        type: 'import',
        subject: restored.subject,
        title: 'PORTABLE PALACE RESTORED',
        operationMode: restored.operationMode,
        createdAt: new Date().toISOString(),
      }].slice(-24);

      setSubject(restored.subject);
      if (nextTradition >= 0) setTraditionIndex(nextTradition);
      if (nextStyle >= 0) setStyleIndex(nextStyle);
      if (nextEros >= 0) setErosIndex(nextEros);
      if (nextTech >= 0) setTechIndex(nextTech);
      if (nextSpread >= 0) setSpreadIndex(nextSpread);
      if (ATMOSPHERE_MODES.some(mode => mode.id === restored.atmosphere)) setAtmosphereMode(restored.atmosphere);
      setDemoMode(restored.operationMode === 'provider-free-demo');
      setRitual(restored.ritual);
      setAwakened(true);
      setPortraitUrl(restored.portraitUrl);
      setForgedDeck(restored.forgedDeck);
      setForgedCard(firstCard);
      setCardIndex(firstCard?.id || 0);
      setRelicInspected(false);
      setOracleQuestion(restored.oracle.question || restored.ritual.questions[0]);
      setOracleAnswer(restored.oracle.answer);
      setOracleCards(restored.oracle.cards);
      setOracleDraftIds(Array.from({ length: spreadDefinition.count }, (_, index) => restored.oracle.cards[index]?.id ?? null));
      setOracleSelectedId(null);
      setSpiritMessages(restored.spiritMessages);
      setSpiritAnswer([...restored.spiritMessages].reverse().find(message => message.role === 'ai')?.text || '');
      setCompletedCourtIds([...new Set([...restored.completedCourtIds, 'archive'])]);
      setArchive(restoredOperations);
      try {
        localStorage.setItem('grimoire_vr_archive_v1', JSON.stringify(restoredOperations));
      } catch {
        // The restored palace remains usable when private storage is unavailable.
      }
      setActiveStationId('archive');
      setStatus({
        busy: false,
        error: false,
        label: `PALACE RESTORED · ${restored.forgedDeck.length} FORGED ARCANA · ${restored.oracle.cards.length} ORACLE POSITIONS`,
      });
      pulseFeedback('success');
      return true;
    } catch (error) {
      setStatus({ busy: false, error: true, label: `IMPORT FAILED · ${truncateForPanel(error.message, 90)}` });
      return false;
    }
  }, [status.busy]);

  const installWebApp = useCallback(async () => {
    if (!installPrompt) return false;
    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result?.outcome === 'accepted') {
        setInstallPrompt(null);
        pulseFeedback('success');
        return true;
      }
    } catch (error) {
      setStatus({ busy: false, error: true, label: `INSTALL FAILED · ${truncateForPanel(error.message, 80)}` });
    }
    return false;
  }, [installPrompt]);

  const toggleAudio = useCallback(async () => {
    try {
      if (ritualAudio?.isPlaying()) {
        ritualAudio.stop();
        setAudioEnabled(false);
        setStatus(previous => previous.busy ? previous : { busy: false, error: false, label: 'RITUAL AUDIO SILENCED' });
      } else {
        await ritualAudio?.start();
        ritualAudio?.setIntensity(status.busy ? 1 : awakened ? 0.38 : 0.12);
        setAudioEnabled(true);
        setStatus(previous => previous.busy ? previous : { busy: false, error: false, label: 'RITUAL AUDIO AWAKENED' });
      }
    } catch (error) {
      setStatus({ busy: false, error: true, label: truncateForPanel(error.message, 100) });
    }
  }, [awakened, status.busy]);

  const toggleDemoMode = useCallback(() => {
    if (status.busy) return;
    const next = !demoMode;
    setDemoMode(next);
    setStatus({
      busy: false,
      error: false,
      label: next
        ? 'DEMO CURRENT ENABLED · THE FOLD CAN REHEARSE WITHOUT THE MAC'
        : 'LIVE LOCAL AI RESTORED · RECHECK THE MAC PROVIDERS',
    });
    if (!next) void refreshHealth();
    pulseFeedback('medium');
  }, [demoMode, refreshHealth, status.busy]);

  const dictateSpirit = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus({ busy: false, error: true, label: 'VOICE INPUT IS NOT SUPPORTED BY THIS BROWSER' });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.onresult = event => setSpiritDraft(event.results[0][0].transcript || '');
    recognition.onerror = () => setStatus({ busy: false, error: true, label: 'THE VOICE CHANNEL COULD NOT OPEN' });
    recognition.start();
  }, []);

  const codex = useMemo(() => {
    const baseDisabled = status.busy;
    switch (activeStationId) {
      case 'archive':
        return {
          title: activeStation.title,
          body: archive.length
            ? `The local archive holds ${archive.length} operation${archive.length === 1 ? '' : 's'} and ${forgedDeck.length} forged card${forgedDeck.length === 1 ? '' : 's'}. Most recent: ${archive.at(-1)?.title}. The command console exports structured JSON, a readable HTML Grimoire, or the native share sheet; Arcane Statistics reveal patina, alchemical frequency, and Spirit echoes.`
            : 'The archive is empty. Complete a ritual, forge, Oracle consultation, or Spirit Box communion. The Deck console also contains the guarded, pausable Grand Forge.',
          actionLabel: 'EXPORT THE PORTABLE ARCHIVE',
          actionDisabled: baseDisabled,
          action: exportArchive,
        };
      case 'loom':
        return {
          title: activeStation.title,
          body: `Current weave: ${style.name} (${style.cat}). The Loom now carries all ${ART_STYLES.length} aesthetics from the original Grimoire. Each pull changes the next manifested card while preserving its conceptual operation. Eros mode: ${eros.label}.`,
          actionLabel: 'WEAVE THE NEXT AESTHETIC',
          actionDisabled: baseDisabled,
          action: weaveNextAesthetic,
        };
      case 'genius':
        return {
          title: activeStation.title,
          body: awakened
            ? `${ritual.geniusCharge}\n\nSeal: ${ritual.sealWords.join(' · ')}. ${portraitUrl ? 'The ruling portrait is present as a generated mnemonic image.' : 'Manifest the ruling portrait explicitly, or turn the mnemonic seal without generating an image.'}`
            : 'The Genius Gate has no ruling image yet. Initiate the central arrangement so the seven courts can converge upon a title, charge, and mnemonic seal.',
          actionLabel: !awakened
            ? 'AWAKEN THE MONAD FIRST'
            : portraitUrl
              ? 'TURN THE MNEMONIC SEAL'
              : 'MANIFEST THE RULING PORTRAIT',
          actionDisabled: baseDisabled || !awakened,
          action: portraitUrl ? turnGeniusSeal : manifestPortrait,
        };
      case 'forge': {
        const seedCard = ritual.cards[cardIndex % ritual.cards.length] || PROTOTYPE_MEMORY.cards[0];
        return {
          title: activeStation.title,
          body: forgedCard
            ? `ARCANUM ${cardIndex + 1} / ${ritual.cards.length} · ${forgedCard.name} — ${forgedCard.meta?.planet || seedCard.planet}. ${forgedCard.exegesis}${forgedCard.imageUrl ? ' The manifested relic is now a spatial mnemonic object: point and release upon it to open the shadow.' : ''}`
            : `ARCANUM ${cardIndex + 1} / ${ritual.cards.length} · ${seedCard.name} · ${seedCard.arcana}${seedCard.suit ? ` · ${seedCard.rank} OF ${seedCard.suit}` : ''}. ${seedCard.oracle} Scribe its intellectual operation, then explicitly manifest its visual shadow through ComfyUI.`,
          actionLabel: !awakened
            ? 'AWAKEN THE MONAD FIRST'
            : !forgedCard
              ? 'SCRIBE THIS ARCANUM'
              : !forgedCard.imageUrl
                ? 'MANIFEST ITS SHADOW'
                : relicInspected
                  ? 'RETURN AND TEMPER THE NEXT'
                  : 'INSPECT THE MANIFESTED RELIC',
          actionDisabled: baseDisabled || !awakened,
          action: !forgedCard
            ? scribeCard
            : !forgedCard.imageUrl
              ? manifestCard
              : relicInspected
                ? temperNextCard
                : inspectRelic,
        };
      }
      case 'oracle':
        return {
          title: activeStation.title,
          body: oracleAnswer
            ? `${spread.id}: ${oracleCards.map(card => card.name).join(' · ')}\n\n${oracleAnswer}`
            : `Question: ${oracleQuestion || ritual.questions[0]} Spread: ${spread.id} — ${spread.label}. Arrange ${spread.count} cards manually on the command-console cloth or draw them automatically, then cast the relational reading.`,
          actionLabel: awakened ? (oracleAnswer ? `CAST ${spread.id} AGAIN` : `CAST THE ${spread.id}`) : 'AWAKEN THE MONAD FIRST',
          actionDisabled: baseDisabled || !awakened,
          action: consultOracle,
        };
      case 'spirit':
        return {
          title: activeStation.title,
          body: spiritAnswer || `The Spirit Box creates an explicitly imaginative simulation of ${subject}'s intellectual voice and preserves a local dialogue history. It does not manufacture false quotations or claim supernatural authentication. Configure a message or dictate it in the Arcane Workbench.`,
          actionLabel: awakened ? (spiritAnswer ? 'RETUNE THE VOICE' : 'COMMUNE WITH THE ARCHIVE') : 'AWAKEN THE MONAD FIRST',
          actionDisabled: baseDisabled || !awakened,
          action: communeSpirit,
        };
      case 'scriptorium':
      default:
        return {
          title: activeStation.title,
          body: awakened
            ? `${ritual.dossier}\n\nDECK: ${ritual.cards.length} ARCHETYPES · ${forgedDeck.length} FORGED · INTELLECT: ${tech.label}`
            : PROTOTYPE_MEMORY.dossier,
          actionLabel: awakened ? 'RE-ARRANGE THE SEVEN COURTS' : 'BEGIN THE RITUAL',
          actionDisabled: baseDisabled,
          action: beginRitual,
        };
    }
  }, [
    activeStation,
    activeStationId,
    archive,
    awakened,
    beginRitual,
    cardIndex,
    communeSpirit,
    consultOracle,
    eros.label,
    exportArchive,
    forgedCard,
    forgedDeck.length,
    inspectRelic,
    manifestCard,
    manifestPortrait,
    oracleAnswer,
    oracleCards,
    oracleQuestion,
    portraitUrl,
    relicInspected,
    ritual,
    scribeCard,
    spiritAnswer,
    spread,
    status.busy,
    style.cat,
    style.name,
    subject,
    temperNextCard,
    tech.label,
    turnGeniusSeal,
    weaveNextAesthetic,
  ]);

  const selectStation = useCallback(stationId => {
    setActiveStationId(stationId);
    const selected = PLANETARY_STATIONS.find(station => station.id === stationId);
    if (selected) {
      setStatus(previous => previous.busy
        ? previous
        : { busy: false, error: false, label: `${selected.planet} LOCUS — ${selected.concept}` });
    }
  }, []);

  const enterVr = async () => {
    try {
      const session = await vrStore.enterVR();
      if (!session) throw new Error('The browser did not start an immersive session.');
    } catch (error) {
      setStatus({ busy: false, error: true, label: error.message });
    }
  };

  const liveProviderReady = Boolean(health?.textConfigured && health?.imageConfigured);
  const healthLabel = demoMode
    ? 'DEMO CURRENT · NO MAC REQUIRED'
    : health?.ok === false
    ? 'API OFFLINE'
    : liveProviderReady
      ? 'LOCAL AI READY'
      : health
        ? 'PROVIDER INCOMPLETE'
        : 'CHECKING LOCAL AI';

  return (
    <main className="vr-shell">
      <div className="vr-canvas" aria-label="Interactive Grimoire VR prototype">
        <Canvas
          camera={{ position: [0, 2.65, 8.8], fov: 48, near: 0.05, far: 40 }}
          dpr={touchFirst ? [1, 1.25] : [1, 1.5]}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          shadows={false}
        >
          <XR store={vrStore}>
            <XROrigin position={[0, 0, 5.2]} />
            <AtriumScene
              subject={subject}
              awakened={awakened}
              ritual={ritual}
              activeStationId={activeStationId}
              onSelectStation={selectStation}
              onBeginRitual={beginRitual}
              codex={codex}
              onCodexAction={codex.action}
              status={status}
              inXR={inXR}
              imageUrl={activeStationId === 'forge'
                ? forgedCard?.imageUrl
                : activeStationId === 'genius'
                  ? portraitUrl
                  : null}
              relicInspected={relicInspected}
              onRelicInspect={activeStationId === 'genius' ? turnGeniusSeal : inspectRelic}
              cardIndex={cardIndex}
              deckSize={ritual.cards.length}
              forgedCardIds={forgedDeck.map(card => card.id)}
              oracleCards={spatialOracleCards}
              completedCourtIds={completedCourtIds}
              atmosphereTier={atmosphereTier}
              onPerformanceSample={setPerformance}
            />
          </XR>
        </Canvas>
      </div>

      {!inXR && !preflightOpen && (
        <button className="vr-console-toggle" type="button" onClick={() => setPreflightOpen(true)}>
          OPEN RITUAL CONSOLE · 93
        </button>
      )}

      {!inXR && preflightOpen && (
        <section className="vr-preflight vr-command-console" aria-label="Complete Grimoire command console">
          <VrCommandDeck
            model={{
              archive,
              atmosphereMode,
              atmosphereTier,
              audioEnabled,
              awakened,
              batchProgress,
              cardIndex,
              completedCourtIds,
              canInstall: Boolean(installPrompt),
              demoMode,
              forgedCard,
              forgedDeck,
              health,
              healthLabel,
              oracleAnswer,
              oracleCards,
              oracleDraftIds,
              oracleQuestion,
              oracleSelectedId,
              portraitUrl,
              ritual,
              spread,
              spreadIndex,
              spiritDraft,
              spiritMessages,
              stats,
              standaloneInstalled,
              status,
              subject,
              traditionIndex,
              styleIndex,
              erosIndex,
              techIndex,
              xrSupported,
            }}
            actions={{
              beginRitual,
              clearOracleSpread,
              clearSpirit,
              close: () => setPreflightOpen(false),
              consultOracle: () => { setActiveStationId('oracle'); void consultOracle(); },
              dictateSpirit,
              drawOracleSpread,
              enterVr,
              exportArchive,
              inspectRelic,
              importArchiveText,
              installWebApp,
              manifestCard,
              manifestPortrait: () => { setActiveStationId('genius'); void manifestPortrait(); },
              openForge: () => selectStation('forge'),
              openStation: selectStation,
              pauseBatchForge,
              placeOracleCard,
              refreshHealth,
              resetCurrentCard,
              scribeCard,
              selectCard,
              selectOracleCard: setOracleSelectedId,
              sendSpirit: () => { setActiveStationId('spirit'); void communeSpirit(spiritDraft); },
              setAtmosphereMode,
              setErosIndex,
              setOracleQuestion,
              setSpreadIndex,
              setSpiritDraft,
              setStyleIndex,
              setSubject,
              setTechIndex,
              setTraditionIndex,
              shareArchive,
              startBatchForge,
              toggleDemoMode,
              toggleAudio,
            }}
          />
        </section>
      )}

      {!inXR && (
        <aside className="vr-qa" aria-label="Performance instrumentation">
          <span>{performance.fps || '—'} FPS</span>
          <span>{performance.calls} CALLS</span>
          <span>{performance.triangles.toLocaleString()} TRI</span>
          <span>{health?.resourceScheduler?.active?.kind?.toUpperCase() || 'GPU IDLE'}</span>
          <span>QUEUE {health?.resourceScheduler?.queueDepth ?? '—'}</span>
          <span>COURTS {completedCourtIds.length}/7</span>
          <span>FX {atmosphereTier}</span>
        </aside>
      )}
    </main>
  );
}
