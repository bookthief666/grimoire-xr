import { describe, expect, it } from 'vitest';
import { createResourceScheduler } from './resource-scheduler.mjs';

const deferred = () => {
  let resolve;
  const promise = new Promise(next => { resolve = next; });
  return { promise, resolve };
};

describe('local AI resource scheduler', () => {
  it('runs Ollama and ComfyUI work one at a time in FIFO order', async () => {
    const scheduler = createResourceScheduler();
    const firstGate = deferred();
    const events = [];

    const text = scheduler.run('text', async () => {
      events.push('text:start');
      await firstGate.promise;
      events.push('text:end');
    }, { id: 'text-1' });
    const image = scheduler.run('image', async () => {
      events.push('image:start');
      events.push('image:end');
    }, { id: 'image-1' });

    await Promise.resolve();
    expect(events).toEqual(['text:start']);
    expect(scheduler.position('text-1')).toBe(0);
    expect(scheduler.position('image-1')).toBe(1);
    expect(scheduler.snapshot()).toMatchObject({
      active: { id: 'text-1', kind: 'text' },
      queueDepth: 1,
      queuedByKind: { image: 1 },
    });

    firstGate.resolve();
    await Promise.all([text, image]);
    expect(events).toEqual(['text:start', 'text:end', 'image:start', 'image:end']);
    expect(scheduler.snapshot().active).toBeNull();
  });

  it('rejects excess queued work with a recoverable service error', async () => {
    const scheduler = createResourceScheduler({ maximumQueued: 1 });
    const gate = deferred();
    const first = scheduler.run('text', () => gate.promise, { id: 'active' });
    const waiting = scheduler.run('image', async () => {}, { id: 'waiting' });

    await expect(scheduler.run('text', async () => {}, { id: 'overflow' }))
      .rejects.toMatchObject({ status: 503, code: 'AI_QUEUE_FULL' });

    gate.resolve();
    await Promise.all([first, waiting]);
  });
});
