import { describe, expect, it } from 'vitest';
import { createMissingJobError, serializeApiError } from './job-errors.mjs';

describe('API job errors', () => {
  it('creates a stable missing-job code for text and image jobs', () => {
    const textError = createMissingJobError('Text');
    const imageError = createMissingJobError('Image');

    expect(textError).toMatchObject({ status: 404, code: 'JOB_MISSING' });
    expect(textError.message).toBe('Text job was not found or has expired.');
    expect(imageError.message).toBe('Image job was not found or has expired.');
  });

  it('serializes status, message, and optional code', () => {
    expect(serializeApiError(createMissingJobError('Text'))).toEqual({
      status: 404,
      payload: {
        error: 'Text job was not found or has expired.',
        code: 'JOB_MISSING',
      },
    });
  });

  it('falls back safely for unexpected errors', () => {
    expect(serializeApiError(new Error('boom'))).toEqual({
      status: 500,
      payload: { error: 'boom' },
    });
  });
});
