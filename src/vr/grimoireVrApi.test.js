import { afterEach, describe, expect, it, vi } from 'vitest';
import { runGrimoireJob } from './grimoireVrApi.js';

const jsonResponse = (payload, status = 200) => new Response(JSON.stringify(payload), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

describe('runGrimoireJob', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('submits once and polls until the queued job is ready', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ jobId: 'ritual-7', status: 'queued' }))
      .mockResolvedValueOnce(jsonResponse({ jobId: 'ritual-7', status: 'running' }))
      .mockResolvedValueOnce(jsonResponse({ jobId: 'ritual-7', status: 'ready', output: 'complete' }));
    vi.stubGlobal('fetch', fetch);

    const output = await runGrimoireJob({
      startPath: '/api/text/start',
      statusPath: '/api/text/status',
      body: { prompt: 'arrange the courts' },
      pollMs: 0,
      readResult: result => result.output,
    });

    expect(output).toBe('complete');
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch.mock.calls.filter(([url]) => String(url).includes('/start'))).toHaveLength(1);
  });

  it('surfaces a failed job immediately instead of treating it as a tunnel outage', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ jobId: 'ritual-8', status: 'queued' }))
      .mockResolvedValueOnce(jsonResponse({ jobId: 'ritual-8', status: 'failed', error: 'model rejected prompt' }));
    vi.stubGlobal('fetch', fetch);

    await expect(runGrimoireJob({
      startPath: '/api/text/start',
      statusPath: '/api/text/status',
      body: { prompt: 'fail cleanly' },
      pollMs: 0,
      readResult: result => result.output,
    })).rejects.toThrow('model rejected prompt');

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
