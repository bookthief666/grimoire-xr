const modeLabel = mode => {
  if (mode === 'refine') return 'REFINE';
  if (mode === 'final') return 'FINAL';
  return 'PREVIEW';
};

const positionLabel = value => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const describeJobProgress = (snapshot, { kind = 'image', mode = 'preview' } = {}) => {
  const status = snapshot?.status || 'queued';
  const queuePosition = positionLabel(snapshot?.queuePosition);

  if (status === 'reconnecting') {
    const attempt = positionLabel(snapshot?.attempt);
    return attempt ? `RECONNECTING · ATTEMPT ${attempt}/5` : 'RECONNECTING...';
  }

  if (status === 'queued') {
    return queuePosition
      ? `QUEUED · POSITION ${queuePosition}`
      : 'QUEUED FOR LOCAL AI...';
  }

  if (kind === 'text') {
    if (status === 'running') return 'GENERATING TEXT...';
    if (status === 'ready') return 'TEXT READY';
    if (status === 'failed') return 'TEXT GENERATION FAILED';
    return 'PREPARING TEXT MODEL...';
  }

  if (status === 'preparing') return 'PREPARING LOCAL GPU...';
  if (status === 'running') {
    if (mode === 'refine') return 'REFINING SOURCE IMAGE...';
    if (mode === 'final') return 'SAMPLING FINAL IMAGE...';
    return 'SAMPLING PREVIEW IMAGE...';
  }
  if (status === 'ready') return `${modeLabel(mode)} READY`;
  if (status === 'failed') return `${modeLabel(mode)} FAILED`;
  return `PREPARING ${modeLabel(mode)}...`;
};

export const formatJobTiming = timing => {
  const milliseconds = Number(timing?.elapsedMs);
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return '';
  const seconds = milliseconds / 1000;
  if (seconds < 10) return `${seconds.toFixed(1)}s`;
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return `${minutes}m ${remainder}s`;
};
