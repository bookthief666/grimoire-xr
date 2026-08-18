import React, { useState, useEffect, useCallback, useRef, useReducer, useMemo, memo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';
import { Share } from '@capacitor/share';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import { 
  Eye, X, User, RefreshCw, Gamepad2, Download, Heart, Menu, 
  Volume2, VolumeX, FileDown, MessageSquare, Send, Copy, Check, Brain,
  Mic, BarChart3, ChevronLeft, ChevronRight, WifiOff, AlertTriangle,
  LayoutGrid, Hexagon
} from 'lucide-react';
import {
  ART_STYLES,
  EROS_LEVELS,
  TECH_LEVELS,
  TRADITIONS,
  getErosContext,
  getErosPrompt,
} from './grimoireCatalog.js';
import { IMAGE_MODES, buildImageJobBody, canFinalizeCard, canRefineCard, readImageGenerationResult } from './imageGeneration.js';
import { createGrimoireApiError, isTerminalJobPollError, jobInterruptedMessage, jobKindFromStatusPath } from './jobPolling.js';
import { describeJobProgress, formatJobTiming } from './jobProgress.js';
import { TAROT_PROMPT_SCHEMA, compileTarotImagePrompt } from './tarotPrompt.js';
import {
  getCanonicalCardPromptContext,
} from './tarotBridge/canonicalTarotBridge.js';
import {
  buildCanonicalDeckGenesis,
  validateCanonicalDeckGenesis,
} from './tarotBridge/canonicalDeckGenesis.js';
import {
  buildCanonicalOracleSynthesisPrompt,
  prepareCanonicalOracleConsultation,
} from './tarotBridge/oracleSynthesis.js';
import {
  buildArchiveRestoreState,
  parseGrimoireArchive,
  serializeGrimoireArchive,
} from './tarotBridge/archiveEnvelope.js';
import { generateGrimoireHtmlDocument } from './tarotBridge/archiveHtml.js';
import ReadingProvenancePanel from './tarotBridge/ReadingProvenancePanel.jsx';
import RelicWorkspace from './tarotBridge/RelicWorkspace.jsx';

// ============================================================================
// 1. CONFIGURATION & STYLES
// ============================================================================

const API_BASE_URL = (import.meta.env.VITE_GRIMOIRE_API_URL || '').replace(/\/$/, '');

const callGrimoireApi = async (path, body = null, method = 'POST') => {
  if (Capacitor.isNativePlatform() && !API_BASE_URL) {
    throw new Error('Native API endpoint is not configured. Set VITE_GRIMOIRE_API_URL before building.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    ...(body === null
      ? {}
      : {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw createGrimoireApiError({ payload, status: response.status });
  }
  return payload;
};

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const runGrimoireJob = async ({
  startPath,
  statusPath,
  body,
  timeoutMs = 15 * 60 * 1000,
  pollMs = 2000,
  readResult,
  onProgress = null,
}) => {
  // Submission is intentionally attempted once: a lost tunnel response may hide a
  // job that the Mac is still running, and resubmission would duplicate GPU work.
  const started = await callGrimoireApi(startPath, body);
  if (!started.jobId) throw new Error('The Grimoire API returned no job ID.');
  if (onProgress) onProgress(started);

  const deadline = Date.now() + timeoutMs;
  let consecutivePollFailures = 0;
  while (Date.now() < deadline) {
    await wait(pollMs);
    let result;
    try {
      result = await callGrimoireApi(
        `${statusPath}?jobId=${encodeURIComponent(started.jobId)}`,
        null,
        'GET',
      );
      consecutivePollFailures = 0;
      if (onProgress) onProgress(result);
    } catch (error) {
      if (isTerminalJobPollError(error)) {
        const interrupted = Object.assign(
          new Error(jobInterruptedMessage(jobKindFromStatusPath(statusPath))),
          { status: error.status, code: error.code || 'JOB_MISSING' },
        );
        throw interrupted;
      }
      consecutivePollFailures += 1;
      if (onProgress) onProgress({ status: 'reconnecting', attempt: consecutivePollFailures });
      if (consecutivePollFailures >= 5) throw error;
      continue;
    }

    if (result.status === 'ready') return readResult(result);
    if (result.status === 'failed') {
      throw new Error(result.error || 'Local AI generation failed.');
    }
  }
  throw new Error('Local AI generation timed out after 15 minutes.');
};

// Phase 1: Structural Audio Unlock
if (typeof window !== 'undefined') {
  window.__grimoireAudio ??= { isPlaying: false, intensity: 0 };
}
let globalAudioCtx = null;

const unlockAudioContext = () => {
  if (!globalAudioCtx) {
    globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
};

export const initialState = {
  phase: 'LANDING',
  author: '',
  selectedStyle: ART_STYLES.find(s => s.id === 'pixel') || ART_STYLES[0],
  selectedTradition: TRADITIONS[0], 
  erosLevel: 0,
  techLevel: 1, 
  dossier: null,
  deck: [],
  suggestedQuestions: [],
  portrait: null,
  focusedCard: null,
  isForging: false,
  oracleQuestion: '',
  reading: null,
  isConsulting: false,
  archiveState: 'IDLE', 
  archiveProgress: { current: 0, total: 0, msg: '' },
  isSpiritBoxOpen: false,
  spiritChat: [],
  spiritInput: '',
  isSpiritTyping: false,
  isStatsOpen: false,
  status: '',
  error: null,
  reforgeStatus: '', 
  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  errorMessage: '',
  scriptoriumMode: 'DECK',
  activeSpread: 'TRIAD',
  spreadSlots: [null, null, null],
  placementCardId: null,
};

export function grimoireReducer(state, action) {
  switch (action.type) {
    case 'INITIATE_RITUAL': return { ...state, phase: 'RITUAL', status: 'ESTABLISHING ETHEREAL LINK...', dossier: null, deck: [], portrait: null };
    case 'RITUAL_SUCCESS': 
      return { 
        ...state, 
        phase: 'SCRIPTORIUM', 
        dossier: action.payload.dossier, 
        deck: validateCanonicalDeckGenesis(buildCanonicalDeckGenesis({ tradition: state.selectedTradition })),
        portrait: action.payload.portrait,
        suggestedQuestions: action.payload.questions || [],
        status: 'SYSTEM ONLINE',
        spiritChat: [{ role: 'ai', text: `I am the Spirit of ${state.author}. Ask.` }]
      };
    case 'RITUAL_FAILURE': return { ...state, phase: 'LANDING', status: 'CONNECTION SEVERED', error: action.payload };
    case 'SET_AUTHOR': return { ...state, author: action.payload };
    case 'SET_STYLE': return { ...state, selectedStyle: action.payload };
    case 'SET_TRADITION': return { ...state, selectedTradition: action.payload };
    case 'SET_EROS_LEVEL': return { ...state, erosLevel: action.payload };
    case 'SET_TECH_LEVEL': return { ...state, techLevel: action.payload };
    case 'FORGE_CARD_START': return { ...state, focusedCard: action.payload, isForging: true, reforgeStatus: 'INSCRIBING INTERPRETATION...' };
    case 'FORGE_CARD_SUCCESS': return { 
        ...state, 
        deck: state.deck.map(c => c.id === action.payload.id ? { ...action.payload, patina: (c.patina || 0) + 1 } : c), 
        focusedCard: { ...action.payload, patina: (action.payload.patina || 0) + 1 }, 
        isForging: false, 
        reforgeStatus: '' 
      };
    case 'OPEN_CARD': return { 
        ...state, 
        focusedCard: { ...action.payload, patina: (action.payload.patina || 0) + 1 }, 
        isForging: false, 
        reforgeStatus: '',
        deck: state.deck.map(c => c.id === action.payload.id ? { ...c, patina: (c.patina || 0) + 1 } : c)
      };
    case 'FORGE_CARD_FAILURE': return { ...state, isForging: false, error: action.payload, reforgeStatus: 'MANIFESTATION FAILED' };
    case 'SET_REFORGE_STATUS': return { ...state, reforgeStatus: action.payload };
    case 'OPEN_ORACLE': return { ...state, phase: 'ORACLE', reading: null };
    case 'SET_ORACLE_QUESTION': return { ...state, oracleQuestion: action.payload };
    case 'CONSULT_ORACLE_START': return { ...state, isConsulting: true, reading: null };
    case 'CONSULT_ORACLE_SUCCESS': return { ...state, isConsulting: false, reading: action.payload, deck: action.payload.updatedDeck || state.deck };
    case 'CONSULT_ORACLE_FAILURE': return { ...state, isConsulting: false };
    case 'OPEN_ARCHIVE_PROMPT': return { ...state, archiveState: 'PROMPT' };
    case 'START_ARCHIVE': return { ...state, archiveState: 'COMPILING', archiveProgress: { current: 0, total: 0, msg: '' } };
    case 'UPDATE_ARCHIVE_PROGRESS': return { ...state, archiveProgress: action.payload };
    case 'ARCHIVE_READY': return { ...state, archiveState: 'READY', archiveProgress: { current: 100, total: 100, msg: 'ARCHIVE MANIFESTED' } };
    case 'RESET_ARCHIVE': return { ...state, archiveState: 'IDLE' };
    case 'RETURN_TO_SCRIPTORIUM': return { ...state, phase: 'SCRIPTORIUM', reading: null, isConsulting: false };
    case 'RETURN_TO_LANDING': return { ...initialState, selectedStyle: state.selectedStyle, selectedTradition: state.selectedTradition };
    case 'CLOSE_CARD': return { ...state, focusedCard: null, isForging: false, reforgeStatus: '' };
    case 'SET_STATUS': return { ...state, status: action.payload };
    case 'SET_DECK': return { ...state, deck: action.payload };
    case 'TOGGLE_SPIRIT_BOX': return { ...state, isSpiritBoxOpen: !state.isSpiritBoxOpen };
    case 'SET_SPIRIT_INPUT': return { ...state, spiritInput: action.payload };
    case 'ADD_SPIRIT_MSG': return { ...state, spiritChat: [...state.spiritChat, action.payload] };
    case 'SET_SPIRIT_TYPING': return { ...state, isSpiritTyping: action.payload };
    case 'LOAD_SPIRIT_HISTORY': return { ...state, spiritChat: action.payload };
    case 'TOGGLE_STATS': return { ...state, isStatsOpen: !state.isStatsOpen };
    case 'SET_OFFLINE': return { ...state, isOffline: action.payload };
    case 'SET_ERROR_MESSAGE': return { ...state, errorMessage: action.payload };
    case 'CLEAR_ERROR_MESSAGE': return { ...state, errorMessage: '' };
    case 'SET_SCRIPTORIUM_MODE': return { ...state, scriptoriumMode: action.payload };
    case 'SET_ACTIVE_SPREAD': 
      const count = action.payload === 'TRIAD' ? 3 : action.payload === 'HEXAGRAM' ? 6 : 10;
      return { ...state, activeSpread: action.payload, spreadSlots: Array(count).fill(null), placementCardId: null };
    case 'SET_PLACEMENT_CARD': return { ...state, placementCardId: action.payload };
    case 'PLACE_CARD_IN_SLOT': 
      const newSlots = [...state.spreadSlots];
      newSlots[action.payload] = state.placementCardId;
      return { ...state, spreadSlots: newSlots, placementCardId: null };
    case 'REMOVE_CARD_FROM_SLOT':
      const clrSlots = [...state.spreadSlots];
      clrSlots[action.payload] = null;
      return { ...state, spreadSlots: clrSlots };
    case 'RESTORE_ARCHIVE': return { ...initialState, ...action.payload };
    default: return state;
  }
}

const pause = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

const useHaptic = () => useMemo(() => {
  const safely = async (effect) => {
    try {
      await effect();
    } catch {
      // Haptics are enhancement-only and must never block an interaction.
    }
  };

  return {
    forgeBuzz: () => safely(() => Haptics.impact({ style: ImpactStyle.Medium })),
    oracleBuzz: () => safely(() => Haptics.notification({ type: NotificationType.Success })),
    spiritBuzz: () => safely(() => Haptics.impact({ style: ImpactStyle.Light })),
    ritualShake: () => safely(async () => {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      await pause(90);
      await Haptics.impact({ style: ImpactStyle.Medium });
      await pause(90);
      await Haptics.notification({ type: NotificationType.Success });
    }),
  };
}, []);

const useNativeShell = (spiritInputRef) => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;

    let disposed = false;
    const listenerHandles = [];

    const configure = async () => {
      await Promise.allSettled([
        StatusBar.show(),
        StatusBar.setStyle({ style: StatusBarStyle.Dark }),
        StatusBar.setOverlaysWebView({ overlay: true }),
        StatusBar.setBackgroundColor({ color: '#000000' }),
      ]);

      const willShow = await Keyboard.addListener('keyboardWillShow', () => {
        document.documentElement.dataset.keyboard = 'open';
        requestAnimationFrame(() => spiritInputRef.current?.scrollIntoView({ block: 'nearest' }));
      });
      if (disposed) await willShow.remove();
      else listenerHandles.push(willShow);

      const willHide = await Keyboard.addListener('keyboardWillHide', () => {
        delete document.documentElement.dataset.keyboard;
      });
      if (disposed) await willHide.remove();
      else listenerHandles.push(willHide);
    };

    void configure();
    return () => {
      disposed = true;
      delete document.documentElement.dataset.keyboard;
      listenerHandles.forEach(handle => void handle.remove());
    };
  }, [spiritInputRef]);
};

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mediaQuery.matches);
    const handler = (e) => setReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  return reduced;
};

export const playRitualSting = (alchemicalStage = '') => {
  try {
    const stageStr = alchemicalStage || ''; // Fix missing param crash
    const freq = Math.max(40, Math.min(150, (stageStr.length * 10) + 40)); 
    const ctx = globalAudioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 1.0);
    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.0);
    window.__grimoireAudio.intensity = 1.0; 
  } catch (e) {}
};

const LivingBackground = memo(({ mousePosition = [0, 0], reducedMotion = false }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mousePositionRef = useRef(mousePosition);

  useEffect(() => {
    mousePositionRef.current = mousePosition;
  }, [mousePosition]);
  
  useEffect(() => {
    particlesRef.current = Array.from({ length: reducedMotion ? 10 : 30 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 30 + 10,
      baseSpeed: reducedMotion ? 0.1 : (Math.random() * 0.5 + 0.1),
      angle: Math.random() * Math.PI * 2,
      spin: reducedMotion ? 0 : (Math.random() * 0.05 - 0.025),
      type: Math.random() > 0.7 ? 'pentagram' : 'geometry', 
      colorBase: [255, Math.random() > 0.8 ? 215 : 0, 0] 
    }));
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let animationFrameId = 0;
    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      if (window.__grimoireAudio.intensity > 0) {
        window.__grimoireAudio.intensity = Math.max(0, window.__grimoireAudio.intensity - 0.015);
      }
      const audioPulse = window.__grimoireAudio.intensity;

      ctx.fillStyle = `rgba(5, 0, 0, ${0.8 - audioPulse * 0.3})`; 
      ctx.fillRect(0, 0, width, height);
      
      ctx.strokeStyle = `rgba(200, 0, 0, ${0.1 + audioPulse * 0.3})`; 
      ctx.lineWidth = 1 + audioPulse * 2;
      const gridSize = 80 + audioPulse * 10;
      for (let x = 0; x < width; x += gridSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
      for (let y = 0; y < height; y += gridSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }

      const [mx, my] = mousePositionRef.current;
      
      particlesRef.current.forEach(p => {
        p.angle += p.spin * (1 + audioPulse * 5);
        p.y -= p.baseSpeed * (1 + audioPulse * 10);
        
        if (!reducedMotion) {
          const dx = p.x - mx; const dy = p.y - my;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 200) { p.x += dx * 0.02; p.y += dy * 0.02; }
        }
        if (p.y < -50) p.y = height + 50;
        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.strokeStyle = `rgba(${p.colorBase[0]}, ${p.colorBase[1]}, ${p.colorBase[2]}, ${0.2 + audioPulse * 0.6})`;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 15 + audioPulse * 30;
        ctx.lineWidth = 2 + audioPulse * 3;
        
        if (p.type === 'pentagram') {
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(p.size * Math.cos((18 + i*72)*0.0174533), -p.size * Math.sin((18 + i*72)*0.0174533));
            ctx.lineTo(p.size/2 * Math.cos((54 + i*72)*0.0174533), -p.size/2 * Math.sin((54 + i*72)*0.0174533));
          }
          ctx.closePath(); ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.stroke();
        } else {
          ctx.strokeRect(-p.size/2, -p.size/2, p.size, p.size);
        }
        ctx.restore();
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none -z-10 bg-black opacity-80" />;
});

const AudioController = memo(() => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const sequenceTimerRef = useRef(null);
  const sequenceRunningRef = useRef(false);
  
  const playNote = (freq, type = 'sine', duration = 2.0, volume = 0.05) => {
    if (!audioCtxRef.current) return;
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
    gain.gain.linearRampToValueAtTime(volume, audioCtxRef.current.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + duration);
    window.__grimoireAudio.intensity = 1.0; 
  };

  const startSequence = () => {
    sequenceRunningRef.current = true;
    const scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; 
    const motifs = Array.from({length: 4}, () => Array.from({length: Math.random() > 0.5 ? 3 : 4}, () => scale[Math.floor(Math.random() * scale.length)]));
    let motifIndex = 0, noteIndex = 0;
    const play = () => {
      if (!sequenceRunningRef.current || audioCtxRef.current?.state !== 'running') return;

      playNote(motifs[motifIndex][noteIndex], 'triangle', 2.5, 0.04);
      noteIndex++;
      let delay = 600; 
      if (noteIndex >= motifs[motifIndex].length) {
        noteIndex = 0; motifIndex = (motifIndex + 1) % motifs.length; delay = 1200; 
      }
      sequenceTimerRef.current = window.setTimeout(play, delay);
    };
    play();
  };

  useEffect(() => () => {
    sequenceRunningRef.current = false;
    if (sequenceTimerRef.current) window.clearTimeout(sequenceTimerRef.current);
    void audioCtxRef.current?.close();
  }, []);

  const toggle = async () => {
    try {
      if (isPlaying) {
        sequenceRunningRef.current = false;
        if (sequenceTimerRef.current) window.clearTimeout(sequenceTimerRef.current);
        await audioCtxRef.current?.suspend();
        window.__grimoireAudio.isPlaying = false;
        setIsPlaying(false);
        return;
      }

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      await audioCtxRef.current.resume();
      startSequence();
      window.__grimoireAudio.isPlaying = true;
      setIsPlaying(true);
    } catch {
      // Audio is enhancement-only; unsupported WebViews keep the app usable.
    }
  };

  return (
    <button aria-label={isPlaying ? 'Mute ritual audio' : 'Play ritual audio'} onClick={toggle} className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-[calc(1.5rem+env(safe-area-inset-right))] z-[100] p-4 bg-black border-2 border-red-600 text-red-600 shadow-[0_0_25px_#ff0000] hover:scale-110 transition-transform">
      {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  );
});

const fetchGemini = async (prompt, isJson = true, task = null) => {
  return runGrimoireJob({
    startPath: '/api/text/start',
    statusPath: '/api/text/status',
    body: { prompt, isJson, task: task || undefined },
    readResult: result => result.output,
  });
};

const fetchImageGeneration = async (prompt, options = {}, onProgress = null) => {
  return runGrimoireJob({
    startPath: '/api/image/start',
    statusPath: '/api/image/status',
    body: buildImageJobBody(prompt, options),
    pollMs: 4000,
    readResult: readImageGenerationResult,
    onProgress,
  });
};

const fetchImagen = async (prompt) => {
  const result = await fetchImageGeneration(prompt);
  return result.imageUrl;
};

const GlitchText = ({ text, className = "", isEgregore = false }) => (
  <span className={`relative inline-block ${className} group ${isEgregore ? 'egregore-glitch' : ''}`}>
    <span className="relative z-10 break-words">{text}</span>
    <span className="absolute top-0 left-0 -z-10 w-full h-full text-red-500 opacity-0 group-hover:opacity-70 group-hover:animate-pulse translate-x-[2px]">{text}</span>
    <span className="absolute top-0 left-0 -z-10 w-full h-full text-white opacity-0 group-hover:opacity-70 group-hover:animate-pulse -translate-x-[2px]">{text}</span>
  </span>
);

const normalizeElement = (meta) => {
  if (!meta) return 'aether';
  const str = JSON.stringify(meta).toLowerCase();
  if (str.match(/fire|mars|aries|leo|sagittarius|wands/)) return 'fire';
  if (str.match(/water|moon|cancer|scorpio|pisces|cups/)) return 'water';
  if (str.match(/air|mercury|libra|gemini|aquarius|swords/)) return 'air';
  if (str.match(/earth|saturn|taurus|capricorn|virgo|pentacles|disks/)) return 'earth';
  return 'aether';
};

const ArcaneFrame = memo(({ element, isSkeleton = false }) => {
  const color = isSkeleton ? "rgba(255,0,0,0.3)" : "rgba(255,0,0,0.8)";
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none" viewBox="0 0 100 150">
      {element === 'fire' && (
        <path d="M 5 5 L 15 2 M 95 5 L 85 2 M 5 145 L 15 148 M 95 145 L 85 148 M 2 50 L 5 55 L 2 60 M 98 50 L 95 55 L 98 60 M 50 2 L 55 5 L 60 2" stroke={color} strokeWidth="0.5" fill="none" />
      )}
      {element === 'water' && (
        <path d="M 5 10 Q 15 5 25 10 T 45 10 M 95 140 Q 85 145 75 140 T 55 140 M 10 50 Q 5 60 10 70 M 90 50 Q 95 60 90 70" stroke={color} strokeWidth="0.5" fill="none" />
      )}
      {element === 'earth' && (
        <path d="M 5 5 L 10 5 L 10 10 L 5 10 Z M 90 5 L 95 5 L 95 10 L 90 10 Z M 5 140 L 10 140 L 10 145 L 5 145 Z M 90 140 L 95 140 L 95 145 L 90 145 Z M 40 5 L 60 5 M 40 145 L 60 145 M 5 60 L 5 90 M 95 60 L 95 90" stroke={color} strokeWidth="1" fill="none" />
      )}
      {element === 'air' && (
        <path d="M 10 10 L 50 5 L 90 10 L 95 75 L 90 140 L 50 145 L 10 140 L 5 75 Z" stroke={color} strokeWidth="0.3" strokeDasharray="2 2" fill="none" />
      )}
      {element === 'aether' && (
        <circle cx="50" cy="75" r="40" stroke={color} strokeWidth="0.2" fill="none" />
      )}
      <rect x="4" y="4" width="92" height="142" stroke={color} strokeWidth="0.5" fill="none" />
    </svg>
  );
});

const TiltCard = ({ children, className, style, onClick, reducedMotion }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);
  const glareX = useTransform(x, [-100, 100], [0, 100]);
  const glareY = useTransform(y, [-100, 100], [0, 100]);

  const handleMouseMove = (e) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div 
      ref={ref} onClick={onClick} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      className={`relative cursor-pointer transition-colors duration-300 overflow-hidden ${className}`}
      style={{ ...style, rotateX: reducedMotion ? 0 : rotateX, rotateY: reducedMotion ? 0 : rotateY, transformStyle: "preserve-3d" }}
      whileHover={reducedMotion ? {} : { scale: 1.05, zIndex: 20 }}
    >
      {children}
      {!reducedMotion && (
        <motion.div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
          style={{ background: `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, rgba(255,255,255,0.8) 0%, transparent 60%)` }}
        />
      )}
    </motion.div>
  );
};

const CardSkeleton = () => (
  <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#1a0000] to-[#3a0000] animate-pulse flex flex-col items-center justify-center p-4">
    <ArcaneFrame element="aether" isSkeleton={true} />
    <div className="w-10 sm:w-16 h-10 sm:h-16 border-t-2 border-red-600 rounded-full animate-spin mb-4" />
    <div className="w-3/4 h-1 sm:h-2 bg-red-600/30 rounded mt-2" />
    <div className="w-1/2 h-1 sm:h-2 bg-red-600/30 rounded mt-2" />
  </div>
);

const FixedSizeList = memo(({ height, width, itemCount, itemSize, children: RowComponent }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const overscanCount = 3;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemSize) - overscanCount);
  const endIndex = Math.min(itemCount - 1, Math.floor((scrollTop + height) / itemSize) + overscanCount);

  const items = [];
  for (let i = startIndex; i <= endIndex; i++) {
    items.push(<RowComponent key={i} index={i} style={{ position: 'absolute', top: `${i * itemSize}px`, left: 0, width: '100%', height: `${itemSize}px` }} />);
  }

  return (
    <div style={{ height, width, overflowY: 'auto', overflowX: 'hidden', position: 'relative', WebkitOverflowScrolling: 'touch' }} onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
      <div style={{ height: `${itemCount * itemSize}px`, width: '100%', position: 'relative' }}>{items}</div>
    </div>
  );
});

const VirtualDeckGrid = ({ deck, onCardClick, isForging, focusedCardId, reducedMotion }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => { setDimensions({ w: entries[0].contentRect.width, h: entries[0].contentRect.height }); });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const cols = dimensions.w < 480 ? 2 : dimensions.w < 640 ? 3 : dimensions.w < 1024 ? 4 : dimensions.w < 1280 ? 5 : 6;
  const gap = dimensions.w < 480 ? 12 : 24; 
  const availableWidth = dimensions.w - (gap * (cols - 1));
  const colWidth = availableWidth / cols;
  const rowHeight = (colWidth * 1.5) + gap; 
  const rowCount = Math.ceil(deck.length / cols);

  const Row = ({ index, style }) => {
    const startIndex = index * cols;
    const items = deck.slice(startIndex, startIndex + cols);
    return (
      <div style={{ ...style, display: 'flex', gap: `${gap}px`, paddingBottom: `${gap}px` }}>
        {items.map(card => {
          if (!card) return null; 
          const p = card.patina || 0;
          const isCurrentlyForging = isForging && focusedCardId === card.id;
          const element = normalizeElement(card.meta);
          
          return (
            <TiltCard 
              key={card.id} reducedMotion={reducedMotion} onClick={() => onCardClick(card)} 
              className={`bg-black/40 flex-shrink-0 ${p >= 10 ? 'border-[3px] border-[#8b6508] shadow-[inset_0_0_30px_#310_rgba(0,0,0,0.9)]' : 'border-2 border-red-900/50'}`} 
              style={{ width: colWidth, height: colWidth * 1.5 }}
            >
              {card.imageUrl ? (
                <><img src={card.imageUrl} className={`absolute inset-0 w-full h-full object-cover pixelated ${p >= 50 ? 'opacity-80 sepia' : ''}`} /><ArcaneFrame element={element} /></>
              ) : (
                isCurrentlyForging ? <CardSkeleton /> : <div className="absolute inset-0 flex items-center justify-center opacity-30 text-[10px] font-header text-center p-2 leading-tight break-words bg-black/60"><ArcaneFrame element="aether" isSkeleton={true}/>{card.name}</div>
              )}
              {p >= 1 && <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-40 mix-blend-overlay pointer-events-none" />}
              {p >= 50 && <div className="absolute inset-0 bg-red-900/30 mix-blend-screen pointer-events-none translate-x-[2px] opacity-70 blur-[1px]" />}
              <div className="absolute bottom-0 inset-x-0 p-1 sm:p-2 bg-black/80 backdrop-blur-md border-t border-red-600/50 z-20"><p className="text-[7px] sm:text-[10px] font-header text-[#e5c158] text-center truncate drop-shadow-[0_0_2px_#000]">{card.name}</p></div>
            </TiltCard>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="absolute inset-0">
      {dimensions.w > 0 && dimensions.h > 0 && <FixedSizeList height={dimensions.h} width={dimensions.w} itemCount={rowCount} itemSize={rowHeight}>{Row}</FixedSizeList>}
    </div>
  );
};

const SPREAD_CONNECTIONS = {
  'TRIAD': [[0, 1], [1, 2]],
  'HEXAGRAM': [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 2], [2, 4], [4, 0], [1, 3], [3, 5], [5, 1]],
  'CROSS': [[0, 1], [1, 2], [3, 0], [0, 4], [4, 5], [6, 7], [7, 8], [8, 9]]
};

const getLineStyle = (el1, el2) => {
  const mix = el1 + el2;
  if (mix.includes('fire')) return { stroke: 'rgba(255, 50, 0, 0.8)', strokeWidth: 3, strokeDasharray: '4 4' };
  if (mix.includes('water')) return { stroke: 'rgba(0, 150, 255, 0.8)', strokeWidth: 3, strokeLinecap: 'round' };
  if (mix.includes('earth')) return { stroke: 'rgba(200, 150, 50, 0.8)', strokeWidth: 4 };
  if (mix.includes('air')) return { stroke: 'rgba(200, 200, 255, 0.8)', strokeWidth: 2, strokeDasharray: '10 10' };
  return { stroke: 'rgba(255, 255, 255, 0.3)', strokeWidth: 1 };
};

const ReadingCloth = ({ deck, spreadSlots, activeSpread, placementCardId, onSlotClick, onTrayCardClick }) => {
  const forgedDeck = deck.filter(c => c.imageUrl);
  
  const spreadLayouts = {
    'TRIAD': [ { left: '20%', top: '50%' }, { left: '50%', top: '50%' }, { left: '80%', top: '50%' } ],
    'HEXAGRAM': [ { left: '50%', top: '20%' }, { left: '75%', top: '40%' }, { left: '75%', top: '70%' }, { left: '50%', top: '90%' }, { left: '25%', top: '70%' }, { left: '25%', top: '40%' } ],
    'CROSS': [ { left: '40%', top: '50%' }, { left: '40%', top: '50%', rotate: 90 }, { left: '40%', top: '80%' }, { left: '20%', top: '50%' }, { left: '40%', top: '20%' }, { left: '60%', top: '50%' }, { left: '80%', top: '85%' }, { left: '80%', top: '60%' }, { left: '80%', top: '35%' }, { left: '80%', top: '10%' } ]
  };
  
  const layout = spreadLayouts[activeSpread];
  const connections = SPREAD_CONNECTIONS[activeSpread] || [];

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex-1 relative border-2 border-[#b8860b]/30 shadow-[inset_0_0_100px_rgba(50,0,0,0.8)] overflow-hidden bg-black/60 backdrop-blur-sm">
        
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
           <circle cx="50" cy="50" r="40" stroke="#b8860b" strokeWidth="0.5" fill="none" />
           <polygon points="50,10 85,70 15,70" stroke="#b8860b" strokeWidth="0.5" fill="none" />
           <polygon points="50,90 15,30 85,30" stroke="#b8860b" strokeWidth="0.5" fill="none" />
           <circle cx="50" cy="50" r="20" stroke="#b8860b" strokeWidth="0.5" strokeDasharray="2 2" fill="none" />
        </svg>

        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {connections.map(([i, j], idx) => {
            const cardId1 = spreadSlots[i];
            const cardId2 = spreadSlots[j];
            if (cardId1 !== null && cardId2 !== null) {
              const c1 = deck.find(c => c.id === cardId1);
              const c2 = deck.find(c => c.id === cardId2);
              if (c1 && c2) {
                const el1 = normalizeElement(c1.meta);
                const el2 = normalizeElement(c2.meta);
                const style = getLineStyle(el1, el2);
                return (
                  <motion.line 
                    key={`conn-${idx}`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    x1={layout[i].left} y1={layout[i].top} 
                    x2={layout[j].left} y2={layout[j].top} 
                    {...style}
                  />
                );
              }
            }
            return null;
          })}
        </svg>

        {layout.map((pos, i) => {
          const cardId = spreadSlots[i];
          const card = cardId !== null ? deck.find(c => c.id === cardId) : null;
          return (
            <div 
              key={i} 
              onClick={() => onSlotClick(i, card)}
              className={`absolute w-24 sm:w-32 aspect-[2/3] -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${card ? 'border-2 border-[#e5c158] shadow-[0_0_20px_rgba(229,193,88,0.3)] z-20 hover:scale-105' : 'border border-red-600/30 hover:border-red-600/80 bg-red-900/10 z-10 flex items-center justify-center'}`}
              style={{ left: pos.left, top: pos.top, transform: `translate(-50%, -50%) rotate(${pos.rotate || 0}deg)` }}
            >
              {card ? (
                <>
                  <img src={card.imageUrl} className="w-full h-full object-cover pixelated" />
                  <ArcaneFrame element={normalizeElement(card.meta)} />
                </>
              ) : (
                <span className="font-header text-[10px] text-red-600/30">{i+1}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-40 border-t-2 border-[#b8860b]/50 bg-black/90 p-4 flex gap-4 overflow-x-auto overflow-y-hidden shadow-[0_-10px_20px_rgba(0,0,0,0.8)]">
        {forgedDeck.map(card => (
          <div 
            key={card.id} 
            onClick={() => onTrayCardClick(card.id)}
            className={`w-20 sm:w-24 aspect-[2/3] flex-shrink-0 cursor-pointer border-2 transition-all ${placementCardId === card.id ? 'border-[#e5c158] scale-105 shadow-[0_0_15px_rgba(229,193,88,0.5)]' : 'border-red-900/50 hover:border-red-600'}`}
          >
             <img src={card.imageUrl} className={`w-full h-full object-cover pixelated ${spreadSlots.includes(card.id) ? 'opacity-30 grayscale' : ''}`} />
          </div>
        ))}
        {forgedDeck.length === 0 && <div className="text-red-600/50 font-header text-xs flex items-center h-full">NO CARDS FORGED</div>}
      </div>
    </div>
  );
};

export default function App() {
  const [state, dispatch] = useReducer(grimoireReducer, initialState);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState([0, 0]);
  const [copied, setCopied] = useState(false);
  const [bootMessages, setBootMessages] = useState([]);
  const spiritInputRef = useRef(null);
  
  const { forgeBuzz, oracleBuzz, spiritBuzz, ritualShake } = useHaptic();
  const reducedMotion = useReducedMotion();
  useNativeShell(spiritInputRef);

  const isEgregoreActive = state.erosLevel >= 3;

  useEffect(() => {
    if (state.author && state.spiritChat.length > 1) {
      localStorage.setItem(`grimoire_${state.author}`, JSON.stringify(state.spiritChat));
    }
  }, [state.spiritChat, state.author]);

  useEffect(() => {
    const handleMove = (e) => setMousePosition([e.clientX, e.clientY]);
    window.addEventListener('pointermove', handleMove, { passive: true });
    const handleOnline = () => dispatch({ type: 'SET_OFFLINE', payload: false });
    const handleOffline = () => dispatch({ type: 'SET_OFFLINE', payload: true });
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (state.errorMessage) {
      const t = setTimeout(() => dispatch({ type: 'CLEAR_ERROR_MESSAGE' }), 5000);
      return () => clearTimeout(t);
    }
  }, [state.errorMessage]);

  const handleRitualInitiation = useCallback(async () => {
    if (!state.author.trim()) return;
    
    unlockAudioContext();

    dispatch({ type: 'INITIATE_RITUAL' });
    setBootMessages(["> ESTABLISHING ETHEREAL LINK..."]);
    ritualShake();
    
    try {
      const erosContext = getErosContext(state.erosLevel);
      const techContext = TECH_LEVELS[state.techLevel].instruction;
      
      const geminiPromise = fetchGemini(`Role: Supreme Adept of the ${state.selectedTradition.name}. Task: Synthesize "${state.author}" into a consultation dossier for a fixed canonical 78-card Tarot deck. The deck identities and display labels are constructed locally from the canonical semantic contract; you MUST NOT generate, rename, reorder, or return card identities. Style: ${state.selectedStyle.prompt}. Instructions: 1. Write a 200-word Thesis (Dossier) analyzing the subject's weight. 2. Generate 3 profound questions to ask this deck (Oracle Suggestions). 3. TONE: ${techContext} ${erosContext} Return JSON: {"dossier": "string", "questions": ["Question 1", "Question 2", "Question 3"]}`, true, 'ritual');
      
      setTimeout(() => setBootMessages(prev => [...prev, "> INDEXING ARCHETYPES..."]), 800);
      setTimeout(() => setBootMessages(prev => [...prev, "> CALIBRATING PLANETARY LATTICE..."]), 1600);
      setTimeout(() => setBootMessages(prev => [...prev, "> BINDING SUBJECT SIGNATURE..."]), 2400);

      const initRes = await geminiPromise;
      setBootMessages(prev => [...prev, "> MANIFESTING AVATAR..."]);

      const eroticPrompt = getErosPrompt(state.erosLevel);
      let portUrl = null;
      try { portUrl = await fetchImagen(`${state.selectedStyle.prompt} Portrait of ${state.author}. ${eroticPrompt}. Masterpiece, glowing magic.`); } catch (imgError) {}
      
      setBootMessages(prev => [...prev, "> RITUAL COMPLETE. OPENING SCRIPTORIUM."]);
      ritualShake();
      
      setTimeout(() => {
        dispatch({ type: 'RITUAL_SUCCESS', payload: { dossier: initRes.dossier, portrait: portUrl, questions: initRes.questions } });
        const savedChat = localStorage.getItem(`grimoire_${state.author}`);
        if (savedChat) {
          try {
            const parsed = JSON.parse(savedChat);
            if (Array.isArray(parsed)) dispatch({ type: 'LOAD_SPIRIT_HISTORY', payload: parsed });
          } catch(e) {}
        }
      }, 800);

    } catch (e) {
      dispatch({ type: 'RITUAL_FAILURE', payload: e.message });
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: `Ritual Interrupted: ${e.message || "Ethereal connection lost."}` });
    }
  }, [state.author, state.selectedStyle, state.selectedTradition, state.erosLevel, state.techLevel, ritualShake]);

  const generateCardData = async (card, setStatusCb = null, imageOptions = {}) => {
    const erosContext = getErosContext(state.erosLevel);
    const erosPrompt = getErosPrompt(state.erosLevel);
    const techContext = TECH_LEVELS[state.techLevel].instruction;
    const canonicalContext = getCanonicalCardPromptContext({
      card,
      tradition: state.selectedTradition,
    });
    const canonicalFacts = canonicalContext?.sourceQualification === 'SOURCE_QUALIFIED'
      ? JSON.stringify({
          cardId: canonicalContext.cardId,
          expression: canonicalContext.canonicalExpression,
          correspondences: canonicalContext.canonicalCorrespondences,
        })
      : 'No source-qualified canonical fact pack is active for this selected Tarot system.';
    if (setStatusCb) setStatusCb(card.exegesis && card.meta ? "PREPARING IMAGE..." : "SCRIBING EXEGESIS...");
    const reusingStoredInterpretation = Boolean(card.exegesis && card.meta);
    const inheritedModelAuthority = card.interpretiveMetaAuthority === 'MODEL_GENERATED_REFLECTION';
    let data;
    if (reusingStoredInterpretation) {
        data = { exegesis: card.exegesis, meta: card.meta, visual: card.visual }; 
    } else {
        data = await fetchGemini(`Role: Grand Master of ${state.selectedTradition.name}. Task: Card interpretation for "${card.name}" linked to "${state.author}". Instructions: - Exegesis: 200-word analysis. - Meta: Hebrew Letter, Astrological Ruler, Alchemical Stage, Grimoire Spirit. - Visual: Description for art generation (${state.selectedStyle.name}). - CANONICAL SOURCE CONTEXT: ${canonicalFacts}. Preserve these facts exactly. The requested Meta fields are generated interpretive reflection only; do not present them as historical source facts. - TONE: ${techContext} ${erosContext} Return JSON: {"exegesis": "string", "meta": { "hebrew": "string", "planet": "string", "alchemical": "string", "daimon": "string", "gematria": number }, "visual": "string"}`, true, 'card');
    }
    const compiledPrompt = compileTarotImagePrompt({
      cardName: card.name,
      invocationSubject: state.author,
      traditionName: state.selectedTradition.name,
      styleName: state.selectedStyle.name,
      stylePrompt: state.selectedStyle.prompt,
      visual: data.visual,
      erosPrompt,
      meta: data.meta,
      canonicalContext,
    });
    const hasStoredPrompt = Boolean(imageOptions.prompt || card.promptUsed);
    const fullPrompt = imageOptions.prompt || card.promptUsed || compiledPrompt;
    const promptSchema = hasStoredPrompt ? (card.promptSchema || 'legacy-flat-v1') : TAROT_PROMPT_SCHEMA;
    const renderMode = imageOptions.mode || IMAGE_MODES.preview;
    if (setStatusCb) setStatusCb(describeJobProgress({ status: 'queued' }, { kind: 'image', mode: renderMode }));
    // Do not auto-retry a local render. It may still be running after a tunnel
    // interruption; the explicit retry action is the safe place to submit again.
    const rendered = await fetchImageGeneration(fullPrompt, imageOptions, snapshot => {
      if (setStatusCb) setStatusCb(describeJobProgress(snapshot, { kind: 'image', mode: renderMode }));
    });
    return {
      ...card,
      ...data,
      canonicalCardId: canonicalContext?.cardId || card.canonicalCardId || null,
      exegesisAuthority: card.exegesisAuthority || ((!reusingStoredInterpretation || inheritedModelAuthority) ? 'MODEL_GENERATED_INTERPRETATION' : 'LEGACY_UNCLASSIFIED_INTERPRETATION'),
      interpretiveMetaAuthority: card.interpretiveMetaAuthority || (reusingStoredInterpretation ? 'LEGACY_UNCLASSIFIED_REFLECTION' : 'MODEL_GENERATED_REFLECTION'),
      visualAuthority: card.visualAuthority || ((!reusingStoredInterpretation || inheritedModelAuthority) ? 'MODEL_GENERATED_IMAGE_DIRECTION' : 'LEGACY_UNCLASSIFIED_IMAGE_DIRECTION'),
      imageUrl: rendered.imageUrl,
      promptUsed: fullPrompt,
      promptSchema,
      generation: rendered.generation,
    };
  };

  const handleForgeCard = useCallback(async (card) => {
    if (card.exegesis && card.imageUrl) { 
      playRitualSting(card.meta?.alchemical);
      dispatch({ type: 'OPEN_CARD', payload: card }); 
      return; 
    }
    dispatch({ type: 'FORGE_CARD_START', payload: card });
    try {
      const full = await generateCardData(card, (msg) => dispatch({ type: 'SET_REFORGE_STATUS', payload: msg }));
      forgeBuzz();
      playRitualSting(full.meta?.alchemical);
      dispatch({ type: 'FORGE_CARD_SUCCESS', payload: full });
    } catch (e) {
      dispatch({ type: 'FORGE_CARD_FAILURE', payload: e.message });
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: `Forge Failed: ${e.message}` });
    }
  }, [state.author, state.selectedStyle, state.selectedTradition, state.erosLevel, state.techLevel]);

  const handleRetryCard = useCallback(async (card) => {
    dispatch({ type: 'FORGE_CARD_START', payload: card });
    try {
      const full = await generateCardData(
        card,
        (msg) => dispatch({ type: 'SET_REFORGE_STATUS', payload: msg }),
        { mode: IMAGE_MODES.preview, prompt: card.promptUsed || undefined },
      );
      forgeBuzz();
      dispatch({ type: 'FORGE_CARD_SUCCESS', payload: full });
    } catch (e) {
      dispatch({ type: 'FORGE_CARD_FAILURE', payload: e.message });
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: `Re-Manifest Failed: ${e.message}` });
    }
  }, [state.author, state.selectedStyle, state.selectedTradition, state.erosLevel, state.techLevel]);

  const handleFinalizeCard = useCallback(async (card) => {
    if (!canFinalizeCard(card)) {
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: 'Re-manifest this card once to capture a reproducible preview seed before finalizing.' });
      return;
    }
    dispatch({ type: 'FORGE_CARD_START', payload: card });
    dispatch({ type: 'SET_REFORGE_STATUS', payload: 'FINALIZING IMAGE...' });
    try {
      const full = await generateCardData(
        card,
        (msg) => dispatch({ type: 'SET_REFORGE_STATUS', payload: msg }),
        {
          mode: IMAGE_MODES.final,
          seed: card.generation.seed,
          prompt: card.promptUsed,
        },
      );
      forgeBuzz();
      dispatch({ type: 'FORGE_CARD_SUCCESS', payload: full });
    } catch (e) {
      dispatch({ type: 'FORGE_CARD_FAILURE', payload: e.message });
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: `Finalize Failed: ${e.message}` });
    }
  }, [state.author, state.selectedStyle, state.selectedTradition, state.erosLevel, state.techLevel]);

  const handleRefineCard = useCallback(async (card) => {
    if (!canRefineCard(card)) {
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: 'Re-manifest this card once so the Mac can retain its ComfyUI source reference before refining.' });
      return;
    }
    dispatch({ type: 'FORGE_CARD_START', payload: card });
    dispatch({ type: 'SET_REFORGE_STATUS', payload: 'REFINING IMAGE...' });
    try {
      const full = await generateCardData(
        card,
        (msg) => dispatch({ type: 'SET_REFORGE_STATUS', payload: msg }),
        {
          mode: IMAGE_MODES.refine,
          seed: card.generation.seed,
          prompt: card.promptUsed,
          sourceImage: card.generation.providerImage,
        },
      );
      forgeBuzz();
      dispatch({ type: 'FORGE_CARD_SUCCESS', payload: full });
    } catch (e) {
      dispatch({ type: 'FORGE_CARD_FAILURE', payload: e.message });
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: `Refine Failed: ${e.message}` });
    }
  }, [state.author, state.selectedStyle, state.selectedTradition, state.erosLevel, state.techLevel]);

  const handleOracleConsultation = useCallback(async () => {
    if (!state.oracleQuestion) return;
    dispatch({ type: 'CONSULT_ORACLE_START' });

    const erosContext = getErosContext(state.erosLevel);
    const techContext = TECH_LEVELS[state.techLevel].instruction;
    let prepared;
    try {
      prepared = prepareCanonicalOracleConsultation({
        deck: state.deck,
        activeSpread: state.activeSpread,
        spreadSlots: state.spreadSlots,
        question: state.oracleQuestion,
        tradition: state.selectedTradition,
        author: state.author,
        readingDepth: 'adept',
        techContext,
        erosContext,
      });
    } catch (e) {
      dispatch({ type: 'CONSULT_ORACLE_FAILURE' });
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: `Oracle Canonicalization Failed: ${e.message}` });
      return;
    }

    const drawn = prepared.cards;
    const updatedCards = await Promise.all(drawn.map(async (c) => {
      if (!c.exegesis || !c.imageUrl) {
        try { return await generateCardData(c); } catch (e) { return c; }
      }
      return c;
    }));
    const newDeck = state.deck.map(deckCard => {
      const newlyForged = updatedCards.find(u => u.id === deckCard.id);
      return newlyForged || deckCard;
    });

    try {
      const canonicalPrompt = buildCanonicalOracleSynthesisPrompt({
        author: state.author,
        traditionName: state.selectedTradition.name,
        techContext,
        erosContext,
        record: prepared.record,
        cards: updatedCards,
      });
      const res = await fetchGemini(canonicalPrompt, true, 'oracle');
      oracleBuzz();
      dispatch({
        type: 'CONSULT_ORACLE_SUCCESS',
        payload: {
          cards: updatedCards,
          answer: res.answer,
          updatedDeck: newDeck,
          readingRecord: prepared.record,
          selectionSource: prepared.selectionSource,
        },
      });
    } catch (e) {
      dispatch({ type: 'CONSULT_ORACLE_FAILURE' });
      dispatch({ type: 'SET_STATUS', payload: 'ORACLE SILENT' });
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: `Oracle Disconnected: ${e.message || 'Connection lost'}` });
    }
  }, [
    state.oracleQuestion,
    state.deck,
    state.author,
    state.selectedTradition,
    state.erosLevel,
    state.techLevel,
    state.activeSpread,
    state.spreadSlots,
  ]);

  const handleSpiritMessage = useCallback(async (overrideText = null) => {
    const input = overrideText || state.spiritInput;
    if (!input.trim()) return;
    dispatch({ type: 'SET_SPIRIT_INPUT', payload: '' });
    dispatch({ type: 'ADD_SPIRIT_MSG', payload: { role: 'user', text: input } });
    dispatch({ type: 'SET_SPIRIT_TYPING', payload: true });
    try {
      const techContext = TECH_LEVELS[state.techLevel].instruction;
      const prompt = `Role: The Spirit of ${state.author} (${state.selectedTradition.name}). User: "${input}". Reply profoundly. Tone: ${techContext}`;
      const reply = await fetchGemini(prompt, false); 
      spiritBuzz();
      dispatch({ type: 'ADD_SPIRIT_MSG', payload: { role: 'ai', text: reply } });
    } catch (e) {
      dispatch({ type: 'ADD_SPIRIT_MSG', payload: { role: 'system', text: 'SIGNAL INTERRUPTED' } });
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: 'Spirit Box interference detected.' });
    }
    dispatch({ type: 'SET_SPIRIT_TYPING', payload: false });
  }, [state.spiritInput, state.author, state.selectedTradition, state.techLevel]);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return dispatch({ type: 'SET_ERROR_MESSAGE', payload: "Vocal manifestation not supported by this vessel."});
    const recognition = new SpeechRecognition();
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      if (event.results[0].isFinal) handleSpiritMessage(text);
      else dispatch({ type: 'SET_SPIRIT_INPUT', payload: text });
    };
    recognition.start();
  };

  const handleSwipePrev = useCallback(() => {
    if (!state.focusedCard || state.deck.length === 0 || state.isForging) return;
    const currentIndex = state.deck.findIndex(c => c.id === state.focusedCard.id);
    if (currentIndex === -1) return;
    const prevCard = state.deck[(currentIndex - 1 + state.deck.length) % state.deck.length];
    handleForgeCard(prevCard);
  }, [state.focusedCard, state.deck, handleForgeCard, state.isForging]);

  const handleSwipeNext = useCallback(() => {
    if (!state.focusedCard || state.deck.length === 0 || state.isForging) return;
    const currentIndex = state.deck.findIndex(c => c.id === state.focusedCard.id);
    if (currentIndex === -1) return;
    const nextCard = state.deck[(currentIndex + 1) % state.deck.length];
    handleForgeCard(nextCard);
  }, [state.focusedCard, state.deck, handleForgeCard, state.isForging]);

  const touchStartPos = useRef({ x: null, y: null });
  const handleTouchStart = (e) => { 
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; 
  };
  
  const handleTouchEnd = (e) => {
    if (touchStartPos.current.x === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartPos.current.x - touchEndX;
    const diffY = touchStartPos.current.y - touchEndY;
    if (Math.abs(diffX) > 50 && Math.abs(diffY) < 40) {
      if (diffX > 0) handleSwipeNext(); 
      else handleSwipePrev();           
    }
    touchStartPos.current = { x: null, y: null };
  };

  const triggerTextArchive = async ({ content, extension, mimeType, label }) => {
    const safeAuthor = state.author.trim().replace(/[^a-z0-9._-]+/gi, '_') || 'UNTITLED';
    const fileName = `GRIMOIRE_${safeAuthor}.${extension}`;

    if (Capacitor.isNativePlatform()) {
      try {
        const saved = await Filesystem.writeFile({
          path: fileName,
          data: content,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        await Share.share({
          title: `${state.author || 'Grimoire'} ${label}`,
          dialogTitle: `Save or share the ${label.toLowerCase()}`,
          files: [saved.uri],
        });
        dispatch({ type: 'RESET_ARCHIVE' });
      } catch (error) {
        dispatch({ type: 'SET_ERROR_MESSAGE', payload: `Archive Failed: ${error.message || 'Unable to open the native share sheet.'}` });
      }
      return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    dispatch({ type: 'RESET_ARCHIVE' });
  };

  const handleHtmlArchive = () => triggerTextArchive({
    content: generateGrimoireHtmlDocument(state, state.deck),
    extension: 'html',
    mimeType: 'text/html',
    label: 'HTML Archive',
  });

  const handleJsonArchive = () => triggerTextArchive({
    content: serializeGrimoireArchive({ state, deck: state.deck }),
    extension: 'json',
    mimeType: 'application/json',
    label: 'Restorable JSON Archive',
  });

  const handleRestoreJsonArchive = () => {
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = 'application/json,.json';
    picker.style.display = 'none';
    const cleanup = () => picker.remove();
    picker.addEventListener('cancel', cleanup, { once: true });
    picker.onchange = async () => {
      const file = picker.files?.[0];
      if (!file) {
        cleanup();
        return;
      }
      try {
        const parsed = parseGrimoireArchive(await file.text());
        const restored = buildArchiveRestoreState({
          envelope: parsed.envelope,
          styles: ART_STYLES,
          traditions: TRADITIONS,
        });
        dispatch({ type: 'RESTORE_ARCHIVE', payload: restored });
        if (parsed.contractStatus !== 'CURRENT_CONTRACT_MATCH') {
          dispatch({
            type: 'SET_ERROR_MESSAGE',
            payload: parsed.migratedLegacy
              ? 'Legacy archive restored. Canonical semantic provenance was not present in that archive.'
              : 'Archive restored from a different canonical semantic contract. Historical ReadingRecord preserved without being reclassified as current.',
          });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR_MESSAGE', payload: `Archive Restore Failed: ${error.message || 'Invalid JSON archive.'}` });
      } finally {
        cleanup();
      }
    };
    document.body.appendChild(picker);
    picker.click();
  };

  const handleGrandForge = async () => {
    dispatch({ type: 'START_ARCHIVE' });
    let compiledDeck = [...state.deck];
    const missing = compiledDeck.filter(c => !c.imageUrl || !c.exegesis); 
    for (let i = 0; i < missing.length; i++) {
      const card = missing[i];
      const timeEst = Math.ceil((missing.length - i) * 6.5);
      dispatch({ type: 'UPDATE_ARCHIVE_PROGRESS', payload: { current: i + 1, total: missing.length, msg: `FORGING: ${card.name} (~${timeEst}s remaining)` } });
      try {
        const fullCard = await generateCardData(card);
        const idx = compiledDeck.findIndex(x => x.id === card.id);
        if (idx !== -1) compiledDeck[idx] = fullCard;
        dispatch({ type: 'SET_DECK', payload: [...compiledDeck] }); 
      } catch (e) {}
      // Paced rate-limit protection
      if (i < missing.length - 1) {
        await new Promise(r => setTimeout(r, 4000));
      }
    }
    dispatch({ type: 'ARCHIVE_READY' });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea'); el.value = text;
      document.body.appendChild(el); el.select(); document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleSlotClick = (index, card) => {
    if (state.placementCardId !== null) {
      dispatch({ type: 'PLACE_CARD_IN_SLOT', payload: index });
      playRitualSting();
    } else if (card) {
      dispatch({ type: 'OPEN_CARD', payload: card });
    }
  };

  const currentView = state.phase.toLowerCase();
  const forgedCount = state.deck.filter(c => c.imageUrl).length;
  const getMostDrawn = () => state.deck.length > 0 ? [...state.deck].sort((a,b) => (b.patina||0) - (a.patina||0))[0] : null;
  const getDominantStage = () => {
    const counts = {};
    state.deck.forEach(c => { if(c.meta?.alchemical) counts[c.meta.alchemical] = (counts[c.meta.alchemical] || 0) + 1; });
    return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'Unknown';
  };
  const getWordCloud = () => {
    const words = state.spiritChat.flatMap(m => m.text.toLowerCase().split(/\W+/)).filter(w => w.length > 4);
    const counts = {}; words.forEach(w => counts[w] = (counts[w] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  return (
    <div className="min-h-[100dvh] bg-transparent text-red-600 font-mono selection:bg-red-600 selection:text-black overflow-x-hidden relative flex flex-col">
      <style>{`
        .font-header { font-family: 'Press Start 2P', cursive; }
        .font-body { font-family: 'VT323', monospace; font-size: 1.4rem; }
        .neon-border { box-shadow: 0 0 15px #ff0000, inset 0 0 5px #ff0000; border: 2px solid #ff0000; }
        .neon-text { text-shadow: 0 0 8px #ff0000; }
        .scanlines { background: linear-gradient(rgba(18, 0, 0, 0) 50%, rgba(50, 0, 0, 0.25) 50%); background-size: 100% 4px; position: fixed; inset: 0; pointer-events: none; z-index: 90; }
        @keyframes egregore-glitch { 0% { transform: translate(0) } 20% { transform: translate(-2px, 1px) } 40% { transform: translate(-1px, -1px) } 60% { transform: translate(2px, 1px) } 80% { transform: translate(1px, -1px) } 100% { transform: translate(0) } }
        .egregore-glitch { animation: egregore-glitch 2s infinite; color: #cc0000; text-shadow: 2px 0 red, -2px 0 blue; }
      `}</style>

      <LivingBackground mousePosition={mousePosition} reducedMotion={reducedMotion} />
      <div className="scanlines" />
      <AudioController />

      <AnimatePresence>
        {state.isOffline && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-[calc(4rem+env(safe-area-inset-top))] left-0 right-0 bg-red-900 text-white text-xs font-header p-2 text-center z-[55] flex items-center justify-center gap-2 shadow-[0_0_10px_#900]">
             <WifiOff size={14}/> NO ETHEREAL CONNECTION DETECTED. EXPECT DISTURBANCES.
          </motion.div>
        )}
        {state.errorMessage && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-[calc(6rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 bg-black border border-red-600 text-red-600 text-xs font-header p-4 z-[60] shadow-[0_0_15px_#f00] max-w-md w-[90%] text-center cursor-pointer" onClick={() => dispatch({ type: 'CLEAR_ERROR_MESSAGE' })}>
             <AlertTriangle size={16} className="inline mr-2 -mt-1"/> {state.errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed top-0 inset-x-0 h-[calc(4rem+env(safe-area-inset-top))] z-50 flex items-center justify-between pt-[env(safe-area-inset-top)] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] bg-black/90 border-b-2 border-red-600 backdrop-blur-md shadow-[0_0_20px_rgba(255,0,0,0.4)]">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => dispatch({ type: 'RETURN_TO_LANDING' })}>
          <div className="w-8 h-8 bg-red-600 flex items-center justify-center text-black font-header font-bold text-xs shadow-[0_0_10px_#ff0000]">Θ</div>
          <span className="hidden sm:block text-xs font-header neon-text"><GlitchText text="GRIMOIRE OS" isEgregore={isEgregoreActive} /></span>
        </div>
        <div className="flex items-center gap-2">
          {currentView === 'scriptorium' && (
            <>
              <button onClick={() => dispatch({ type: 'TOGGLE_SPIRIT_BOX' })} className="flex items-center gap-2 px-3 py-2 bg-black border border-red-600 text-xs font-header hover:bg-red-600 hover:text-black transition-all shadow-[0_0_10px_#ff000033]">
                <MessageSquare size={14} /> <span className="hidden md:inline">SPIRIT</span>
              </button>
              <button onClick={() => dispatch({ type: 'OPEN_ORACLE' })} className="flex items-center gap-2 px-3 py-2 bg-black border border-red-600 text-xs font-header hover:bg-red-600 hover:text-black transition-all shadow-[0_0_10px_#ff000033]">
                <Eye size={14} /> <span className="hidden md:inline">ORACLE</span>
              </button>
              <button onClick={() => dispatch({ type: 'OPEN_ARCHIVE_PROMPT' })} className="flex items-center gap-2 px-3 py-2 bg-black border border-red-600 text-xs font-header hover:bg-red-600 hover:text-black transition-all shadow-[0_0_10px_#ff000033]">
                <Download size={14} /> <span className="hidden md:inline">ARCHIVE</span>
              </button>
            </>
          )}
          {currentView === 'oracle' && state.reading && (
            <button onClick={() => dispatch({ type: 'OPEN_ARCHIVE_PROMPT' })} className="flex items-center gap-2 px-3 py-2 bg-black border border-red-600 text-xs font-header hover:bg-red-600 hover:text-black transition-all shadow-[0_0_10px_#ff000033]">
              <Download size={14} /> <span className="hidden md:inline">ARCHIVE</span>
            </button>
          )}
          <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-black border border-red-600 text-xs font-header hover:bg-red-600 hover:text-black transition-all shadow-[0_0_10px_#ff000033]"><Menu size={14} /></button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-y-0 right-0 w-full max-w-80 bg-black border-l-2 border-red-600 z-[60] pt-[calc(1.5rem+env(safe-area-inset-top))] pr-[max(1.5rem,env(safe-area-inset-right))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] pl-6 shadow-[0_0_50px_#ff000033] overflow-y-auto native-scroll">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-red-600/30">
              <h2 className="font-header text-red-600 neon-text">CODEX</h2>
              <button onClick={() => setIsMenuOpen(false)}><X/></button>
            </div>
            {currentView === 'scriptorium' && (
               <button onClick={() => { setIsMenuOpen(false); dispatch({ type: 'TOGGLE_STATS' }); }} className="w-full mb-8 flex justify-center items-center gap-2 px-3 py-4 bg-red-600/10 border border-red-600 text-xs font-header hover:bg-red-600 hover:text-black transition-all shadow-[0_0_10px_#ff000033]">
                 <BarChart3 size={14}/> ARCANE STATS
               </button>
            )}
            <div className="p-4 border border-[#b8860b]/50 bg-[#b8860b]/10 mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-header text-[#b8860b] flex items-center gap-2"><Brain size={12}/> INTELLECT</span>
                <span className="text-xs font-header text-white">{TECH_LEVELS[state.techLevel].label}</span>
              </div>
              <input type="range" min="0" max="2" step="1" value={state.techLevel} onChange={(e) => dispatch({ type: 'SET_TECH_LEVEL', payload: parseInt(e.target.value) })} className="w-full accent-[#b8860b]" />
              <p className="text-[10px] mt-2 text-[#b8860b]/60 font-body">{TECH_LEVELS[state.techLevel].desc}</p>
            </div>
            <div className="p-4 border border-[#b8860b]/50 bg-[#b8860b]/10 mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-header text-[#b8860b] flex items-center gap-2"><Heart size={12}/> EROS</span>
                <span className="text-xs font-header text-white">{EROS_LEVELS[state.erosLevel].label}</span>
              </div>
              <input type="range" min="0" max="5" step="1" value={state.erosLevel} onChange={(e) => dispatch({ type: 'SET_EROS_LEVEL', payload: parseInt(e.target.value) })} className="w-full accent-[#b8860b]" />
            </div>
            <div className="mb-6">
              <h3 className="font-header text-xs mb-2 opacity-50 text-[#b8860b]">TRADITION</h3>
              {TRADITIONS.map(t => (
                <button key={t.id} onClick={() => dispatch({ type: 'SET_TRADITION', payload: t })} className={`block w-full text-left p-2 mb-2 border ${state.selectedTradition.id === t.id ? 'bg-[#b8860b] text-black border-[#b8860b]' : 'border-[#b8860b]/30 text-[#b8860b] hover:border-[#b8860b]'}`}>{t.name}</button>
              ))}
            </div>
            <div className="mb-6">
              <h3 className="font-header text-xs mb-2 opacity-50 text-[#b8860b]">STYLE ({ART_STYLES.length})</h3>
              {ART_STYLES.map(s => (
                <button key={s.id} onClick={() => dispatch({ type: 'SET_STYLE', payload: s })} className={`block w-full text-left p-2 mb-2 border ${state.selectedStyle.id === s.id ? 'bg-[#b8860b] text-black border-[#b8860b]' : 'border-[#b8860b]/30 text-[#b8860b] hover:border-[#b8860b]'}`}>{s.name}</button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentView === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-[100dvh] pt-[calc(5rem+env(safe-area-inset-top))] pr-[max(1.5rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] flex flex-col items-center justify-center text-center z-10 relative flex-1">
            <h1 className="text-4xl sm:text-6xl font-header text-red-600 mb-8 neon-text"><GlitchText text="ARCHETYPE" /></h1>
            <div className="w-full max-w-lg bg-black/80 neon-border p-6 backdrop-blur-md shadow-[0_0_50px_#ff000033]">
              <div className="mb-6 grid grid-cols-2 gap-2 border-b border-red-600/30 pb-6">
                <div className="text-[10px] font-header text-left opacity-50">TRADITION:</div>
                <div className="text-[10px] font-header text-right text-red-600">{state.selectedTradition.name}</div>
                <div className="text-[10px] font-header text-left opacity-50">STYLE:</div>
                <div className="text-[10px] font-header text-right text-red-600">{state.selectedStyle.name}</div>
              </div>
              <input value={state.author} onChange={(e) => dispatch({ type: 'SET_AUTHOR', payload: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleRitualInitiation()} enterKeyHint="go" autoCapitalize="words" placeholder="INSERT SUBJECT..." className="native-text-input w-full bg-black/40 border border-red-600/50 p-4 text-center font-header text-red-600 focus:outline-none focus:border-red-600 transition-all mb-6" />
              <button onClick={handleRitualInitiation} className="w-full py-4 bg-red-600 text-black font-header text-sm hover:bg-white transition-colors shadow-[0_0_15px_#ff0000]">INITIATE RITUAL</button>
              <button onClick={handleRestoreJsonArchive} className="w-full mt-3 py-3 border border-red-600/70 text-red-500 font-header text-[10px] hover:bg-red-600 hover:text-black transition-colors">
                RESTORE ARCHIVE FROM JSON
              </button>
              {!Capacitor.isNativePlatform() && (
                <a href="/vr" className="block w-full mt-3 py-3 border border-[#b8860b] text-[#d6b45b] font-header text-[10px] hover:bg-[#b8860b] hover:text-black transition-colors shadow-[0_0_12px_#b8860b44]">
                  ENTER VR PROTOTYPE
                </a>
              )}
            </div>
          </motion.div>
        )}

        {currentView === 'ritual' && (
          <motion.div key="ritual" className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center pt-[max(1.5rem,env(safe-area-inset-top))] pr-[max(1.5rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] text-left border-[10px] border-red-900 shadow-[inset_0_0_100px_#f00]">
             <div className="w-full max-w-lg bg-black/90 border border-red-600 p-8 shadow-[0_0_30px_#ff0000]">
                <Gamepad2 size={40} className="text-red-600 mb-6 animate-pulse" />
                <div className="space-y-4 font-header text-xs text-red-600">
                  {bootMessages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                      {msg}
                    </motion.div>
                  ))}
                  <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-3 h-4 bg-red-600 mt-4" />
                </div>
             </div>
          </motion.div>
        )}

        {currentView === 'scriptorium' && (
          <motion.div 
            key="scriptorium" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="pt-[calc(5rem+env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] w-full max-w-[1400px] mx-auto z-10 relative flex flex-col min-h-[100dvh]"
          >
            <motion.div
               animate={isEgregoreActive ? { scale: [1, 1.005, 1], filter: ['hue-rotate(0deg)', 'hue-rotate(5deg)', 'hue-rotate(0deg)'] } : {}}
               transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
               className="w-full h-full flex flex-col flex-1"
            >
              <header className="flex flex-col md:flex-row gap-6 lg:gap-10 mb-6 flex-shrink-0 items-center md:items-start text-center md:text-left bg-black/50 border border-red-900 p-4 backdrop-blur-sm">
                <div className="w-24 h-24 sm:w-32 sm:h-32 neon-border bg-black shadow-[0_0_20px_#ff000033] overflow-hidden flex-shrink-0 relative group rounded-sm">
                  {state.portrait ? <img src={state.portrait} className="w-full h-full object-cover pixelated" /> : <div className="w-full h-full flex items-center justify-center opacity-30"><User size={48}/></div>}
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-2xl sm:text-3xl font-header text-red-600 leading-tight neon-text break-words pr-4">
                       <GlitchText text={state.author} isEgregore={isEgregoreActive} />
                    </h2>
                    
                    <div className="flex border border-red-600/50 bg-black font-header text-[10px]">
                      <button onClick={() => dispatch({ type: 'SET_SCRIPTORIUM_MODE', payload: 'DECK' })} className={`flex items-center gap-2 px-4 py-2 transition-colors ${state.scriptoriumMode === 'DECK' ? 'bg-red-600 text-black' : 'text-red-600 hover:bg-red-900/30'}`}>
                        <LayoutGrid size={12}/> DECK
                      </button>
                      <button onClick={() => dispatch({ type: 'SET_SCRIPTORIUM_MODE', payload: 'CLOTH' })} className={`flex items-center gap-2 px-4 py-2 transition-colors ${state.scriptoriumMode === 'CLOTH' ? 'bg-[#b8860b] text-black border-l border-[#b8860b]' : 'text-[#b8860b] border-l border-red-600/50 hover:bg-[#b8860b]/20'}`}>
                        <Hexagon size={12}/> CLOTH
                      </button>
                    </div>
                  </div>

                  <div className="hidden sm:block overflow-y-auto max-h-32">
                    <p className={`font-body text-base text-red-600/80 leading-relaxed ${isEgregoreActive ? 'egregore-glitch' : ''}`}>{state.dossier}</p>
                  </div>
                </div>
              </header>
              
              <div className={`w-full relative mt-2 border-t border-red-600/30 pt-4 flex-1 ${isEgregoreActive ? 'shadow-[0_-5px_30px_#900]' : ''}`} style={{ minHeight: '500px' }}>
                {state.scriptoriumMode === 'DECK' ? (
                  <VirtualDeckGrid deck={state.deck} onCardClick={handleForgeCard} isForging={state.isForging} focusedCardId={state.focusedCard?.id} reducedMotion={reducedMotion} />
                ) : (
                  <div className="absolute inset-0 flex flex-col">
                    <div className="flex justify-center gap-4 mb-4 flex-shrink-0">
                      {['TRIAD', 'HEXAGRAM', 'CROSS'].map(s => (
                        <button key={s} onClick={() => dispatch({ type: 'SET_ACTIVE_SPREAD', payload: s })} className={`px-3 py-1 font-header text-[10px] border transition-colors ${state.activeSpread === s ? 'border-[#b8860b] text-[#b8860b] bg-[#b8860b]/10' : 'border-red-900/50 text-red-600/50 hover:border-red-600'}`}>{s}</button>
                      ))}
                    </div>
                    <ReadingCloth deck={state.deck} spreadSlots={state.spreadSlots} activeSpread={state.activeSpread} placementCardId={state.placementCardId} onSlotClick={handleSlotClick} onTrayCardClick={(id) => dispatch({ type: 'SET_PLACEMENT_CARD', payload: state.placementCardId === id ? null : id })} />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {currentView === 'oracle' && (
          <motion.div key="oracle" className="min-h-[100dvh] pt-[calc(8rem+env(safe-area-inset-top))] pr-[max(1.5rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] flex flex-col items-center max-w-4xl mx-auto z-20 relative">
            <h2 className="text-6xl font-header text-red-600 mb-12 neon-text text-center"><GlitchText text="THE ORACLE" isEgregore={isEgregoreActive} /></h2>
            {!state.reading && !state.isConsulting && (
              <div className="w-full space-y-8 bg-black/60 p-8 border border-red-900 backdrop-blur-md">
                {state.suggestedQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-8">
                    {state.suggestedQuestions.map((q, i) => (
                      <button key={i} onClick={() => dispatch({ type: 'SET_ORACLE_QUESTION', payload: q })} className="px-3 py-2 border border-red-600/30 text-red-600/80 text-xs font-header hover:bg-red-600/20">{q}</button>
                    ))}
                  </div>
                )}
                <textarea value={state.oracleQuestion} onChange={(e) => dispatch({ type: 'SET_ORACLE_QUESTION', payload: e.target.value })} placeholder="INSCRIBE INQUIRY..." className="w-full bg-black/50 border-2 border-red-600 p-8 text-xl min-h-[200px] font-body text-red-600 uppercase focus:outline-none focus:shadow-[0_0_20px_#ff0000] transition-shadow" />
                <button onClick={handleOracleConsultation} className="w-full py-6 text-xl border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-black transition-all font-header shadow-[0_0_10px_#ff0000]">CAST READING</button>
                <button onClick={() => dispatch({ type: 'RETURN_TO_SCRIPTORIUM' })} className="w-full text-xs font-header text-red-600/40 hover:text-red-600 uppercase">RETURN</button>
              </div>
            )}
            
            {state.isConsulting && (
              <div className="w-full flex flex-col items-center justify-center py-32 border border-red-900 bg-black/80 shadow-[0_0_50px_#f00]">
                <RefreshCw size={64} className="text-red-600 animate-spin mb-8" />
                <h3 className="font-header text-red-600 text-xl animate-pulse text-center">COMMUNING WITH DEEP STRUCTURE...</h3>
              </div>
            )}

            {state.reading && !state.isConsulting && (
              <div className="w-full space-y-12 pb-40">
                <div className="flex justify-center gap-6">
                  {state.reading.cards.map((c, i) => (
                    <div key={i} className="w-28 sm:w-40 aspect-[2/3.4] border-2 border-red-600 bg-black/40 shadow-[0_0_20px_#ff000033] relative">
                      {c.imageUrl ? <><img src={c.imageUrl} className="w-full h-full object-cover pixelated" /><ArcaneFrame element={normalizeElement(c.meta)}/></> : <CardSkeleton />}
                    </div>
                  ))}
                </div>
                <div className="p-10 border-2 border-red-600 bg-black/80 text-xl leading-relaxed text-red-600 font-body shadow-[0_0_30px_#ff000022] backdrop-blur-md overflow-y-auto max-h-[50vh]"><p>{state.reading.answer}</p></div>
                <ReadingProvenancePanel reading={state.reading} />
                <button onClick={() => dispatch({ type: 'OPEN_ORACLE' })} className="w-full text-center text-sm font-header text-red-600 opacity-60 hover:opacity-100 hover:text-white transition-colors">NEW READING</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.focusedCard && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-xl overflow-y-auto native-scroll flex items-start justify-center pt-[calc(4rem+env(safe-area-inset-top))] sm:pt-[calc(6rem+env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[calc(6rem+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))]"
            style={{ perspective: '1200px' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <motion.div 
              key={state.focusedCard.id} 
              initial={reducedMotion ? { opacity: 0, scale: 0.95 } : { rotateY: 180, scale: 0.8, opacity: 0 }}
              animate={reducedMotion ? { opacity: 1, scale: 1 } : { rotateY: 0, scale: 1, opacity: 1 }}
              exit={reducedMotion ? { opacity: 0, scale: 0.95 } : { rotateY: -180, scale: 0.8, opacity: 0 }}
              transition={{ duration: reducedMotion ? 0.3 : 1.0, type: 'spring', bounce: 0.4 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative w-full max-w-4xl bg-black border-4 border-red-600 shadow-[0_0_100px_rgba(255,0,0,0.3)] p-6 sm:p-10 flex flex-col mb-auto"
            >
               <div className="hidden sm:flex absolute top-1/2 -left-16 -translate-y-1/2 cursor-pointer text-red-600/30 hover:text-red-600 transition-colors p-4" onClick={(e) => { e.stopPropagation(); handleSwipePrev(); }}>
                 <ChevronLeft size={64} />
               </div>
               <div className="hidden sm:flex absolute top-1/2 -right-16 -translate-y-1/2 cursor-pointer text-red-600/30 hover:text-red-600 transition-colors p-4" onClick={(e) => { e.stopPropagation(); handleSwipeNext(); }}>
                 <ChevronRight size={64} />
               </div>

              <div className="flex justify-between items-start mb-6 sm:mb-10 border-b-2 border-red-600/30 pb-4">
                <div className="flex-1 pr-4">
                  <h3 className="text-xl sm:text-4xl font-header text-[#e5c158] leading-tight uppercase neon-text break-words whitespace-normal">{state.focusedCard.name}</h3>
                  <p className="text-[8px] sm:text-[10px] font-header text-[#b8860b] mt-2 tracking-widest">PATINA FACTOR: {state.focusedCard.patina || 0}</p>
                </div>
                <button onClick={() => dispatch({ type: 'CLOSE_CARD' })} className="hover:text-white text-red-600 flex-shrink-0"><X size={32}/></button>
              </div>

              <div className="flex justify-center items-center gap-4 sm:hidden mb-4 opacity-50 font-header text-[8px] text-red-600/50">
                <button onClick={handleSwipePrev} className="p-2"><ChevronLeft size={16}/></button>
                <span>NAVIGATE</span>
                <button onClick={handleSwipeNext} className="p-2"><ChevronRight size={16}/></button>
              </div>

              <div className="flex flex-col md:flex-row gap-6 sm:gap-10">
                <div className="flex-shrink-0 w-full md:w-80 aspect-[2/3] bg-black border-2 border-[#b8860b] relative overflow-hidden shadow-[0_0_30px_#b8860b44] mx-auto md:mx-0 md:sticky md:top-4 h-max">
                  {state.focusedCard.imageUrl ? (
                    <>
                      <img src={state.focusedCard.imageUrl} className={`w-full h-full object-cover pixelated ${state.focusedCard.patina >= 10 ? 'grayscale sepia contrast-125' : ''}`} />
                      <ArcaneFrame element={normalizeElement(state.focusedCard.meta)} />
                    </>
                  ) : (
                    <CardSkeleton />
                  )}
                  {state.isForging && (
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-black/80 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-header text-red-600 animate-pulse text-center">{state.reforgeStatus || "FORGING ARCANUM..."}</span>
                    </div>
                  )}
                  {(state.focusedCard.patina >= 1) && <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-40 mix-blend-overlay pointer-events-none" />}
                </div>

                <div className="flex-1 min-w-0">
                  <RelicWorkspace
                    card={state.focusedCard}
                    tradition={state.selectedTradition}
                    isForging={state.isForging}
                    forgeStatus={state.reforgeStatus}
                    canFinalize={canFinalizeCard(state.focusedCard)}
                    canRefine={canRefineCard(state.focusedCard)}
                    onRemanifest={() => handleRetryCard(state.focusedCard)}
                    onFinalize={() => handleFinalizeCard(state.focusedCard)}
                    onRefine={() => handleRefineCard(state.focusedCard)}
                    onCopyPrompt={copyToClipboard}
                    copied={copied}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.isStatsOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] overflow-y-auto native-scroll">
            <div className="w-full max-w-2xl bg-black border-2 border-[#b8860b] shadow-[0_0_50px_rgba(184,134,11,0.2)] p-6 sm:p-8 my-auto">
              <div className="flex justify-between items-center mb-8 border-b-2 border-[#b8860b]/30 pb-4">
                 <h2 className="text-xl sm:text-2xl font-header text-[#b8860b]"><BarChart3 className="inline mr-3"/>ARCANE STATISTICS</h2>
                 <button onClick={() => dispatch({ type: 'TOGGLE_STATS' })}><X className="text-[#b8860b]"/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="border border-[#b8860b]/30 p-4 bg-[#b8860b]/5">
                  <h3 className="text-[10px] font-header text-[#b8860b]/50 mb-4">DOMINANT CARD</h3>
                  {getMostDrawn() ? (
                    <div className="text-center">
                      <p className="text-xl font-header text-[#e5c158] mb-2">{getMostDrawn().name}</p>
                      <p className="font-body text-[#b8860b]/70">Drawn {getMostDrawn().patina || 0} times</p>
                    </div>
                  ) : <p className="font-body opacity-50 text-[#b8860b]">Insufficient data.</p>}
                </div>

                <div className="border border-[#b8860b]/30 p-4 bg-[#b8860b]/5">
                   <h3 className="text-[10px] font-header text-[#b8860b]/50 mb-4">ALCHEMICAL STATE</h3>
                   <div className="text-center">
                      <p className="text-xl font-header text-[#e5c158] mb-2 uppercase">{getDominantStage()}</p>
                      <p className="font-body text-[#b8860b]/70">Current Frequency</p>
                   </div>
                </div>
              </div>

              <div className="border border-[#b8860b]/30 p-6 bg-[#b8860b]/5">
                 <h3 className="text-[10px] font-header text-[#b8860b]/50 mb-6 text-center">SPIRIT BOX ECHOES (WORD CLOUD)</h3>
                 <div className="flex flex-wrap justify-center gap-4 items-end h-32 overflow-hidden">
                   {getWordCloud().length > 0 ? getWordCloud().map(([word, count], i) => (
                      <span key={word} className="font-header text-[#e5c158]" style={{ fontSize: `${Math.max(10, 10 + count * 2)}px`, opacity: Math.max(0.4, 1 - (i * 0.15)) }}>
                        {word.toUpperCase()}
                      </span>
                   )) : <p className="font-body opacity-50 text-[#b8860b] w-full text-center self-center">No echoes recorded.</p>}
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.isSpiritBoxOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => dispatch({ type: 'TOGGLE_SPIRIT_BOX' })} className="fixed inset-0 bg-black/95 z-[80] backdrop-blur-md" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-x-0 bottom-0 h-[min(600px,80dvh)] max-h-[calc(100dvh-env(safe-area-inset-top))] bg-black border-t-4 border-red-600 z-[90] flex flex-col pt-4 pr-[max(1rem,env(safe-area-inset-right))] pb-[calc(1rem+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] shadow-[0_-10px_50px_rgba(255,0,0,0.2)]">
              <div className="flex justify-between items-center mb-4 border-b border-red-600/30 pb-2">
                <h3 className="font-header text-red-600">SPIRIT BOX // {state.author}</h3>
                <button onClick={() => dispatch({ type: 'TOGGLE_SPIRIT_BOX' })}><X className="text-red-600"/></button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto native-scroll space-y-4 p-4 font-body text-red-600">
                {state.spiritChat.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 border ${m.role === 'user' ? 'border-red-600 bg-red-600/10' : 'border-red-600/30'} break-words`}>{m.text}</div>
                  </div>
                ))}
                {state.isSpiritTyping && <div className="text-xs animate-pulse">SPIRIT TYPING...</div>}
              </div>
              <div className="flex gap-2 mt-4 flex-shrink-0">
                <button onClick={handleVoiceInput} className="p-3 bg-black border border-red-600 text-red-600 hover:bg-red-600 hover:text-black transition-colors flex-shrink-0" title="Vocal Input">
                   <Mic size={16}/>
                </button>
                <input 
                  ref={spiritInputRef}
                  value={state.spiritInput} 
                  onChange={(e) => dispatch({ type: 'SET_SPIRIT_INPUT', payload: e.target.value })} 
                  onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleSpiritMessage()}
                  enterKeyHint="send"
                  autoCapitalize="sentences"
                  autoCorrect="on"
                  placeholder="SPEAK TO THE VOID..." 
                  className="native-text-input flex-1 min-w-0 bg-black/40 border border-red-600 p-3 font-header text-red-600 focus:outline-none"
                />
                <button onClick={() => handleSpiritMessage()} className="p-3 bg-red-600 text-black hover:bg-white transition-colors flex-shrink-0"><Send size={16}/></button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {state.archiveState !== 'IDLE' && (
        <div className="fixed inset-0 z-[200] bg-black/98 flex flex-col items-center justify-center pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] text-center overflow-y-auto native-scroll">
           <div className="bg-black border-4 border-[#b8860b] p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(184,134,11,0.3)] relative my-auto">
             {state.archiveState === 'PROMPT' && (
               <>
                 <h3 className="text-xl sm:text-2xl font-header text-[#e5c158] mb-4">ARCHIVE OPTIONS</h3>
                 <p className="font-body text-[#b8860b] mb-8">{forgedCount} / 78 Cards Forged.</p>
                 <button onClick={handleHtmlArchive} className="w-full py-4 bg-[#b8860b] text-black font-header text-[10px] sm:text-sm hover:bg-white transition-colors mb-4 shadow-[0_0_15px_#b8860b]">
                   QUICK HTML ARCHIVE
                 </button>
                 <button onClick={handleJsonArchive} className="w-full py-4 border-2 border-[#b8860b] text-[#e5c158] font-header text-[10px] sm:text-sm hover:bg-[#b8860b] hover:text-black transition-colors mb-4">
                   EXPORT RESTORABLE JSON
                 </button>
                 <button onClick={handleRestoreJsonArchive} className="w-full py-4 border border-red-600/70 text-red-500 font-header text-[10px] sm:text-sm hover:bg-red-600 hover:text-black transition-colors mb-4">
                   RESTORE JSON ARCHIVE
                 </button>
                 <button onClick={handleGrandForge} className="w-full py-4 border-2 border-[#b8860b] text-[#e5c158] font-header text-[10px] sm:text-sm hover:bg-[#b8860b] hover:text-black transition-colors mb-4">
                   GRAND FORGE (Generate Missing)
                 </button>
                 <button onClick={() => dispatch({ type: 'RESET_ARCHIVE' })} className="font-header text-xs text-[#b8860b]/50 hover:text-red-600 uppercase mt-4">[ CANCEL ]</button>
               </>
             )}
             {state.archiveState === 'COMPILING' && (
               <>
                 <RefreshCw size={48} className="text-[#b8860b] mx-auto mb-6 animate-spin" />
                 <h3 className="text-lg sm:text-xl font-header text-[#e5c158] mb-4">THE GRAND FORGE</h3>
                 <div className="w-full h-4 border-2 border-[#b8860b] p-1 mb-4"><div className="h-full bg-[#b8860b] transition-all duration-300" style={{ width: `${(state.archiveProgress.current / (state.archiveProgress.total || 1)) * 100}%` }} /></div>
                 <p className="font-header text-[8px] sm:text-xs text-[#b8860b]/80 mb-2 truncate px-2">{state.archiveProgress.msg}</p>
                 <p className="font-header text-[10px] text-[#e5c158]">{state.archiveProgress.current} / {state.archiveProgress.total}</p>
                 <p className="text-[10px] text-red-600/80 mt-4 animate-pulse">MANIFESTING ALL CARDS. DO NOT CLOSE.</p>
               </>
             )}
             {state.archiveState === 'READY' && (
               <>
                 <FileDown size={64} className="text-[#e5c158] mx-auto mb-8 animate-bounce" />
                 <h3 className="text-xl sm:text-2xl font-header text-[#e5c158] mb-8">ARTIFACT READY</h3>
                 <button onClick={handleHtmlArchive} className="w-full py-4 bg-[#b8860b] text-black font-header text-sm hover:bg-white transition-colors mb-4 shadow-[0_0_15px_#b8860b]">
                   DOWNLOAD HTML + READING PROVENANCE
                 </button>
                 <button onClick={handleJsonArchive} className="w-full py-4 border-2 border-[#b8860b] text-[#e5c158] font-header text-[10px] sm:text-sm hover:bg-[#b8860b] hover:text-black transition-colors mb-4">
                   EXPORT RESTORABLE JSON
                 </button>
                 <button onClick={() => dispatch({ type: 'RESET_ARCHIVE' })} className="font-header text-xs text-[#b8860b]/50 hover:text-red-600 uppercase">[ CLOSE ]</button>
               </>
             )}
           </div>
        </div>
      )}
    </div>
  );
}
