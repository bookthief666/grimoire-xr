import { ATMOSPHERE_MODES, PLANETARY_STATIONS } from './vrContent.js';
import { buildCourtJourney } from './vrJourney.js';

const normalizeId = value => String(value || '').trim().toLowerCase();

export const cycleAtmosphereMode = (currentMode, direction = 1) => {
  const currentIndex = Math.max(0, ATMOSPHERE_MODES.findIndex(mode => mode.id === currentMode));
  const step = Number(direction) < 0 ? -1 : 1;
  const nextIndex = ((currentIndex + step) % ATMOSPHERE_MODES.length + ATMOSPHERE_MODES.length)
    % ATMOSPHERE_MODES.length;
  return ATMOSPHERE_MODES[nextIndex].id;
};

export const buildWristGrimoireModel = (value = {}) => {
  const journey = buildCourtJourney(value.completedCourtIds);
  const activeStationId = PLANETARY_STATIONS.some(station => station.id === normalizeId(value.activeStationId))
    ? normalizeId(value.activeStationId)
    : 'scriptorium';
  const stationById = new Map(PLANETARY_STATIONS.map(station => [station.id, station]));
  const courts = journey.courts.map(court => {
    const station = stationById.get(court.id);
    return Object.freeze({
      id: court.id,
      planet: court.planet,
      glyph: court.glyph,
      concept: court.concept,
      title: station?.title || court.action,
      color: station?.color || '#d6b45b',
      active: court.id === activeStationId,
      complete: court.complete,
      next: court.id === journey.nextCourt?.id,
    });
  });
  const atmosphere = ATMOSPHERE_MODES.find(mode => mode.id === value.atmosphereMode)
    || ATMOSPHERE_MODES[0];
  const scheduler = value.health?.resourceScheduler;
  const busy = Boolean(value.status?.busy);
  const operationKind = scheduler?.active?.kind
    ? String(scheduler.active.kind).toUpperCase()
    : busy ? 'OPERATION' : 'IDLE';
  return Object.freeze({
    open: Boolean(value.open),
    courts: Object.freeze(courts),
    activeStationId,
    activeCourt: courts.find(court => court.active),
    completedCount: journey.completedCount,
    totalCourts: journey.total,
    sealed: journey.sealed,
    nextCourtId: journey.nextCourt?.id || null,
    busy,
    error: Boolean(value.status?.error),
    statusLabel: String(value.status?.label || 'ATRIUM READY'),
    queueDepth: Math.max(0, Number(scheduler?.queueDepth) || 0),
    operationKind,
    demoMode: Boolean(value.demoMode),
    audioEnabled: Boolean(value.audioEnabled),
    atmosphere: Object.freeze({ id: atmosphere.id, label: atmosphere.label }),
    current: Object.freeze({
      subject: String(value.subject || '').trim() || 'THE UNREMEMBERED NAME',
      tradition: String(value.tradition?.name || 'UNBOUND LINEAGE'),
      style: String(value.style?.name || 'UNBOUND AESTHETIC'),
      eros: String(value.eros?.label || 'OFF'),
      intellect: String(value.tech?.label || 'ADEPT'),
      ready: Boolean(value.ritualReady),
      stale: Boolean(value.invocationStale),
    }),
    textGem: value.demoMode
      ? 'demo'
      : value.health?.textConfigured ? 'ready' : value.health ? 'unavailable' : 'checking',
    imageGem: value.demoMode
      ? 'demo'
      : value.health?.imageConfigured ? 'ready' : value.health ? 'unavailable' : 'checking',
  });
};
