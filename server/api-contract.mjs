export const GRIMOIRE_AI_PROTOCOL_VERSION = 1;
export const GRIMOIRE_PROMPT_SCHEMA = 'tarot-structured-v1';
export const GRIMOIRE_STRUCTURED_TEXT_TASKS = Object.freeze(['ritual', 'card', 'oracle']);

export const buildApiContract = ({
  textProvider = 'unknown',
  imageProvider = 'unknown',
} = {}) => {
  const comfy = imageProvider === 'comfyui';
  return {
    protocolVersion: GRIMOIRE_AI_PROTOCOL_VERSION,
    asyncJobs: true,
    jobMissingCode: 'JOB_MISSING',
    queueTelemetry: true,
    timingTelemetry: true,
    promptSchema: GRIMOIRE_PROMPT_SCHEMA,
    structuredTextTasks: [...GRIMOIRE_STRUCTURED_TEXT_TASKS],
    textProvider,
    imageProvider,
    imageModes: comfy ? ['preview', 'final', 'refine'] : ['preview'],
    providerImageReference: comfy,
  };
};

export const serializeJobTiming = (job, now = Date.now()) => {
  const createdAt = Number(job?.createdAt);
  if (!Number.isFinite(createdAt)) return {};

  const startedAt = Number(job?.startedAt);
  const completedAt = Number(job?.completedAt);
  const hasStarted = Number.isFinite(startedAt);
  const hasCompleted = Number.isFinite(completedAt);
  const terminal = job?.status === 'ready' || job?.status === 'failed';
  const end = hasCompleted ? completedAt : now;

  return {
    timing: {
      createdAt,
      ...(hasStarted ? { startedAt } : {}),
      ...(hasCompleted ? { completedAt } : {}),
      ...(hasStarted ? { queuedForMs: Math.max(0, startedAt - createdAt) } : {}),
      ...(hasStarted ? { runningForMs: Math.max(0, end - startedAt) } : {}),
      elapsedMs: Math.max(0, end - createdAt),
      terminal,
    },
  };
};
