export const createMissingJobError = kind => Object.assign(
  new Error(`${kind} job was not found or has expired.`),
  { status: 404, code: 'JOB_MISSING' },
);

export const serializeApiError = error => {
  const status = Number(error?.status) || 500;
  const message = error?.message || 'Unexpected server error.';
  const code = typeof error?.code === 'string' && error.code ? error.code : null;
  return {
    status,
    payload: {
      error: message,
      ...(code ? { code } : {}),
    },
  };
};
