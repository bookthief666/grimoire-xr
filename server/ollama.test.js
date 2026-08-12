import { describe, expect, it, vi } from 'vitest';
import { createOllamaClient, createOllamaConfig, parseOllamaJson } from './ollama.mjs';

const config = createOllamaConfig({
  OLLAMA_BASE_URL: 'http://127.0.0.1:11434/',
  OLLAMA_MODEL: 'qwen3:8b',
  OLLAMA_CONTEXT_LENGTH: '8192',
  OLLAMA_KEEP_ALIVE: '0',
});

describe('Ollama text provider', () => {
  it('uses bounded context, non-streaming JSON mode, and immediate unload', async () => {
    const fetchImpl = vi.fn(async (_url, options) => {
      const body = JSON.parse(options.body);
      expect(body).toMatchObject({
        model: 'qwen3:8b',
        stream: false,
        think: false,
        keep_alive: 0,
        format: 'json',
        options: { num_ctx: 8192, temperature: 0.2 },
      });
      return new Response(JSON.stringify({ response: '{"ok":true}' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const client = createOllamaClient({ config, fetchImpl });
    await expect(client.generate({ prompt: 'Return JSON', isJson: true }))
      .resolves.toEqual({ ok: true });
  });

  it('detects whether the configured model is installed', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({
      models: [{ name: 'qwen3:8b' }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const client = createOllamaClient({ config, fetchImpl });
    await expect(client.health()).resolves.toEqual({
      ready: true,
      model: 'qwen3:8b',
      installed: true,
    });
  });

  it('sends the documented zero keep-alive request when freeing memory', async () => {
    const fetchImpl = vi.fn(async (_url, options) => {
      expect(JSON.parse(options.body)).toEqual({
        model: 'qwen3:8b',
        stream: false,
        keep_alive: 0,
      });
      return new Response('{}', { status: 200 });
    });
    const client = createOllamaClient({ config, fetchImpl });
    await expect(client.unload()).resolves.toBeUndefined();
  });

  it('accepts a fenced JSON response without evaluating it', () => {
    expect(parseOllamaJson('```json\n{"cards":["The Fool"]}\n```'))
      .toEqual({ cards: ['The Fool'] });
  });
});
