import { describe, expect, it, vi } from 'vitest';
import { createOllamaClient, createOllamaConfig } from './ollama.mjs';
import { getTextSchema, TEXT_TASKS } from './text-contract.mjs';

const config = createOllamaConfig({
  OLLAMA_BASE_URL: 'http://127.0.0.1:11434',
  OLLAMA_MODEL: 'qwen3:8b',
});

describe('Ollama structured outputs', () => {
  it('passes the JSON schema to Ollama and uses deterministic temperature', async () => {
    const schema = getTextSchema(TEXT_TASKS.oracle);
    const fetchImpl = vi.fn(async (_url, options) => {
      const body = JSON.parse(options.body);
      expect(body.format).toEqual(schema);
      expect(body.options.temperature).toBe(0);
      expect(body.prompt).toContain('Return only JSON matching this JSON Schema exactly');
      expect(body.prompt).toContain('"answer"');
      return new Response(JSON.stringify({ response: '{"answer":"The path is open."}' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const client = createOllamaClient({ config, fetchImpl });
    await expect(client.generate({
      prompt: 'Answer as an oracle.',
      isJson: true,
      schema,
    })).resolves.toEqual({ answer: 'The path is open.' });
  });
});
