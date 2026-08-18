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

  it('routes the card authority QA surface independently', () => {
    expect(resolveAppRoute({ pathname: '/qa/card-authority', search: '' })).toBe(APP_ROUTE_IDS.cardAuthorityQa);
    expect(resolveAppRoute({ pathname: '/', search: '?mode=card-authority-qa' })).toBe(APP_ROUTE_IDS.cardAuthorityQa);
  });

  it('routes the relic workspace QA surface independently', () => {
    expect(resolveAppRoute({ pathname: '/qa/relic-workspace', search: '' })).toBe(APP_ROUTE_IDS.relicWorkspaceQa);
    expect(resolveAppRoute({ pathname: '/', search: '?mode=relic-workspace-qa' })).toBe(APP_ROUTE_IDS.relicWorkspaceQa);
  });

  it('routes the living relic QA surface independently', () => {
    expect(resolveAppRoute({ pathname: '/qa/living-relic', search: '' })).toBe(APP_ROUTE_IDS.livingRelicQa);
    expect(resolveAppRoute({ pathname: '/', search: '?mode=living-relic-qa' })).toBe(APP_ROUTE_IDS.livingRelicQa);
  });

  it('routes the living triad current QA surface independently', () => {
    expect(resolveAppRoute({ pathname: '/qa/living-current', search: '?fixture=three-aces' })).toBe(APP_ROUTE_IDS.livingTriadCurrentQa);
    expect(resolveAppRoute({ pathname: '/', search: '?mode=living-triad-current-qa&fixture=major-gap' })).toBe(APP_ROUTE_IDS.livingTriadCurrentQa);
  });

  it('gives explicit QA selection precedence over stale VR hints', () => {
    expect(resolveAppRoute({ pathname: '/qa/tarot', search: '?mode=vr' })).toBe(APP_ROUTE_IDS.tarotQa);
    expect(resolveAppRoute({ pathname: '/vr', search: '?mode=tarot-qa' })).toBe(APP_ROUTE_IDS.tarotQa);
    expect(resolveAppRoute({ pathname: '/qa/card-authority', search: '?mode=vr' })).toBe(APP_ROUTE_IDS.cardAuthorityQa);
    expect(resolveAppRoute({ pathname: '/qa/relic-workspace', search: '?mode=vr' })).toBe(APP_ROUTE_IDS.relicWorkspaceQa);
    expect(resolveAppRoute({ pathname: '/qa/living-relic', search: '?mode=vr' })).toBe(APP_ROUTE_IDS.livingRelicQa);
    expect(resolveAppRoute({ pathname: '/qa/living-current', search: '?mode=vr' })).toBe(APP_ROUTE_IDS.livingTriadCurrentQa);
  });
});
