export const normalizeStyleQuery = value => String(value || '').trim().toLowerCase();

export const filterCodexStyles = ({ styles = [], query = '' } = {}) => {
  const normalized = normalizeStyleQuery(query);
  if (!normalized) return [...styles];
  return styles.filter(style => {
    const haystack = [style?.name, style?.id, style?.prompt]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });
};

export const codexStyleSelectionSummary = ({ selectedStyle, total = 0 } = {}) => ({
  id: selectedStyle?.id || null,
  name: selectedStyle?.name || 'NO STYLE SELECTED',
  total: Number.isFinite(Number(total)) ? Number(total) : 0,
});
