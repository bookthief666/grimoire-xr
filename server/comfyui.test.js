import { describe, expect, it, vi } from 'vitest';
import { buildSdxlWorkflow, createComfyUiClient, createComfyUiConfig } from './comfyui.mjs';

const config = createComfyUiConfig({
  COMFYUI_BASE_URL: 'http://127.0.0.1:8188/',
  COMFYUI_CHECKPOINT: 'juggernautXL_ragnarokBy.safetensors',
  COMFYUI_WIDTH: '640',
  COMFYUI_HEIGHT: '960',
  COMFYUI_STEPS: '18',
  COMFYUI_CFG: '4',
  COMFYUI_SAMPLER: 'dpmpp_2m',
  COMFYUI_SCHEDULER: 'karras',
});

describe('ComfyUI SDXL integration', () => {
  it('builds the measured M2 portrait workflow', () => {
    const workflow = buildSdxlWorkflow({ prompt: 'occult tarot', seed: 42, config });
    expect(workflow['4'].inputs.ckpt_name).toBe('juggernautXL_ragnarokBy.safetensors');
    expect(workflow['5'].inputs).toMatchObject({ width: 640, height: 960, batch_size: 1 });
    expect(workflow['3'].inputs).toMatchObject({
      seed: 42,
      steps: 18,
      cfg: 4,
      sampler_name: 'dpmpp_2m',
      scheduler: 'karras',
    });
  });

  it('queues, polls, and retrieves a generated image', async () => {
    const fetchImpl = vi.fn(async (url, options = {}) => {
      if (url.endsWith('/prompt')) {
        const body = JSON.parse(options.body);
        expect(body.prompt['4'].inputs.ckpt_name).toBe(config.checkpoint);
        return new Response(JSON.stringify({ prompt_id: 'prompt-123' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (url.endsWith('/history/prompt-123')) {
        return new Response(JSON.stringify({
          'prompt-123': {
            status: { completed: true, messages: [] },
            outputs: {
              '9': { images: [{ filename: 'card.png', subfolder: '', type: 'output' }] },
            },
          },
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (url.includes('/view?')) {
        return new Response(Uint8Array.from([1, 2, 3]), {
          status: 200,
          headers: { 'Content-Type': 'image/png' },
        });
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    const client = createComfyUiClient({ config, fetchImpl, clientId: 'test-client' });
    const started = await client.start('occult tarot');
    expect(started.providerJobId).toBe('prompt-123');
    await expect(client.status(started.providerJobId)).resolves.toEqual({
      status: 'ready',
      imageUrl: 'data:image/png;base64,AQID',
    });
  });

  it('reports a running job while it is absent from history', async () => {
    const fetchImpl = vi.fn(async () => new Response('{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    const client = createComfyUiClient({ config, fetchImpl, clientId: 'test-client' });
    await expect(client.status('queued-job')).resolves.toEqual({ status: 'running' });
  });
});
