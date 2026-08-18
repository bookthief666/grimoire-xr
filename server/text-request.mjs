import {
  TEXT_TASKS,
  inferTextTask,
  normalizeTextTask,
  validateStructuredTextResult,
} from './text-contract.mjs';

const fail = (message, status = 400, code = 'TEXT_REQUEST_INVALID') => {
  throw Object.assign(new Error(message), { status, code });
};

export const normalizeTextRequest = ({ prompt, isJson = true, task = null } = {}) => {
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 50_000) {
    fail('A prompt between 1 and 50,000 characters is required.');
  }
  const normalizedPrompt = prompt.trim();
  const json = Boolean(isJson);
  const requestedTask = task === null || task === undefined || task === ''
    ? null
    : normalizeTextTask(task);
  if (task && !requestedTask) fail(`Unsupported structured text task: ${task}.`);
  const inferredTask = json && !requestedTask ? inferTextTask(normalizedPrompt) : null;
  if (
    !requestedTask
    && inferredTask === TEXT_TASKS.ritual
    && /list\s+78\s+card\s+names/i.test(normalizedPrompt)
  ) {
    fail(
      'This ritual request uses the pre-v2 model-authored deck contract. Update the client so Tarot identity is constructed from the canonical manifest.',
      409,
      'TEXT_PROTOCOL_UPGRADE_REQUIRED',
    );
  }
  return {
    prompt: normalizedPrompt,
    isJson: json,
    task: requestedTask || inferredTask || null,
  };
};

export const validateProviderTextResult = ({ task = null, isJson = true } = {}, value) => {
  if (!isJson || !task) return value;
  return validateStructuredTextResult(task, value);
};
