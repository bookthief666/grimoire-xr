export const isTerminalJobPollError = error => Number(error?.status) === 404;

export const jobInterruptedMessage = kind => {
  const label = kind === 'text' ? 'Text' : kind === 'image' ? 'Image' : 'Generation';
  return `${label} session was interrupted or expired. Retry the operation deliberately.`;
};

export const shouldRetryJobPoll = error => !isTerminalJobPollError(error);
