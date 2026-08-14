import { describe, expect, it } from 'vitest';
import { ATMOSPHERE_MODES } from './vrContent.js';
import { buildWristGrimoireModel, cycleAtmosphereMode } from './wristGrimoireModel.js';

describe('Wrist Grimoire model', () => {
  it('maps all seven courts in ritual order and marks active, complete, and next states', () => {
    const model = buildWristGrimoireModel({
      activeStationId: 'oracle',
      completedCourtIds: ['scriptorium', 'genius'],
    });
    expect(model.courts.map(court => court.id)).toEqual([
      'scriptorium', 'loom', 'genius', 'forge', 'oracle', 'spirit', 'archive',
    ]);
    expect(model.courts).toHaveLength(7);
    expect(model.activeCourt.id).toBe('oracle');
    expect(model.courts.find(court => court.id === 'genius').complete).toBe(true);
    expect(model.nextCourtId).toBe('loom');
    expect(model.completedCount).toBe(2);
  });

  it('reports honest provider, queue, operation, and demo states', () => {
    const live = buildWristGrimoireModel({
      health: {
        textConfigured: true,
        imageConfigured: false,
        resourceScheduler: { active: { kind: 'image' }, queueDepth: 3 },
      },
      status: { busy: true, error: false, label: 'FORGING' },
    });
    expect(live).toMatchObject({
      textGem: 'ready',
      imageGem: 'unavailable',
      queueDepth: 3,
      operationKind: 'IMAGE',
      busy: true,
    });
    const demo = buildWristGrimoireModel({ demoMode: true, health: null });
    expect(demo).toMatchObject({ textGem: 'demo', imageGem: 'demo', demoMode: true });
  });

  it('carries the authored current and warns when its deck is no longer bound', () => {
    const model = buildWristGrimoireModel({
      subject: 'The Memory of Rain',
      tradition: { name: 'Book of Thoth' },
      style: { name: '16-Bit Sovereign' },
      eros: { label: 'BOLD' },
      tech: { label: 'MAGUS' },
      ritualReady: false,
      invocationStale: true,
    });
    expect(model.current).toEqual({
      subject: 'The Memory of Rain',
      tradition: 'Book of Thoth',
      style: '16-Bit Sovereign',
      eros: 'BOLD',
      intellect: 'MAGUS',
      ready: false,
      stale: true,
    });
  });

  it('cycles the complete atmosphere catalog in both directions', () => {
    expect(cycleAtmosphereMode('adaptive', 1)).toBe(ATMOSPHERE_MODES[1].id);
    expect(cycleAtmosphereMode('adaptive', -1)).toBe(ATMOSPHERE_MODES.at(-1).id);
    expect(cycleAtmosphereMode(ATMOSPHERE_MODES.at(-1).id, 1)).toBe('adaptive');
    expect(cycleAtmosphereMode('foreign', 1)).toBe(ATMOSPHERE_MODES[1].id);
  });
});
