export const APP_ROUTE_IDS = Object.freeze({
  app: 'app',
  vr: 'vr',
  tarotQa: 'tarot-qa',
  cardAuthorityQa: 'card-authority-qa',
  relicWorkspaceQa: 'relic-workspace-qa',
});

export const resolveAppRoute = ({ pathname = '/', search = '' } = {}) => {
  const params = new URLSearchParams(String(search || ''));
  const normalizedPath = String(pathname || '/');

  // Explicit QA paths/modes win over other route hints so copied QA URLs are
  // deterministic even if stale query parameters are present.
  if (normalizedPath.startsWith('/qa/relic-workspace') || params.get('mode') === 'relic-workspace-qa') {
    return APP_ROUTE_IDS.relicWorkspaceQa;
  }
  if (normalizedPath.startsWith('/qa/card-authority') || params.get('mode') === 'card-authority-qa') {
    return APP_ROUTE_IDS.cardAuthorityQa;
  }
  if (normalizedPath.startsWith('/qa/tarot') || params.get('mode') === 'tarot-qa') {
    return APP_ROUTE_IDS.tarotQa;
  }
  if (normalizedPath.startsWith('/vr') || params.get('mode') === 'vr') {
    return APP_ROUTE_IDS.vr;
  }
  return APP_ROUTE_IDS.app;
};
