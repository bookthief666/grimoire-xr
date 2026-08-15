import { describe, expect, it } from 'vitest';
import {
  GRIMOIRE_AI_PROTOCOL_VERSION,
  GRIMOIRE_PROMPT_SCHEMA,
  GRIMOIRE_STRUCTURED_TEXT_TASKS,
  buildApiContract,
  serializeJobTiming,
} from './api-contract.mjs';

describe('Grimoire AI API contract', () => {
  it('advertises the local ComfyUI and structured-text feature surface explicitly', () => {
    expect(buildApiContract({ textProvider: 'ollama', imageProvider: 'comfyui' })).toEqual({
      protocolVersion: GRIMOIRE_AI_PROTOCOL_VERSION,
      asyncJobs: true,
      jobMissingCode: 'JOB_MISSING',
      queueTelemetry: true,
      timingTelemetry: true,
      promptSchema: GRIMOIRE_PROMPT_SCHEMA,
      structuredTextTasks: [...GRIMOIRE_STRUCTURED_TEXT_TASKS],
      textProvider: 'ollama',
      imageProvider: 'comfyui',
      imageModes: ['preview', 'final', 'refine'],
      providerImageReference: true,
    });
  });

  it('does not claim refine support for non-Comfy image providers', () => {
    const contract = buildApiContract({ imageProvider: 'gemini' });
    expect(contract.imageModes).toEqual(['preview']);
    expect(contract.providerImageReference).toBe(false);
  });

  it('serializes useful live and terminal timing telemetry', () => {
    expect(serializeJobTiming({
      status: 'running',
      createdAt: 1_000,
      startedAt: 1_400,
    }, 2_000)).toEqual({
      timing: {
        createdAt: 1_000,
        startedAt: 1_400,
        queuedForMs: 400,
        runningForMs: 600,
        elapsedMs: 1_000,
        terminal: false,
      },
    });

    expect(serializeJobTiming({
      status: 'ready',
      createdAt: 1_000,
      startedAt: 1_400,
      completedAt: 2_500,
    }, 9_999).timing).toMatchObject({
      queuedForMs: 400,
      runningForMs: 1_100,
      elapsedMs: 1_500,
      terminal: true,
    });
  });
});
