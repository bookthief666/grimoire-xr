export const createGrimoireApiError = ({ payload, status }) => Object.assign(
  new Error(payload?.error || `Grimoire API failed (${status})`),
  {
    status: Number(status) || 0,
    code: typeof payload?.code === 'string' ? payload.code : null,
  },
);

export const isTerminalJobPollError = error => Number(error?.status) === 404;

export const jobInterruptedMessage = kind => {
  const label = kind === 'text' ? 'Text' : kind === 'image' ? 'Image' : 'Generation';
  return `${label} session was interrupted or expired. Retry the operation deliberately.`;
};

export const shouldRetryJobPoll = error => !isTerminalJobPollError(error);

export const jobKindFromStatusPath = statusPath => {
  if (String(statusPath).includes('/text/')) return 'text';
  if (String(statusPath).includes('/image/')) return 'image';
  return 'generation';
};
