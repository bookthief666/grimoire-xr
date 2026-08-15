import { describe, expect, it } from 'vitest';
import {
  createGrimoireApiError,
  isTerminalJobPollError,
  jobInterruptedMessage,
  jobKindFromStatusPath,
  shouldRetryJobPoll,
} from './jobPolling.js';

describe('job polling failure policy', () => {
  it('preserves HTTP status and API error metadata', () => {
    const error = createGrimoireApiError({
      payload: { error: 'Text job was not found or has expired.', code: 'JOB_MISSING' },
      status: 404,
    });

    expect(error.message).toBe('Text job was not found or has expired.');
    expect(error.status).toBe(404);
    expect(error.code).toBe('JOB_MISSING');
  });

  it('treats a missing server-side job as terminal', () => {
    const error = Object.assign(new Error('missing'), { status: 404 });
    expect(isTerminalJobPollError(error)).toBe(true);
    expect(shouldRetryJobPoll(error)).toBe(false);
  });

  it('keeps transient network and upstream failures retryable', () => {
    expect(shouldRetryJobPoll(new Error('network down'))).toBe(true);
    expect(shouldRetryJobPoll(Object.assign(new Error('bad gateway'), { status: 502 }))).toBe(true);
  });

  it('identifies text and image jobs from status routes', () => {
    expect(jobKindFromStatusPath('/api/text/status')).toBe('text');
    expect(jobKindFromStatusPath('/api/image/status')).toBe('image');
    expect(jobKindFromStatusPath('/api/other/status')).toBe('generation');
  });

  it('produces an explicit deliberate-retry message', () => {
    expect(jobInterruptedMessage('image')).toBe(
      'Image session was interrupted or expired. Retry the operation deliberately.',
    );
  });
});
