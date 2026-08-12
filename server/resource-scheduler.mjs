import { randomUUID } from 'node:crypto';

const queueFullError = maximum => Object.assign(
  new Error(`The local AI queue is full (${maximum} waiting jobs). Try again after a job completes.`),
  { status: 503, code: 'AI_QUEUE_FULL' },
);

export const createResourceScheduler = ({ maximumQueued = 24, now = Date.now } = {}) => {
  const queue = [];
  let active = null;

  const snapshot = () => {
    const queuedByKind = {};
    for (const entry of queue) {
      queuedByKind[entry.kind] = (queuedByKind[entry.kind] || 0) + 1;
    }
    return {
      active: active
        ? {
            id: active.id,
            kind: active.kind,
            runningForMs: Math.max(0, now() - active.startedAt),
          }
        : null,
      queueDepth: queue.length,
      queuedByKind,
      maximumQueued,
    };
  };

  const position = id => {
    if (active?.id === id) return 0;
    const index = queue.findIndex(entry => entry.id === id);
    return index < 0 ? null : index + 1;
  };

  const drain = () => {
    if (active || queue.length === 0) return;
    const entry = queue.shift();
    active = {
      id: entry.id,
      kind: entry.kind,
      queuedAt: entry.queuedAt,
      startedAt: now(),
    };

    let released = false;
    entry.resolve({
      ...active,
      release() {
        if (released) return;
        released = true;
        if (active?.id === entry.id) active = null;
        queueMicrotask(drain);
      },
    });
  };

  const acquire = (kind, { id = randomUUID() } = {}) => {
    if (queue.length >= maximumQueued) return Promise.reject(queueFullError(maximumQueued));
    return new Promise(resolve => {
      queue.push({ id, kind, queuedAt: now(), resolve });
      drain();
    });
  };

  const run = async (kind, work, options = {}) => {
    const lease = await acquire(kind, options);
    try {
      return await work(lease);
    } finally {
      lease.release();
    }
  };

  return { acquire, position, run, snapshot };
};
