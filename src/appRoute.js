export const APP_ROUTE_IDS = Object.freeze({
  app: 'app',
  vr: 'vr',
  tarotQa: 'tarot-qa',
});

export const resolveAppRoute = ({ pathname = '/', search = '' } = {}) => {
  const params = new URLSearchParams(String(search || ''));
  const normalizedPath = String(pathname || '/');

  // Explicit QA path/mode wins over other route hints so a copied QA URL is
  // deterministic even if stale query parameters are present.
  if (normalizedPath.startsWith('/qa/tarot') || params.get('mode') === 'tarot-qa') {
    return APP_ROUTE_IDS.tarotQa;
  }
  if (normalizedPath.startsWith('/vr') || params.get('mode') === 'vr') {
    return APP_ROUTE_IDS.vr;
  }
  return APP_ROUTE_IDS.app;
};
