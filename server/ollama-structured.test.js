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

  it('repairs one semantically invalid known task instead of returning bad data', async () => {
    const goodCards = Array.from({ length: 78 }, (_, index) => `Card ${index + 1}`);
    const badCards = [...goodCards];
    badCards[77] = badCards[0];
    const responses = [
      { dossier: 'Dossier', cards: badCards, questions: ['One?', 'Two?', 'Three?'] },
      { dossier: 'Dossier', cards: goodCards, questions: ['One?', 'Two?', 'Three?'] },
    ];
    const fetchImpl = vi.fn(async (_url, options) => {
      const body = JSON.parse(options.body);
      if (fetchImpl.mock.calls.length === 2) {
        expect(body.prompt).toContain('previous structured result failed validation');
        expect(body.prompt).toContain('unique');
      }
      return new Response(JSON.stringify({ response: JSON.stringify(responses.shift()) }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const client = createOllamaClient({ config, fetchImpl });
    const prompt = 'List 78 Card Names. Include Oracle Suggestions. Return JSON.';
    const result = await client.generate({ prompt, isJson: true });
    expect(result.cards).toHaveLength(78);
    expect(new Set(result.cards).size).toBe(78);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
