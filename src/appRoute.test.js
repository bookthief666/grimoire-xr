import { describe, expect, it } from 'vitest';
import { APP_ROUTE_IDS, resolveAppRoute } from './appRoute.js';

describe('application route resolution', () => {
  it('keeps ordinary application URLs on the 2D app', () => {
    expect(resolveAppRoute({ pathname: '/', search: '' })).toBe(APP_ROUTE_IDS.app);
    expect(resolveAppRoute({ pathname: '/archive', search: '?fixture=three-aces' })).toBe(APP_ROUTE_IDS.app);
  });

  it('preserves existing VR path and mode routing', () => {
    expect(resolveAppRoute({ pathname: '/vr', search: '' })).toBe(APP_ROUTE_IDS.vr);
    expect(resolveAppRoute({ pathname: '/', search: '?mode=vr' })).toBe(APP_ROUTE_IDS.vr);
  });

  it('routes the deterministic Tarot QA path and explicit mode', () => {
    expect(resolveAppRoute({ pathname: '/qa/tarot', search: '?fixture=three-aces' })).toBe(APP_ROUTE_IDS.tarotQa);
    expect(resolveAppRoute({ pathname: '/', search: '?mode=tarot-qa&fixture=major-gap' })).toBe(APP_ROUTE_IDS.tarotQa);
  });

  it('gives explicit Tarot QA selection precedence over stale VR hints', () => {
    expect(resolveAppRoute({ pathname: '/qa/tarot', search: '?mode=vr' })).toBe(APP_ROUTE_IDS.tarotQa);
    expect(resolveAppRoute({ pathname: '/vr', search: '?mode=tarot-qa' })).toBe(APP_ROUTE_IDS.tarotQa);
  });
});
