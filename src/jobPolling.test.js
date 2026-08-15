import { describe, expect, it } from 'vitest';
import {
  isTerminalJobPollError,
  jobInterruptedMessage,
  shouldRetryJobPoll,
} from './jobPolling.js';

describe('job polling failure policy', () => {
  it('treats a missing server-side job as terminal', () => {
    const error = Object.assign(new Error('missing'), { status: 404 });
    expect(isTerminalJobPollError(error)).toBe(true);
    expect(shouldRetryJobPoll(error)).toBe(false);
  });

  it('keeps transient network and upstream failures retryable', () => {
    expect(shouldRetryJobPoll(new Error('network down'))).toBe(true);
    expect(shouldRetryJobPoll(Object.assign(new Error('bad gateway'), { status: 502 }))).toBe(true);
  });

  it('produces an explicit deliberate-retry message', () => {
    expect(jobInterruptedMessage('image')).toBe(
      'Image session was interrupted or expired. Retry the operation deliberately.',
    );
  });
});
