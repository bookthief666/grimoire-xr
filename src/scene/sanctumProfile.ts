export function legacySanctumEnabled(
  search = typeof window === 'undefined' ? '' : window.location.search,
) {
  return new URLSearchParams(search).get('legacySanctum') === '1'
}
